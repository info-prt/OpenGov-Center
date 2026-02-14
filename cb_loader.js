// API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbyXtVG1qygN73uep7DcFuTnygZquUd40qK3fyyN4bWpV8IOXXPFp94Is-QU99W0DdbM/exec';

// Initial state
let currentLanguage = 'TH';
let cabinetData = [];
let groupedMembers = {};

// DOM Elements
const elements = {
    // Banner elements
    nameCb: document.getElementById('name_cb'),
    numberCb: document.getElementById('number_cb'),
    languageToggle: document.getElementById('language-toggle'),
    languageText: document.getElementById('language-text'),
    thFlag: document.querySelector('.fi.fi-th'),
    enFlag: document.querySelector('.fi.fi-gb'),

    // Content sections
    cabinetInfo: document.getElementById('cabinet-info'),
    cabinetMembersSection: document.getElementById('cabinet-members-section'),
    loadingContainer: document.getElementById('loading-container'),
    errorContainer: document.getElementById('error-container'),

    // Cabinet info elements
    cabinetPeriod: document.getElementById('cabinet-period'),
    totalMembers: document.getElementById('total-members'),
    lastUpdate: document.getElementById('last-update'),

    // Text elements for language switching
    periodLabel: document.getElementById('period-label'),
    totalMembersLabel: document.getElementById('total-members-label'),
    lastUpdateLabel: document.getElementById('last-update-label'),
    membersTitle: document.getElementById('members-title'),
    cabinetPeriodTitle: document.getElementById('cabinet-period-title'),

    // Containers
    membersContainer: document.getElementById('members-container'),
    loadingText: document.getElementById('loading-text'),
    errorTitle: document.getElementById('error-title'),
    errorMessage: document.getElementById('error-message'),
    retryBtn: document.getElementById('retry-btn')
};

// Text translations
const translations = {
    TH: {
        cabinet: 'คณะรัฐมนตรี',
        cabinetNumber: 'คณะรัฐมนตรี คณะที่',
        periodTitle: 'วาระการดำรงตำแหน่ง',
        periodLabel: 'ระยะเวลา',
        totalMembersLabel: 'จำนวนสมาชิก',
        lastUpdateLabel: 'อัปเดตล่าสุด',
        membersTitle: 'สมาชิกคณะรัฐมนตรี',
        loading: 'กำลังโหลดข้อมูลคณะรัฐมนตรี...',
        errorTitle: 'เกิดข้อผิดพลาด',
        errorMessage: 'ไม่สามารถโหลดข้อมูลได้ในขณะนี้',
        retryBtn: 'ลองอีกครั้ง',
        primeMinister: 'นายกรัฐมนตรี',
        deputyPrimeMinister: 'รองนายกรัฐมนตรี',
        minister: 'รัฐมนตรีว่าการ',
        deputyMinister: 'รัฐมนตรีช่วยว่าการ'
    },
    EN: {
        cabinet: 'Cabinet',
        cabinetNumber: 'Cabinet No.',
        periodTitle: 'Term of Office',
        periodLabel: 'Term',
        totalMembersLabel: 'Total Members',
        lastUpdateLabel: 'Last Updated',
        membersTitle: 'Cabinet Members',
        loading: 'Loading cabinet data...',
        errorTitle: 'Error',
        errorMessage: 'Unable to load data at this time',
        retryBtn: 'Try Again',
        primeMinister: 'Prime Minister',
        deputyPrimeMinister: 'Deputy Prime Minister',
        minister: 'Minister',
        deputyMinister: 'Deputy Minister'
    }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    fetchCabinetData();
});

function setupEventListeners() {
    // Language toggle
    if (elements.languageToggle) {
        elements.languageToggle.addEventListener('click', toggleLanguage);
    }

    // Retry button
    if (elements.retryBtn) {
        elements.retryBtn.addEventListener('click', fetchCabinetData);
    }
}

async function fetchCabinetData() {
    try {
        showLoading(true);
        showError(false);

        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        cabinetData = await response.json();

        if (!Array.isArray(cabinetData) || cabinetData.length === 0) {
            throw new Error('Invalid data format');
        }

        processCabinetData();
        updateContent();
        showLoading(false);

    } catch (error) {
        console.error('Error fetching cabinet data:', error);
        showLoading(false);
        showError(true, error.message);
    }
}

function processCabinetData() {
    // Group members by position type for current language
    groupedMembers = {};

    const filteredData = cabinetData.filter(item => item.lang === currentLanguage);

    filteredData.forEach(item => {
        if (!groupedMembers[item.type]) {
            groupedMembers[item.type] = [];
        }
        groupedMembers[item.type].push(item);
    });
}

function updateContent() {
    updateLanguageButton();
    updateCabinetInfo();
    updateCabinetMembers();
}

function updateLanguageButton() {
    if (currentLanguage === 'TH') {
        // Show Thai flag, hide GB flag, show EN text
        if (elements.thFlag) elements.thFlag.style.display = 'inline-block';
        if (elements.enFlag) elements.enFlag.style.display = 'none';
        if (elements.languageText) elements.languageText.textContent = 'TH';
    } else {
        // Show GB flag, hide Thai flag, show TH text
        if (elements.thFlag) elements.thFlag.style.display = 'none';
        if (elements.enFlag) elements.enFlag.style.display = 'inline-block';
        if (elements.languageText) elements.languageText.textContent = 'EN';
    }
}

function updateCabinetInfo() {
    const t = translations[currentLanguage];
    
    // ตั้งค่าข้อความเริ่มต้นก่อน
    if (elements.nameCb) elements.nameCb.textContent = t.cabinet;
    if (elements.numberCb) elements.numberCb.textContent = t.cabinetNumber;
    if (elements.cabinetPeriodTitle) elements.cabinetPeriodTitle.textContent = t.periodTitle;
    if (elements.periodLabel) elements.periodLabel.textContent = t.periodLabel;
    if (elements.totalMembersLabel) elements.totalMembersLabel.textContent = t.totalMembersLabel;
    if (elements.lastUpdateLabel) elements.lastUpdateLabel.textContent = t.lastUpdateLabel;
    if (elements.membersTitle) elements.membersTitle.textContent = t.membersTitle;
    if (elements.loadingText) elements.loadingText.textContent = t.loading;
    if (elements.errorTitle) elements.errorTitle.textContent = t.errorTitle;
    if (elements.errorMessage) elements.errorMessage.textContent = t.errorMessage;
    if (elements.retryBtn) elements.retryBtn.textContent = t.retryBtn;
    
    // Find current cabinet info
    const cabinetTypes = currentLanguage === 'TH' ? ['รัฐบาลล่าสุด'] : ['Current government'];
    const currentCabinet = cabinetData.find(item => 
        item.lang === currentLanguage && cabinetTypes.includes(item.type)
    );
    
    if (currentCabinet) {
        console.log('Found cabinet data:', currentCabinet);
        
        // *** แก้ไขตรงนี้: ดึงชื่อคณะรัฐมนตรีจากฟิลด์ name ***
        if (elements.nameCb) {
            elements.nameCb.textContent = currentCabinet.name;
            console.log('Updated name_cb to:', currentCabinet.name);
        }
        
        // Extract cabinet number from position
        let cabinetNumber = '';
        if (currentCabinet.position) {
            const cabinetMatch = currentCabinet.position.match(/(\d+)/);
            cabinetNumber = cabinetMatch ? cabinetMatch[1] : '';
        }
        
        // Update cabinet number
        if (elements.numberCb) {
            elements.numberCb.textContent = `${t.cabinetNumber} ${cabinetNumber}`;
            console.log('Updated number_cb to:', `${t.cabinetNumber} ${cabinetNumber}`);
        }
        
        // Update cabinet period
        if (elements.cabinetPeriod) {
            elements.cabinetPeriod.textContent = currentCabinet.time;
        }
        
        // Update total members count
        if (elements.totalMembers) {
            const currentLanguageData = cabinetData.filter(item => item.lang === currentLanguage);
            const cabinetTypeNames = currentLanguage === 'TH' 
                ? ['รัฐบาลล่าสุด', 'นายกรัฐมนตรี'] 
                : ['Current government', 'Prime Minister'];
            
            const uniqueMembers = new Set(
                currentLanguageData
                    .filter(item => !cabinetTypeNames.includes(item.type))
                    .map(item => item.name)
                    .filter(name => name && name.trim() !== '')
            );
            elements.totalMembers.textContent = uniqueMembers.size;
        }
        
        // Update last update time
        if (elements.lastUpdate) {
            const now = new Date();
            const options = currentLanguage === 'TH' ? {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            } : {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            elements.lastUpdate.textContent = now.toLocaleDateString(
                currentLanguage === 'TH' ? 'th-TH' : 'en-US', 
                options
            ) + ' ' + now.toLocaleTimeString(
                currentLanguage === 'TH' ? 'th-TH' : 'en-US',
                { hour: '2-digit', minute: '2-digit' }
            );
        }
        
        // Show cabinet info section
        if (elements.cabinetInfo) {
            elements.cabinetInfo.style.display = 'block';
        }
    } else {
        console.warn('No cabinet data found for language:', currentLanguage);
        
        // ถ้าไม่พบข้อมูลคณะรัฐมนตรี ให้แสดงข้อความเริ่มต้น
        if (elements.nameCb) elements.nameCb.textContent = t.cabinet;
        if (elements.numberCb) elements.numberCb.textContent = t.cabinetNumber;
    }
}

function updateCabinetMembers() {
    if (!elements.membersContainer) return;

    // Clear container
    elements.membersContainer.innerHTML = '';

    // Define order of position groups
    const positionOrder = currentLanguage === 'TH'
        ? ['นายกรัฐมนตรี', 'รองนายกรัฐมนตรี', 'รัฐมนตรีว่าการ', 'รัฐมนตรีช่วยว่าการ']
        : ['Prime Minister', 'Deputy Prime Minister', 'Minister', 'Deputy Minister'];

    // Create groups in defined order
    positionOrder.forEach(positionType => {
        if (groupedMembers[positionType] && groupedMembers[positionType].length > 0) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'position-group';

            // Group title with translation
            const t = translations[currentLanguage];
            let groupTitle = positionType;
            if (positionType === 'นายกรัฐมนตรี') groupTitle = t.primeMinister;
            else if (positionType === 'รองนายกรัฐมนตรี') groupTitle = t.deputyPrimeMinister;
            else if (positionType === 'รัฐมนตรีว่าการ') groupTitle = t.minister;
            else if (positionType === 'รัฐมนตรีช่วยว่าการ') groupTitle = t.deputyMinister;
            else if (positionType === 'Prime Minister') groupTitle = t.primeMinister;
            else if (positionType === 'Deputy Prime Minister') groupTitle = t.deputyPrimeMinister;
            else if (positionType === 'Minister') groupTitle = t.minister;
            else if (positionType === 'Deputy Minister') groupTitle = t.deputyMinister;

            groupDiv.innerHTML = `
                        <h4 class="group-title">${groupTitle}</h4>
                        <div class="members-grid" id="group-${positionType.replace(/\s+/g, '-')}"></div>
                    `;

            elements.membersContainer.appendChild(groupDiv);

            // Add members to this group
            const groupGrid = groupDiv.querySelector('.members-grid');
            groupedMembers[positionType].forEach(member => {
                const memberCard = document.createElement('div');
                memberCard.className = 'member-card';

                memberCard.innerHTML = `
                            <div class="member-position">${member.position}</div>
                            <div class="member-name">${member.name}</div>
                            <div class="member-details">
                                ${member.time ? `<div><strong>${currentLanguage === 'TH' ? 'วาระ' : 'Term'}:</strong> ${member.time}</div>` : ''}
                                ${member.type !== positionType ? `<div class="member-ministry">${member.type}</div>` : ''}
                            </div>
                        `;

                groupGrid.appendChild(memberCard);
            });
        }
    });

    // Show members section if there are members
    if (Object.keys(groupedMembers).length > 0) {
        if (elements.cabinetMembersSection) {
            elements.cabinetMembersSection.style.display = 'block';
        }
    }
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'TH' ? 'EN' : 'TH';
    processCabinetData();
    updateContent();
}

function showLoading(show) {
    if (elements.loadingContainer) {
        elements.loadingContainer.style.display = show ? 'block' : 'none';
    }
    if (elements.cabinetInfo) {
        elements.cabinetInfo.style.display = show ? 'none' : 'block';
    }
    if (elements.cabinetMembersSection) {
        elements.cabinetMembersSection.style.display = show ? 'none' : 'block';
    }
}

function showError(show, message = '') {
    if (elements.errorContainer) {
        elements.errorContainer.style.display = show ? 'block' : 'none';
    }
    if (elements.loadingContainer) {
        elements.loadingContainer.style.display = show ? 'none' : 'block';
    }
    if (show && message && elements.errorMessage) {
        elements.errorMessage.textContent = message;
    }
}