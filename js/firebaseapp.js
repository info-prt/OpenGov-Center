// กำหนดค่า Firebase
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
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ฟังก์ชันเข้าสู่ระบบ
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorElement = document.getElementById('errorMessage');
  const loader = document.getElementById('loader');

  errorElement.textContent = '';
  loader.style.display = 'block';

  try {
    // เข้าสู่ระบบด้วย Firebase Auth
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // สร้าง Firebase ID Token
    const idToken = await user.getIdToken();

    // บันทึก Token ลง localStorage
    localStorage.setItem('firebaseIdToken', idToken);
    localStorage.setItem('userEmail', user.email);

    // นำทางไปยังหน้าหลัก
    window.location.href = 'admin.html';

  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);

    // แสดงข้อความผิดพลาดที่เข้าใจง่าย
    let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
        break;
      case 'auth/user-disabled':
        errorMessage = 'บัญชีผู้ใช้นี้ถูกระงับ';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
        break;
    }

    errorElement.textContent = errorMessage;
  } finally {
    loader.style.display = 'none';
  }
});
