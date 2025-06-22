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
        window.location.href = 'login.html';
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
        window.location.href = 'login.html';
      }).catch((error) => {
        console.error('เกิดข้อผิดพลาดในการออกจากระบบ:', error);
      });
    });
