// ฟังก์ชันสำหรับเชื่อมต่อกับ Google Apps Script
const scriptUrl = 'https://script.google.com/macros/s/AKfycbz_mC7gxqm-x3XL2G_PWHeCOgGyBoWZlN68mmvFXSbDiKR_80rkCrAO_qom7vLYTcBP_g/exec';

// ฟังก์ชันล็อกอิน
async function login(username, password) {
  const response = await fetch(scriptUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'login',
      username,
      password
    })
  });
  return response.json();
}

// ฟังก์ชันโหลดข้อมูลโครงการ
async function loadProjects() {
  const response = await fetch(`${scriptUrl}?action=getProjects`);
  const data = await response.json();
  return data;
}

// ฟังก์ชันเพิ่มโครงการใหม่
async function addProject(projectData) {
  const response = await fetch(scriptUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'addProject',
      data: projectData
    })
  });
  return response.json();
}

// เมื่อ DOM โหลดเสร็จ
document.addEventListener('DOMContentLoaded', async () => {
  // ตรวจสอบการล็อกอิน
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'index.html';
    return;
  }

  // โหลดและแสดงข้อมูลโครงการ
  const projects = await loadProjects();
  const tableBody = document.querySelector('#projectsTable tbody');
  
  projects.forEach(project => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${project.name}</td>
      <td>${project.budget} ล้านบาท</td>
      <td>${project.status}</td>
      <td>
        <button class="edit-btn" data-id="${project.id}">แก้ไข</button>
        <button class="delete-btn" data-id="${project.id}">ลบ</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // จัดการฟอร์มเพิ่มโครงการ
  document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const projectData = {
      name: document.getElementById('projectName').value,
      budget: document.getElementById('projectBudget').value,
      description: document.getElementById('projectDescription').value,
      status: 'รอดำเนินการ'
    };

    const result = await addProject(projectData);
    if (result.success) {
      alert('เพิ่มโครงการสำเร็จ');
      window.location.reload();
    }
  });

  // ปุ่มออกจากระบบ
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
  });
});
