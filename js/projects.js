document.addEventListener('DOMContentLoaded', async () => {
  // โหลดข้อมูลจาก Google Sheets
  const response = await fetch('https://script.google.com/macros/s/AKfycbzWdu6BONMcBGeFCPEweJo0R1AiNg3XIfHvevN5_0hT96GNgOlucm_9GoFGSWwsV-95/exec?action=getProjects');
  const { data: projects } = await response.json();
  
  // แสดงผลโครงการ
  const projectsList = document.getElementById('projectsList');
  projectsList.innerHTML = projects.map(project => `
    <div class="project-card">
      <h3>${project.ชื่อโครงการ}</h3>
      <p><strong>งบประมาณ:</strong> ${project.งบประมาณ (ล้านบาท)} ล้านบาท</p>
      <p><strong>สถานะ:</strong> <span class="status-badge ${project.สถานะ}">${project.สถานะ}</span></p>
      <p>${project.รายละเอียด}</p>
      <div class="project-meta">
        <small>อัปเดตล่าสุด: ${project.วันที่อัปเดต}</small>
      </div>
    </div>
  `).join('');

  // สร้างกราฟงบประมาณ
  const ctx = document.getElementById('budgetChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: projects.map(p => p.ชื่อโครงการ),
      datasets: [{
        label: 'งบประมาณ (ล้านบาท)',
        data: projects.map(p => p.งบประมาณ),
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // ระบบค้นหา
  document.getElementById('projectSearch').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filterProjects(searchTerm, document.getElementById('statusFilter').value);
  });

  // ระบบกรองสถานะ
  document.getElementById('statusFilter').addEventListener('change', (e) => {
    filterProjects(document.getElementById('projectSearch').value.toLowerCase(), e.target.value);
  });

  function filterProjects(searchTerm, status) {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const projectStatus = card.querySelector('.status-badge').textContent;
      const matchesSearch = title.includes(searchTerm);
      const matchesStatus = status === 'all' || projectStatus === status;
      
      if (matchesSearch && matchesStatus) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }
});
