// API URL สำหรับดึงข้อมูล
const API_URL = 'https://script.google.com/macros/s/AKfycbyXtVG1qygN73uep7DcFuTnygZquUd40qK3fyyN4bWpV8IOXXPFp94Is-QU99W0DdbM/exec';

document.addEventListener('DOMContentLoaded', function() {
    // ตัวแปรเก็บข้อมูลและสถานะ
    let allData = [];
    let policiesData = [];
    let filteredPolicies = [];
    let currentLanguage = 'TH';
    let currentPage = 1;
    const policiesPerPage = 9;
    
    // อ้างอิงถึง DOM elements
    const elements = {
        namePm: document.getElementById('name_pm'),
        languageToggle: document.getElementById('language-toggle'),
        languageText: document.getElementById('language-text'),
        enFlag: document.querySelector('.fi.fi-th'), // ธงอังกฤษอยู่ก่อน
        thFlag: document.querySelector('.fi.fi-gb'), // ธงไทยอยู่หลัง
        bannerTitle: document.getElementById('banner-title'),
        bannerBtnSecondary: document.getElementById('banner-btn-secondary'),
        policiesTitle: document.getElementById('policies-title'),
        policiesSubtitle: document.getElementById('policies-subtitle'),
        policySearch: document.getElementById('policy-search'),
        searchBtn: document.getElementById('search-btn'),
        ministryFilter: document.getElementById('ministry-filter'),
        policiesContainer: document.getElementById('policies-container'),
        pagination: document.getElementById('pagination'),
        prevPage: document.getElementById('prev-page'),
        nextPage: document.getElementById('next-page'),
        pageNumbers: document.getElementById('page-numbers'),
        totalPolicies: document.getElementById('total-policies'),
        thaiPolicies: document.getElementById('thai-policies'),
        englishPolicies: document.getElementById('english-policies')
    };
    
    // ฟังก์ชันดึงข้อมูลทั้งหมด
    async function fetchAllData() {
        try {
            showLoading(true);
            const response = await fetch(API_URL);
            allData = await response.json();
            
            // กรองและเตรียมข้อมูล
            preparePoliciesData();
            
            // อัพเดทเนื้อหา
            updateContent();
            
        } catch (error) {
            console.error('Error fetching data:', error);
            showError('ไม่สามารถโหลดข้อมูลนโยบายได้');
        }
    }
    
    // ฟังก์ชันเตรียมข้อมูลนโยบาย
    function preparePoliciesData() {
        // กรองเฉพาะข้อมูลนโยบายจากข้อมูลทั้งหมด
        const policyTypes = ['นโยบายรัฐบาล', 'Government Policy'];
        policiesData = allData.filter(item => 
            policyTypes.includes(item.type)
        );
        
        // กรองนโยบายตามภาษาปัจจุบัน
        filterPoliciesByLanguage();
        
        // อัพเดทตัวเลือกกระทรวง
        updateMinistryFilter();
        
        // อัพเดทสถิติ
        updateStats();
    }
    
    // ฟังก์ชันกรองนโยบายตามภาษา
    function filterPoliciesByLanguage() {
        filteredPolicies = policiesData.filter(item => item.lang === currentLanguage);
        currentPage = 1;
        displayPolicies();
    }
    
    // ฟังก์ชันอัพเดทเนื้อหาตามภาษาที่เลือก
    function updateContent() {
        // หาข้อมูลรัฐบาลล่าสุดตามภาษาปัจจุบัน
        const govTypes = currentLanguage === 'TH' ? ['รัฐบาลล่าสุด'] : ['Current government'];
        const currentGov = allData.find(item => 
            item.lang === currentLanguage && govTypes.includes(item.type)
        );
        
        // อัพเดทชื่อนายกฯ
        if (currentGov && elements.namePm) {
            elements.namePm.textContent = currentGov.name;
        }
        
        // อัพเดทข้อความปุ่มและส่วนอื่นๆ
        if (currentLanguage === 'TH') {
            if (elements.bannerTitle) {
                elements.bannerTitle.innerHTML = 'นโยบายรัฐบาล <span id="name_pm"></span>';
            }
            if (elements.bannerBtnSecondary) {
                elements.bannerBtnSecondary.textContent = 'ค้นหานโยบายรัฐบาล';
            }
            if (elements.languageText) {
                elements.languageText.textContent = 'EN'; // แสดง EN เมื่อภาษาปัจจุบันเป็นไทย
            }
            if (elements.policiesTitle) {
                elements.policiesTitle.textContent = 'นโยบายรัฐบาล';
            }
            if (elements.policiesSubtitle) {
                elements.policiesSubtitle.textContent = 'นโยบายและแนวทางในการบริหารประเทศ';
            }
            if (elements.policySearch) {
                elements.policySearch.placeholder = 'ค้นหานโยบาย...';
            }
            // อัพเดท flag icons - แสดงธงไทย, ซ่อนธงอังกฤษ
            if (elements.thFlag) {
                elements.thFlag.style.display = 'inline-block';
            }
            if (elements.enFlag) {
                elements.enFlag.style.display = 'none';
            }
        } else {
            if (elements.bannerTitle) {
                elements.bannerTitle.innerHTML = 'Government Policies <span id="name_pm"></span>';
            }
            if (elements.bannerBtnSecondary) {
                elements.bannerBtnSecondary.textContent = 'Search Government Policies';
            }
            if (elements.languageText) {
                elements.languageText.textContent = 'TH'; // แสดง TH เมื่อภาษาปัจจุบันเป็นอังกฤษ
            }
            if (elements.policiesTitle) {
                elements.policiesTitle.textContent = 'Government Policies';
            }
            if (elements.policiesSubtitle) {
                elements.policiesSubtitle.textContent = 'Policies and guidelines for national administration';
            }
            if (elements.policySearch) {
                elements.policySearch.placeholder = 'Search policies...';
            }
            // อัพเดท flag icons - แสดงธงอังกฤษ, ซ่อนธงไทย
            if (elements.thFlag) {
                elements.thFlag.style.display = 'none';
            }
            if (elements.enFlag) {
                elements.enFlag.style.display = 'inline-block';
            }
        }
        
        // กรองนโยบายตามภาษาที่เลือกใหม่
        filterPoliciesByLanguage();
        
        // อัพเดทตัวเลือกกระทรวง
        updateMinistryFilter();
    }
    
    // ฟังก์ชันอัพเดทตัวเลือกกระทรวง
    function updateMinistryFilter() {
        if (!elements.ministryFilter) return;
        
        // รวบรวมกระทรวงทั้งหมดจากข้อมูลนโยบาย
        const allMinistries = [];
        policiesData.forEach(policy => {
            if (policy.position && !allMinistries.includes(policy.position)) {
                allMinistries.push(policy.position);
            }
        });
        
        // สร้างตัวเลือกกระทรวง
        let options = `<option value="">${currentLanguage === 'TH' ? 'ทุกกระทรวง' : 'All Ministries'}</option>`;
        
        allMinistries.sort().forEach(ministry => {
            options += `<option value="${ministry}">${ministry}</option>`;
        });
        
        elements.ministryFilter.innerHTML = options;
    }
    
    // ฟังก์ชันกรองนโยบายตามการค้นหาและตัวกรอง
    function filterPolicies() {
        const searchTerm = elements.policySearch ? elements.policySearch.value.toLowerCase() : '';
        const ministry = elements.ministryFilter ? elements.ministryFilter.value : '';
        
        // กรองนโยบายตามภาษาปัจจุบันก่อน
        let filtered = policiesData.filter(item => item.lang === currentLanguage);
        
        // กรองตามการค้นหา
        if (searchTerm) {
            filtered = filtered.filter(policy => {
                const nameMatch = policy.name && policy.name.toLowerCase().includes(searchTerm);
                const positionMatch = policy.position && policy.position.toLowerCase().includes(searchTerm);
                const typeMatch = policy.type && policy.type.toLowerCase().includes(searchTerm);
                return nameMatch || positionMatch || typeMatch;
            });
        }
        
        // กรองตามกระทรวง
        if (ministry) {
            filtered = filtered.filter(policy => policy.position === ministry);
        }
        
        filteredPolicies = filtered;
        currentPage = 1;
        displayPolicies();
    }
    
    // ฟังก์ชันอัพเดทสถิติ
    function updateStats() {
        if (!elements.totalPolicies || !elements.thaiPolicies || !elements.englishPolicies) return;
        
        // นับนโยบายภาษาไทย
        const thaiPolicies = policiesData.filter(p => p.lang === 'TH').length;
        
        // นับนโยบายภาษาอังกฤษ
        const englishPolicies = policiesData.filter(p => p.lang === 'EN').length;
        
        // อัพเดทสถิติ
        elements.totalPolicies.textContent = policiesData.length / 2; // หาร 2 เพราะมีทั้งไทยและอังกฤษ
        elements.thaiPolicies.textContent = thaiPolicies;
        elements.englishPolicies.textContent = englishPolicies;
    }
    
    // ฟังก์ชันแสดงนโยบาย
    function displayPolicies() {
        if (!elements.policiesContainer) return;
        
        if (filteredPolicies.length === 0) {
            elements.policiesContainer.innerHTML = `
                <div class="no-results">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                    </svg>
                    <h3>${currentLanguage === 'TH' ? 'ไม่พบนโยบาย' : 'No policies found'}</h3>
                    <p>${currentLanguage === 'TH' ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรองดูสิ' : 'Try changing your search or filters'}</p>
                </div>
            `;
            if (elements.pagination) {
                elements.pagination.style.display = 'none';
            }
            return;
        }
        
        // คำนวณหน้า
        const totalPages = Math.ceil(filteredPolicies.length / policiesPerPage);
        const startIndex = (currentPage - 1) * policiesPerPage;
        const endIndex = Math.min(startIndex + policiesPerPage, filteredPolicies.length);
        const pagePolicies = filteredPolicies.slice(startIndex, endIndex);
        
        // สร้าง HTML สำหรับนโยบาย
        let html = '';
        
        pagePolicies.forEach(policy => {
            // กำหนดคลาสตามภาษาสำหรับไอคอน
            const langText = policy.lang === 'TH' ? 'ไทย' : 'EN';
            const langColor = policy.lang === 'TH' ? '#0d6efd' : '#dc3545';
            
            html += `
            <div class="policy-card">
                <div class="policy-header">
                    <div class="policy-type">
                        <span class="policy-type-badge">${policy.type}</span>
                        <span class="policy-lang-badge" style="background-color: ${langColor}">
                            ${langText}
                        </span>
                    </div>
                </div>
                
                <div class="policy-content">
                    <h4 class="policy-title">${policy.name || 'ไม่มีชื่อนโยบาย'}</h4>
                    <div class="policy-ministry">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z"/>
                            <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.606l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Z"/>
                        </svg>
                        ${policy.position || 'ไม่ระบุกระทรวง'}
                    </div>
                    
                    ${policy.time ? `
                    <div class="policy-date">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/>
                            <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/>
                        </svg>
                        ${policy.time}
                    </div>
                    ` : ''}
                </div>
                
                <div class="policy-footer">
                    <div class="policy-id">
                        ID: ${allData.indexOf(policy) + 1}
                    </div>
                    <div class="policy-language">
                        ${policy.lang === 'TH' ? 'ภาษาไทย' : 'English'}
                    </div>
                </div>
            </div>
            `;
        });
        
        elements.policiesContainer.innerHTML = html;
        
        // อัพเดท pagination
        updatePagination(totalPages);
    }
    
    // ฟังก์ชันอัพเดท pagination
    function updatePagination(totalPages) {
        if (!elements.pagination || !elements.prevPage || !elements.nextPage || !elements.pageNumbers) return;
        
        if (totalPages <= 1) {
            elements.pagination.style.display = 'none';
            return;
        }
        
        elements.pagination.style.display = 'flex';
        
        // อัพเดทปุ่มก่อนหน้า/ถัดไป
        elements.prevPage.disabled = currentPage === 1;
        elements.nextPage.disabled = currentPage === totalPages;
        
        // สร้างตัวเลขหน้า
        let pageNumbersHtml = '';
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            pageNumbersHtml += `<button class="page-number" data-page="1">1</button>`;
            if (startPage > 2) pageNumbersHtml += `<span class="page-dots">...</span>`;
        }
        
        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                pageNumbersHtml += `<span class="page-number active">${i}</span>`;
            } else {
                pageNumbersHtml += `<button class="page-number" data-page="${i}">${i}</button>`;
            }
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pageNumbersHtml += `<span class="page-dots">...</span>`;
            pageNumbersHtml += `<button class="page-number" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        elements.pageNumbers.innerHTML = pageNumbersHtml;
        
        // อัพเดทข้อความปุ่ม
        if (elements.prevPage) {
            elements.prevPage.textContent = currentLanguage === 'TH' ? '← ก่อนหน้า' : '← Previous';
        }
        if (elements.nextPage) {
            elements.nextPage.textContent = currentLanguage === 'TH' ? 'ถัดไป →' : 'Next →';
        }
        
        // เพิ่ม event listener ให้กับปุ่มหน้า
        document.querySelectorAll('.page-number[data-page]').forEach(button => {
            button.addEventListener('click', () => {
                currentPage = parseInt(button.dataset.page);
                displayPolicies();
            });
        });
    }
    
    // ฟังก์ชันแสดงโหลดดิ้ง
    function showLoading(show) {
        if (!elements.policiesContainer) return;
        
        if (show) {
            elements.policiesContainer.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>${currentLanguage === 'TH' ? 'กำลังโหลดนโยบาย...' : 'Loading policies...'}</p>
                </div>
            `;
        }
    }
    
    // ฟังก์ชันแสดงข้อผิดพลาด
    function showError(message) {
        if (!elements.policiesContainer) return;
        
        elements.policiesContainer.innerHTML = `
            <div class="error">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                </svg>
                <h3>${message}</h3>
                <button onclick="location.reload()" class="btn-retry">
                    ${currentLanguage === 'TH' ? 'ลองอีกครั้ง' : 'Try Again'}
                </button>
            </div>
        `;
    }
    
    // ฟังก์ชันสลับภาษา
    function toggleLanguage() {
        currentLanguage = currentLanguage === 'TH' ? 'EN' : 'TH';
        updateContent();
    }
    
    // Event Listeners
    if (elements.languageToggle) {
        elements.languageToggle.addEventListener('click', toggleLanguage);
    }
    
    if (elements.policySearch) {
        elements.policySearch.addEventListener('input', filterPolicies);
    }
    
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', filterPolicies);
    }
    
    if (elements.ministryFilter) {
        elements.ministryFilter.addEventListener('change', filterPolicies);
    }
    
    if (elements.prevPage) {
        elements.prevPage.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayPolicies();
            }
        });
    }
    
    if (elements.nextPage) {
        elements.nextPage.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredPolicies.length / policiesPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayPolicies();
            }
        });
    }
    
    // ดึงข้อมูลครั้งแรกเมื่อโหลดหน้า
    fetchAllData();
});