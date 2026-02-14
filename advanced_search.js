// รายการ API URLs พร้อมประเภทที่ระบุ
const apiUrls = {
    api1: {
        url: "https://script.google.com/macros/s/AKfycbw-Z5iGpqQ9iMa3GiMgf799A00EaPUYXxSAF_DbWZut5GkVMxTiKzPNKgFWNdsIF6A/exec",
        type: "นโยบาย",
        name: "นโยบายรัฐบาล"
    },
    api2: {
        url: "https://script.google.com/macros/s/AKfycbwYkwn150_gW013SgK5jzj88_GaIx4NdwMQWSOn7y0PMaP2NuoatpF_xanTm7fqYR1D/exec",
        type: "โครงการ",
        name: "โครงการของรัฐ"
    },
    api3: {
        url: "https://script.google.com/macros/s/AKfycbzcPyzzebNFO6BKCMUNzMvafFFBuB3QyYq3tyNQB5fTTjGnygKSZaMCIBSsS5_dWTmR/exec",
        type: "เอกสาร",
        name: "รายงานการประชุม"
    },
    api4: {
        url: "https://script.google.com/macros/s/AKfycbyQNGLXDV3kQqiApt2iOPTT98WD902o7-gNXMvQDLjVXivrtQ_gYCpvOASen1I_MVqx/exec",
        type: "ชุดข้อมูล",
        name: "สถิติและตัวชี้วัด"
    },
    api5: {
        url: "https://script.google.com/macros/s/AKfycbxlg19QKXTeoAmin59Yl8FYkkg0A4UU2zDV5erc_c_DusAjsefVVSGEWoINdeKO14WkDQ/exec",
        type: "แผนพัฒนา",
        name: "แผนพัฒนา/นโยบาย"
    }
};

// ตัวแปรเก็บข้อมูลทั้งหมด
let allItems = [];
let currentFilter = "all";
let searchQuery = "";
let currentSort = "date_desc";
let currentPage = 1;
const itemsPerPage = 10;

// DOM Elements
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const loadingElement = document.getElementById('loading');
const errorContainer = document.getElementById('errorContainer');
const noResultsElement = document.getElementById('noResults');
const resultsCountElement = document.getElementById('resultsCount');
const filterButtons = document.querySelectorAll('.filter-btn');
const apiCheckboxes = document.querySelectorAll('.api-check');
const sortSelect = document.getElementById('sortSelect');
const paginationElement = document.getElementById('pagination');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumbersElement = document.getElementById('pageNumbers');

// ฟังก์ชันโหลดข้อมูลจาก Google Apps Script
async function loadDataFromApi(apiKey, apiInfo) {
    try {
        console.log(`กำลังโหลดข้อมูลจาก: ${apiKey} (${apiInfo.name})`);

        // เพิ่ม timestamp เพื่อหลีกเลี่ยง cache
        const timestamp = new Date().getTime();
        const urlWithCache = `${apiInfo.url}?t=${timestamp}`;

        // ใช้ fetch พร้อม with credentials สำหรับบางกรณี
        const response = await fetch(urlWithCache, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'omit'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // ถ้าไม่ใช่ JSON ให้ลองแปลงเป็น text ก่อน
            const textData = await response.text();
            try {
                data = JSON.parse(textData);
            } catch (parseError) {
                throw new Error(`Invalid JSON response: ${parseError.message}`);
            }
        }

        console.log(`โหลดข้อมูลจาก ${apiKey} สำเร็จ:`, data);

        // เพิ่ม source และประเภทเข้าไปในข้อมูล
        const processItem = (item) => {
            // กำหนดประเภทตามข้อมูลที่มีหรือตามประเภทของ API
            let itemType = item.type || item.dataset || apiInfo.type;

            // แปลงประเภทให้ตรงกับ categories ที่มี
            if (itemType.includes('นโยบาย') || itemType.includes('แผนพัฒนา')) {
                itemType = 'นโยบาย';
            } else if (itemType.includes('โครงการ')) {
                itemType = 'โครงการ';
            } else if (itemType.includes('สถิติ') || itemType.includes('ข้อมูล') || itemType.includes('ตัวชี้วัด')) {
                itemType = 'ชุดข้อมูล';
            } else if (itemType.includes('รายงาน') || itemType.includes('เอกสาร') || itemType.includes('หนังสือ')) {
                itemType = 'เอกสาร';
            }

            return {
                ...item,
                source: apiKey,
                sourceName: apiInfo.name,
                apiType: apiInfo.type,
                displayType: itemType
            };
        };

        if (Array.isArray(data)) {
            return data.map(processItem);
        }

        // หากข้อมูลเป็น object เดียว ให้แปลงเป็น array
        if (data && typeof data === 'object') {
            return [processItem(data)];
        }

        return [];
    } catch (error) {
        console.error(`เกิดข้อผิดพลาดในการโหลดข้อมูลจาก ${apiKey}:`, error);
        // เก็บ error ไว้เพื่อแสดงใน UI
        return {
            error: true,
            source: apiKey,
            sourceName: apiInfo.name,
            message: error.message
        };
    }
}

// โหลดข้อมูลจาก API ทั้งหมด
async function loadAllData() {
    loadingElement.style.display = 'block';
    errorContainer.style.display = 'none';
    resultsContainer.innerHTML = '';
    paginationElement.style.display = 'none';

    try {
        // ตรวจสอบว่า API ไหนถูกเลือก
        const selectedApis = Array.from(apiCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => {
                const apiKey = checkbox.dataset.api;
                return { apiKey, apiInfo: apiUrls[apiKey] };
            });

        if (selectedApis.length === 0) {
            throw new Error("กรุณาเลือกแหล่งข้อมูลอย่างน้อย 1 แหล่ง");
        }

        // แสดงสถานะการโหลด
        loadingElement.innerHTML = `
                <div>กำลังโหลดข้อมูลจาก ${selectedApis.length} แหล่ง...</div>
                <div style="margin-top: 10px; font-size: 14px; color: #666;">
                    <div id="apiStatus"></div>
                </div>
            `;

        // โหลดข้อมูลจาก API ที่เลือก
        const apiPromises = selectedApis.map(({ apiKey, apiInfo }) => {
            return loadDataFromApi(apiKey, apiInfo);
        });

        const results = await Promise.allSettled(apiPromises);

        // รวมข้อมูลจากทุก API
        allItems = [];
        const apiStatus = [];

        results.forEach((result, index) => {
            const { apiKey, apiInfo } = selectedApis[index];
            if (result.status === 'fulfilled') {
                const apiData = result.value;

                // ตรวจสอบว่ามี error หรือไม่
                if (apiData.error) {
                    apiStatus.push(`❌ ${apiInfo.name}: ${apiData.message}`);
                    console.error(`API ${apiKey} มีข้อผิดพลาด:`, apiData.message);
                } else if (Array.isArray(apiData) && apiData.length > 0) {
                    allItems = [...allItems, ...apiData];
                    apiStatus.push(`✅ ${apiInfo.name}: พบ ${apiData.length} รายการ`);
                } else {
                    apiStatus.push(`⚠️ ${apiInfo.name}: ไม่พบข้อมูล`);
                }
            } else {
                apiStatus.push(`❌ ${apiInfo.name}: โหลดข้อมูลไม่สำเร็จ`);
                console.error(`API ${apiKey} ล้มเหลว:`, result.reason);
            }
        });

        // อัพเดทสถานะการโหลด
        if (document.getElementById('apiStatus')) {
            document.getElementById('apiStatus').innerHTML = apiStatus.join('<br>');
        }

        console.log('ข้อมูลทั้งหมดที่โหลดได้:', allItems);

        // ถ้ามีข้อมูลบางส่วนโหลดสำเร็จ แต่บางส่วนล้มเหลว
        const failedApis = apiStatus.filter(status => status.includes('❌')).length;
        if (failedApis > 0 && allItems.length === 0) {
            throw new Error(`ไม่สามารถโหลดข้อมูลจาก ${failedApis} แหล่งได้`);
        } else if (failedApis > 0) {
            // แสดง warning ถ้ามีบาง API ล้มเหลวแต่ยังมีข้อมูลอยู่
            errorContainer.style.display = 'block';
            errorContainer.style.backgroundColor = '#fff3cd';
            errorContainer.style.color = '#856404';
            errorContainer.style.border = '1px solid #ffeaa7';
            errorContainer.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="font-size: 20px;">⚠️</div>
                        <div>
                            <strong>แจ้งเตือน:</strong> ไม่สามารถโหลดข้อมูลจาก ${failedApis} แหล่งได้ 
                            แต่ยังมีข้อมูล ${allItems.length} รายการจากแหล่งอื่น
                        </div>
                    </div>
                `;
        }

        // แสดงผลข้อมูล
        applyFilterAndSearch();

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
        errorContainer.style.display = 'block';
        errorContainer.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
    } finally {
        loadingElement.style.display = 'none';
    }
}

// กรองและค้นหาข้อมูล
function applyFilterAndSearch() {
    let filteredItems = allItems;

    // กรองข้อมูลตามประเภท
    if (currentFilter !== 'all') {
        filteredItems = filteredItems.filter(item => {
            // ใช้ displayType ที่กำหนดไว้
            return item.displayType === currentFilter;
        });
    }

    // กรองข้อมูลตามคำค้นหา
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredItems = filteredItems.filter(item =>
            (item.name && item.name.toLowerCase().includes(query)) ||
            (item.dataset && item.dataset.toLowerCase().includes(query)) ||
            (item.division && item.division.toLowerCase().includes(query)) ||
            (item.subdivision && item.subdivision.toLowerCase().includes(query)) ||
            (item.kpi && item.kpi.toLowerCase().includes(query)) ||
            (item.policymakers && item.policymakers.toLowerCase().includes(query))
        );
    }

    // เรียงลำดับข้อมูล
    filteredItems = sortItems(filteredItems, currentSort);

    // แสดงจำนวนผลลัพธ์
    resultsCountElement.textContent = filteredItems.length;

    // แสดงผลการค้นหา
    displayResults(filteredItems);

    // แสดง pagination ถ้ามีข้อมูลมากกว่า itemsPerPage
    setupPagination(filteredItems);
}

// เรียงลำดับข้อมูล
function sortItems(items, sortType) {
    const sortedItems = [...items];

    switch (sortType) {
        case 'date_desc':
            return sortedItems.sort((a, b) => parseThaiDate(b.date) - parseThaiDate(a.date));
        case 'date_asc':
            return sortedItems.sort((a, b) => parseThaiDate(a.date) - parseThaiDate(b.date));
        case 'name':
            return sortedItems.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'th'));
        case 'name_desc':
            return sortedItems.sort((a, b) => (b.name || '').localeCompare(a.name || '', 'th'));
        default:
            return sortedItems;
    }
}

// แปลงวันที่ไทยเป็น Date object
function parseThaiDate(thaiDate) {
    if (!thaiDate) return new Date(0);

    // แปลง พ.ศ. เป็น ค.ศ.
    const thaiYearRegex = /(\d{1,2})\s*(?:มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s*(\d{4})/;
    const match = thaiDate.match(thaiYearRegex);

    if (match) {
        const day = parseInt(match[1]);
        const month = getMonthNumber(match[2]);
        const year = parseInt(match[3]) - 543; // แปลง พ.ศ. เป็น ค.ศ.
        return new Date(year, month, day);
    }

    return new Date(0);
}

// ฟังก์ชันช่วยแปลงชื่อเดือนเป็นตัวเลข
function getMonthNumber(monthName) {
    const months = {
        'มกราคม': 0, 'กุมภาพันธ์': 1, 'มีนาคม': 2, 'เมษายน': 3,
        'พฤษภาคม': 4, 'มิถุนายน': 5, 'กรกฎาคม': 6, 'สิงหาคม': 7,
        'กันยายน': 8, 'ตุลาคม': 9, 'พฤศจิกายน': 10, 'ธันวาคม': 11
    };
    return months[monthName] || 0;
}

// แสดงผลข้อมูล
function displayResults(items) {
    resultsContainer.innerHTML = '';

    // คำนวณข้อมูลสำหรับ pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = items.slice(startIndex, endIndex);

    // สร้างการ์ดสำหรับแต่ละรายการ
    pageItems.forEach(item => {
        const resultItem = document.createElement('li');
        resultItem.className = 'advanced-search__list-item';

        // กำหนด badge ตามประเภท
        let badgeClass = 'badge-policy';
        let badgeText = item.displayType || item.type || 'ข้อมูล';

        if (badgeText === 'โครงการ') {
            badgeClass = 'badge-project';
        } else if (badgeText === 'ชุดข้อมูล') {
            badgeClass = 'badge-dataset';
        } else if (badgeText === 'เอกสาร') {
            badgeClass = 'badge-policy';
        }

        // กำหนด icon ตามประเภท
        let iconClass = 'icon-policy';
        if (badgeText === 'ชุดข้อมูล') {
            iconClass = 'icon-dataset';
        } else if (badgeText === 'เอกสาร') {
            iconClass = 'icon-policy';
        }

        // HTML ของแต่ละ li
        resultItem.innerHTML = `
            <div style="display: grid; justify-content: space-between; align-items: flex-start;">
                <h3 class="advanced-search__list-title">
                    ${item.name || 'ไม่มีชื่อ'}
                </h3>
                <span class="badge ${badgeClass}">
                    ${badgeText}
                </span>
            </div>

            <div class="advanced-search__list-subtitle">
                <span>
                    <i class="icon ${iconClass}"></i>
                    ${item.dataset || item.sourceName || 'ไม่ระบุชุดข้อมูล'}
                </span>
                <span>
                    <i class="icon icon-department"></i>
                    ${item.division || 'ไม่ระบุหน่วยงาน'}
                </span>
                <span>
                    <i class="icon icon-calendar"></i>
                    ${item.date || 'ไม่ระบุวันที่'}
                </span>
                ${item.kpi ? `<span><strong>&nbsp;KPI&nbsp;:&nbsp;</strong> ${item.kpi}</span>` : ''}
            </div>

            <div class="advanced-search__list-details">
                ${item.subdivision ? `<p><strong>หน่วยงานย่อย:</strong> ${item.subdivision}</p>` : ''}
                ${item.policymakers ? `<p><strong>ผู้กำหนดนโยบาย:</strong> ${item.policymakers}</p>` : ''}
                ${item.apiType ? `<p><strong>ประเภทแหล่งข้อมูล:</strong> ${item.apiType}</p>` : ''}
            </div>

            <div class="advanced-search__list-actions">
                ${
                    item.url || item.field_10
                        ? `<a href="${item.url || item.field_10}" target="_blank" class="btn btn-primary">
                            ดูเอกสาร
                        </a>`
                        : `<button class="btn btn-secondary" disabled>
                            ไม่มีเอกสารแนบ
                        </button>`
                }
                <!--<button class="btn btn-outline" onclick="showDetails('${item.name || ''}')">
                    ดูรายละเอียด
                </button>-->
            </div>

            <div class="api-source">
                แหล่งข้อมูล: ${item.sourceName || item.source || 'ไม่ทราบแหล่ง'}
            </div>
        `;

        resultsContainer.appendChild(resultItem);
    });


    // ถ้าไม่มีผลลัพธ์
    if (items.length === 0) {
        noResultsElement.style.display = 'block';
        noResultsElement.innerHTML = `
                <p>ไม่พบผลการค้นหา</p>
                <p>ลองเปลี่ยนคำค้นหาหรือลองค้นหาใหม่ด้วยคำที่เกี่ยวข้อง</p>
                ${searchQuery ? `<p>คำค้นหา: <strong>"${searchQuery}"</strong></p>` : ''}
                ${currentFilter !== 'all' ? `<p>ประเภท: <strong>"${currentFilter}"</strong></p>` : ''}
            `;
    } else {
        noResultsElement.style.display = 'none';
    }
}

// ตั้งค่า pagination
function setupPagination(items) {
    const totalPages = Math.ceil(items.length / itemsPerPage);

    if (totalPages <= 1) {
        paginationElement.style.display = 'none';
        return;
    }

    paginationElement.style.display = 'flex';

    // สร้างเลขหน้า
    pageNumbersElement.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            applyFilterAndSearch();
        });
        pageNumbersElement.appendChild(pageBtn);
    }

    // ปุ่มก่อนหน้า
    prevPageBtn.disabled = currentPage === 1;
    prevPageBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            applyFilterAndSearch();
        }
    };

    // ปุ่มถัดไป
    nextPageBtn.disabled = currentPage === totalPages;
    nextPageBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            applyFilterAndSearch();
        }
    };
}

// ตั้งค่า Event Listeners
function setupEventListeners() {
    // การค้นหา (ไม่ต้องกด Enter)
    searchInput.addEventListener('input', function () {
        searchQuery = this.value.trim();
        currentPage = 1; // รีเซ็ตเป็นหน้าแรก

        // หน่วงเวลาเพื่อป้องกันการค้นหาบ่อยเกินไป
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            applyFilterAndSearch();

            // อัพเดท URL
            const urlParams = new URLSearchParams(window.location.search);
            if (searchQuery) {
                urlParams.set('q', searchQuery);
            } else {
                urlParams.delete('q');
            }
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.replaceState(null, '', newUrl);
        }, 500); // หน่วงเวลา 500ms
    });

    // การส่งฟอร์มค้นหา
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        searchQuery = searchInput.value.trim();
        currentPage = 1;
        applyFilterAndSearch();
    });

    // ฟิลเตอร์ประเภท - อัพเดทปุ่มตามประเภท API
    const filterContainer = document.querySelector('.search-filters');
    if (filterContainer) {
        filterContainer.innerHTML = `
                <button class="filter-btn active" data-type="all">ทั้งหมด</button>
                <button class="filter-btn" data-type="นโยบาย">นโยบาย</button>
                <button class="filter-btn" data-type="โครงการ">โครงการ</button>
                <button class="filter-btn" data-type="ชุดข้อมูล">ชุดข้อมูล</button>
                <button class="filter-btn" data-type="เอกสาร">เอกสาร</button>
            `;

        // Re-attach event listeners
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', function () {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.type;
                currentPage = 1;
                applyFilterAndSearch();
            });
        });
    }

    // ตัวเลือก API - อัพเดท checkbox ตามข้อมูล API
    const apiSelector = document.querySelector('.api-selector');
    if (apiSelector) {
        apiSelector.innerHTML = '';

        Object.keys(apiUrls).forEach(apiKey => {
            const apiInfo = apiUrls[apiKey];
            const label = document.createElement('label');
            label.className = 'api-checkbox';
            label.innerHTML = `
                    <input type="checkbox" class="api-check" data-api="${apiKey}" checked>
                    <span>${apiInfo.name} (${apiInfo.type})</span>
                `;
            apiSelector.appendChild(label);
        });

        // Re-attach event listeners
        document.querySelectorAll('.api-check').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                currentPage = 1;
                loadAllData();
            });
        });
    }

    // การเรียงลำดับ
    sortSelect.addEventListener('change', function () {
        currentSort = this.value;
        applyFilterAndSearch();
    });
}

// อ่าน query parameters จาก URL
function readQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || urlParams.get('q');
    const type = urlParams.get('type');

    if (query) {
        searchInput.value = query;
        searchQuery = query;
    }

    if (type) {
        const typeButton = document.querySelector(`.filter-btn[data-type="${type}"]`);
        if (typeButton) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            typeButton.classList.add('active');
            currentFilter = type;
        }
    }
}

// ฟังก์ชันแสดงรายละเอียด
function showDetails(itemName) {
    alert(`ดูรายละเอียด: ${itemName}\n\nฟังก์ชันนี้สามารถพัฒนาเพิ่มเติมเพื่อแสดงข้อมูลเพิ่มเติมได้`);
}

// เริ่มต้นแอปพลิเคชัน
async function init() {
    setupEventListeners();
    readQueryParams();

    try {
        await loadAllData();
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการเริ่มต้นแอปพลิเคชัน:', error);
    }
}

// เริ่มต้นแอปพลิเคชันเมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', init);
