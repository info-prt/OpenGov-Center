// ฟังก์ชันสำหรับเชื่อมต่อกับ Google Apps Script
const scriptUrl = 'https://script.google.com/macros/s/AKfycbzWdu6BONMcBGeFCPEweJo0R1AiNg3XIfHvevN5_0hT96GNgOlucm_9GoFGSWwsV-95/exec';

// ต้องใช้ type="module" ตอนเรียก script นี้จาก HTML

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

    // กำหนดค่า Firebase (ต้องเหมือนกับในหน้า login)
    const firebaseConfig = {
      apiKey: "AIzaSyBYbmrTN5PR-QszoaYJoKAml80VfEPho7Q",
      authDomain: "login-edf1c.firebaseapp.com",
      projectId: "login-edf1c",
      storageBucket: "login-edf1c.firebasestorage.app",
      messagingSenderId: "750603223073",
      appId: "1:750603223073:web:997ebe10bdb155dc2ba360",
      measurementId: "G-K5P8045RFR"
    };
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // ตรวจสอบสถานะการล็อกอิน
    auth.onAuthStateChanged((user) => {
      if (!user) {
        // ถ้าไม่ได้ล็อกอิน ให้กลับไปหน้า login
        window.location.href = 'login-firebase.html';
      } else {
        // แสดงอีเมลผู้ใช้
        document.getElementById('userEmail').textContent = user.email;
      }
    });

    // ปุ่มออกจากระบบ
    document.getElementById('logoutBtn').addEventListener('click', function() {
      auth.signOut().then(() => {
        localStorage.removeItem('firebaseIdToken');
        localStorage.removeItem('userEmail');
        window.location.href = 'login-firebase.html';
      }).catch((error) => {
        console.error('เกิดข้อผิดพลาดในการออกจากระบบ:', error);
      });
    });
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
    window.location.href = 'login.html';
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
    window.location.href = 'login.html';
  });
});
