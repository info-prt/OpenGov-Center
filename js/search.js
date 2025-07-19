// ตัวแปรสำหรับเก็บข้อมูลและจัดการหน้า
let searchResults = [];
let currentPage = 1;
const resultsPerPage = 6;

// ฟังก์ชันค้นหาข้อมูล
async function searchData(query) {
  try {
    // แสดง loading state
    document.getElementById('searchResults').style.display = 'block';
    document.getElementById('resultsGrid').innerHTML = '<p>กำลังค้นหา...</p>';
    
    // เรียกใช้ Google Apps Script
    const response = await fetch(`https://script.google.com/macros/s/AKfycbw-Z5iGpqQ9iMa3GiMgf799A00EaPUYXxSAF_DbWZut5GkVMxTiKzPNKgFWNdsIF6A/exec?search=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    searchResults = Array.isArray(data) ? data : [];
    
    // แสดงผลลัพธ์
    displayResults(1);
    
  } catch (error) {
    console.error('Error searching data:', error);
    document.getElementById('resultsGrid').innerHTML = '<p>เกิดข้อผิดพลาดในการค้นหา</p>';
  }
}

// ฟังก์ชันแสดงผลลัพธ์
function displayResults(page) {
  currentPage = page;
  const resultsContainer = document.getElementById('resultsGrid');
  const countElement = document.getElementById('resultsCount');
  const paginationElement = document.getElementById('pagination');
  
  if (searchResults.length === 0) {
    resultsContainer.innerHTML = '<p>ผลการค้นหา : ไม่พบข้อมูลที่ตรงกับคำค้นหา</p>';
    paginationElement.innerHTML = '';
    return;
  }
  
  // คำนวณข้อมูลที่จะแสดงในหน้าปัจจุบัน
  const startIndex = (page - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, searchResults.length);
  const currentResults = searchResults.slice(startIndex, endIndex);
  
  // แสดงจำนวนผลลัพธ์
  countElement.textContent = `ผลการค้นหา : ${searchResults.length} ข้อมูล`;
  
  // สร้างการ์ดผลลัพธ์
  resultsContainer.innerHTML = currentResults.map(result => `
    <div class="result-card">
      <h4>${result.name}</h4>
      <div class="result-meta">
        <span>${result.type}</span>
        <span>${result.division}</span>
        <span>${result.date}</span>
      </div>
      <div class="result-actions">
        <a href="${result.url}" class="download-link" target="_blank">
          <i class="fas fa-download"></i> ดาวน์โหลด
        </a>
      </div>
    </div>
  `).join('');
  
  // สร้าง pagination
  if (searchResults.length > resultsPerPage) {
    const totalPages = Math.ceil(searchResults.length / resultsPerPage);
    let paginationHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `
        <button class="page-btn ${i === page ? 'active' : ''}" onclick="displayResults(${i})">
          ${i}
        </button>
      `;
    }
    
    paginationElement.innerHTML = paginationHTML;
  } else {
    paginationElement.innerHTML = '';
  }
}

// Event listeners
document.getElementById('searchButton').addEventListener('click', function() {
  const query = document.getElementById('searchInput').value.trim();
  if (query) {
    searchData(query);
  }
});

document.getElementById('searchInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
      searchData(query);
    }
  }
});
