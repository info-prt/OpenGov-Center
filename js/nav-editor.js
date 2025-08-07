// ฟังก์ชันที่จะทำงานเมื่อเว็บโหวตเสร็จ
function updateNavMenu() {
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer) return;

  // ล้างเนื้อหาเดิม
  navContainer.innerHTML = '';

  // สร้าง HTML ใหม่ที่ต้องการแทรก
  const newNavHTML = `
    <ul>
      <li><a href="/"><i class="fas fa-database"></i> ข้อมูลเปิด</a></li>
      <li><a href="/projects"><i class="fas fa-project-diagram"></i> โครงการของรัฐ</a></li>
      <li><a href="/meeting"><i class="fas fa-file-alt"></i> รายงานการประชุม</a></li>
      <li><a href="/stat-kpi"><i class="fas fa-chart-line"></i> สถิติและตัวชี้วัด</a></li>
      <li><a href="/policies"><i class="fas fa-book"></i> แผนพัฒนา/นโยบาย</a></li>
      <li><a href="/developer-tools"><i class="fas fa-tools"></i> เครื่องมือสำหรับนักพัฒนา</a></li>
    </ul>
  `;

  // แทรก HTML ใหม่เข้าไป
  navContainer.innerHTML = newNavHTML;

  // เช็ค URL ปัจจุบัน
  const currentPath = window.location.pathname;
  let matchedHref = '/';

  if (currentPath !== '/' && currentPath !== '/index') {
    const segments = currentPath.split('/').filter(seg => seg); // กรองช่องว่าง
    matchedHref = '/' + segments[segments.length - 1]; // ใช้ segment สุดท้าย
  }

  // หาทุก <a> ใน nav แล้วเพิ่ม .active ถ้าตรงกับ path
  const navLinks = navContainer.querySelectorAll('a');
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (
      (matchedHref === '/' && (linkHref === '/' || linkHref === '/index')) ||
      (linkHref === matchedHref)
    ) {
      link.classList.add('active');
    }
  });
}

// เรียกใช้ฟังก์ชันหลัง "โหวตเสร็จ"
updateNavMenu();
