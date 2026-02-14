
    // รายการ API URLs
    const apiUrls = {
        api1: "https://script.google.com/macros/s/AKfycbw-Z5iGpqQ9iMa3GiMgf799A00EaPUYXxSAF_DbWZut5GkVMxTiKzPNKgFWNdsIF6A/exec",
        api2: "https://script.google.com/macros/s/AKfycbwYkwn150_gW013SgK5jzj88_GaIx4NdwMQWSOn7y0PMaP2NuoatpF_xanTm7fqYR1D/exec",
        // api3: "https://script.google.com/macros/s/AKfycbzcPyzzebNFO6BKCMUNzMvafFFBuB3QyYq3tyNQB5fTTjGnygKSZaMCIBSsS5_dWTmR/exec",
        api4: "https://script.google.com/macros/s/AKfycbyQNGLXDV3kQqiApt2iOPTT98WD902o7-gNXMvQDLjVXivrtQ_gYCpvOASen1I_MVqx/exec",
        api5: "https://script.google.com/macros/s/AKfycbxlg19QKXTeoAmin59Yl8FYkkg0A4UU2zDV5erc_c_DusAjsefVVSGEWoINdeKO14WkDQ/exec"
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
    async function loadDataFromApi(apiKey, apiUrl) {
        try {
            console.log(`กำลังโหลดข้อมูลจาก: ${apiKey}`);
            
            // ใช้วิธีการ fetch พร้อมกับ mode 'no-cors' หรือ 'cors' และจัดการให้เหมาะสม
            // สำหรับ Google Apps Script ที่เผยแพร่เป็นเว็บแอป ต้องใช้วิธีการที่ต่างออกไป
            
            // วิธีที่ 1: ใช้ JSONP สำหรับ Google Apps Script
            // หรือใช้ fetch พร้อมกับ cache busting
            const timestamp = new Date().getTime();
            const urlWithCache = `${apiUrl}?t=${timestamp}`;
            
            // ใช้ try-catch หลายวิธีในการดึงข้อมูล
            let data = null;
            
            // วิธีที่ 1: ลองใช้ fetch ปกติ
            try {
                const response = await fetch(urlWithCache, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                if (response.ok) {
                    const responseData = await response.json();
                    console.log(`โหลดข้อมูลจาก ${apiKey} สำเร็จ (วิธีที่ 1):`, responseData);
                    data = responseData;
                }
            } catch (error) {
                console.log(`วิธีที่ 1 ล้มเหลวสำหรับ ${apiKey}:`, error.message);
            }
            
            // วิธีที่ 2: ใช้ XMLHttpRequest สำหรับ fallback
            if (!data) {
                try {
                    data = await new Promise((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        xhr.open('GET', urlWithCache, true);
                        xhr.setRequestHeader('Accept', 'application/json');
                        
                        xhr.onload = function() {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                try {
                                    const parsedData = JSON.parse(xhr.responseText);
                                    console.log(`โหลดข้อมูลจาก ${apiKey} สำเร็จ (วิธีที่ 2):`, parsedData);
                                    resolve(parsedData);
                                } catch (parseError) {
                                    reject(new Error(`Failed to parse JSON: ${parseError.message}`));
                                }
                            } else {
                                reject(new Error(`HTTP error! status: ${xhr.status}`));
                            }
                        };
                        
                        xhr.onerror = function() {
                            reject(new Error('Network error occurred'));
                        };
                        
                        xhr.send();
                    });
                } catch (xhrError) {
                    console.log(`วิธีที่ 2 ล้มเหลวสำหรับ ${apiKey}:`, xhrError.message);
                }
            }
            
            // วิธีที่ 3: ใช้ JSONP สำหรับ Google Apps Script
            if (!data) {
                try {
                    data = await new Promise((resolve, reject) => {
                        const callbackName = `jsonpCallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                        
                        window[callbackName] = function(response) {
                            console.log(`โหลดข้อมูลจาก ${apiKey} สำเร็จ (วิธีที่ 3):`, response);
                            delete window[callbackName];
                            document.body.removeChild(script);
                            resolve(response);
                        };
                        
                        // ตั้งค่า timeout
                        const timeoutId = setTimeout(() => {
                            delete window[callbackName];
                            if (document.body.contains(script)) {
                                document.body.removeChild(script);
                            }
                            reject(new Error('JSONP timeout'));
                        }, 10000);
                        
                        const script = document.createElement('script');
                        script.src = `${apiUrl}?callback=${callbackName}`;
                        script.onerror = function() {
                            clearTimeout(timeoutId);
                            delete window[callbackName];
                            document.body.removeChild(script);
                            reject(new Error('JSONP script failed to load'));
                        };
                        
                        document.body.appendChild(script);
                    });
                } catch (jsonpError) {
                    console.log(`วิธีที่ 3 ล้มเหลวสำหรับ ${apiKey}:`, jsonpError.message);
                }
            }
            
            // ถ้าไม่สามารถดึงข้อมูลได้
            if (!data) {
                throw new Error(`ไม่สามารถดึงข้อมูลจาก ${apiKey} ได้`);
            }
            
            // เพิ่ม source เข้าไปในข้อมูล
            if (Array.isArray(data)) {
                return data.map(item => ({ ...item, source: apiKey }));
            }
            
            // หากข้อมูลเป็น object เดียว ให้แปลงเป็น array
            if (data && typeof data === 'object') {
                return [{ ...data, source: apiKey }];
            }
            
            return [];
        } catch (error) {
            console.error(`เกิดข้อผิดพลาดในการโหลดข้อมูลจาก ${apiKey}:`, error);
            // เก็บ error ไว้เพื่อแสดงใน UI
            return { error: true, source: apiKey, message: error.message };
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
                .map(checkbox => checkbox.dataset.api);
            
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
            const apiPromises = selectedApis.map(apiKey => {
                if (apiUrls[apiKey]) {
                    return loadDataFromApi(apiKey, apiUrls[apiKey]);
                }
                return Promise.resolve([]);
            });
            
            const results = await Promise.allSettled(apiPromises);
            
            // รวมข้อมูลจากทุก API
            allItems = [];
            const apiStatus = [];
            
            results.forEach((result, index) => {
                const apiKey = selectedApis[index];
                if (result.status === 'fulfilled') {
                    const apiData = result.value;
                    
                    // ตรวจสอบว่ามี error หรือไม่
                    if (apiData.error) {
                        apiStatus.push(`❌ ${apiKey}: ${apiData.message}`);
                        console.error(`API ${apiKey} มีข้อผิดพลาด:`, apiData.message);
                    } else if (Array.isArray(apiData) && apiData.length > 0) {
                        allItems = [...allItems, ...apiData];
                        apiStatus.push(`✅ ${apiKey}: พบ ${apiData.length} รายการ`);
                    } else {
                        apiStatus.push(`⚠️ ${apiKey}: ไม่พบข้อมูล`);
                    }
                } else {
                    apiStatus.push(`❌ ${apiKey}: โหลดข้อมูลไม่สำเร็จ`);
                    console.error(`API ${apiKey} ล้มเหลว:`, result.reason);
                }
            });
            
            // อัพเดทสถานะการโหลด
            document.getElementById('apiStatus').innerHTML = apiStatus.join('<br>');
            
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
                const itemType = item.type || item.dataset || '';
                return itemType.includes(currentFilter);
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
                (item.kpi && item.kpi.toLowerCase().includes(query))
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
        
        switch(sortType) {
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
            const resultItem = document.createElement('div');
            resultItem.className = 'advanced-search__item';
            
            // กำหนด badge ตามประเภท
            let badgeClass = 'badge-policy';
            let badgeText = item.type || 'ข้อมูล';
            
            if (item.type === 'โครงการ' || (item.dataset && item.dataset.includes('โครงการ'))) {
                badgeClass = 'badge-project';
            } else if (item.type === 'ข้อมูล' || (item.dataset && item.dataset.includes('ข้อมูล'))) {
                badgeClass = 'badge-dataset';
            }
            
            // กำหนด icon ตามประเภท
            let iconClass = 'icon-policy';
            if (item.type === 'ข้อมูล') {
                iconClass = 'icon-dataset';
            }
            
            // สร้าง HTML สำหรับรายการ
            resultItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h3 class="advanced-search__list-title">${item.name || 'ไม่มีชื่อ'}</h3>
                    <span class="badge ${badgeClass}">${badgeText}</span>
                </div>
                
                <div class="advanced-search__list-subtitle">
                    <span><i class="icon ${iconClass}"></i> ${item.dataset || 'ไม่ระบุชุดข้อมูล'}</span>
                    <span><i class="icon icon-department"></i> ${item.division || 'ไม่ระบุหน่วยงาน'}</span>
                    <span><i class="icon icon-calendar"></i> ${item.date || 'ไม่ระบุวันที่'}</span>
                    ${item.kpi ? `<span><strong>KPI:</strong> ${item.kpi}</span>` : ''}
                </div>
                
                <div class="advanced-search__list-details">
                    ${item.subdivision ? `<p><strong>หน่วยงานย่อย:</strong> ${item.subdivision}</p>` : ''}
                    ${item.policymakers ? `<p><strong>ผู้กำหนดนโยบาย:</strong> ${item.policymakers}</p>` : ''}
                </div>
                
                <div class="advanced-search__list-actions">
                    ${item.url || item.field_10 ? 
                        `<a href="${item.url || item.field_10}" target="_blank" class="btn btn-primary">
                            ดูเอกสาร
                        </a>` : 
                        `<button class="btn btn-secondary">ไม่มีเอกสารแนบ</button>`
                    }
                    <button class="btn btn-outline">ดูรายละเอียด</button>
                </div>
                
                <div class="api-source">แหล่งข้อมูล: ${item.source || 'ไม่ทราบแหล่ง'}</div>
            `;
            
            resultsContainer.appendChild(resultItem);
        });
        
        // ถ้าไม่มีผลลัพธ์
        if (items.length === 0) {
            noResultsElement.style.display = 'block';
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
        searchInput.addEventListener('input', function() {
            searchQuery = this.value.trim();
            currentPage = 1; // รีเซ็ตเป็นหน้าแรก
            
            // หน่วงเวลาเพื่อป้องกันการค้นหาบ่อยเกินไป
            clearTimeout(window.searchTimeout);
            window.searchTimeout = setTimeout(() => {
                applyFilterAndSearch();
                
                // อัพเดท URL
                const urlParams = new URLSearchParams(window.location.search);
                if (searchQuery) {
                    urlParams.set('keyword', searchQuery);
                } else {
                    urlParams.delete('keyword');
                }
                const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
                window.history.replaceState(null, '', newUrl);
            }, 500); // หน่วงเวลา 500ms
        });
        
        // การส่งฟอร์มค้นหา
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            searchQuery = searchInput.value.trim();
            currentPage = 1;
            applyFilterAndSearch();
        });
        
        // ฟิลเตอร์ประเภท
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.type;
                currentPage = 1;
                applyFilterAndSearch();
            });
        });
        
        // ตัวเลือก API
        apiCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                currentPage = 1;
                loadAllData();
            });
        });
        
        // การเรียงลำดับ
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            applyFilterAndSearch();
        });
    }
    
    // อ่าน query parameters จาก URL
    function readQueryParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('keyword') || urlParams.get('q');
        const type = urlParams.get('type');
        
        if (query) {
            searchInput.value = query;
            searchQuery = query;
        }
        
        if (type) {
            const typeButton = document.querySelector(`.filter-btn[data-type="${type}"]`);
            if (typeButton) {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                typeButton.classList.add('active');
                currentFilter = type;
            }
        }
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