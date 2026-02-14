// Search

document.getElementById('searchBtn').addEventListener('click', () => {
    const input = document.getElementById('searchInput');
    const keyword = input.value.trim();

    if (keyword !== '') {
        // บันทึกค่าใน localStorage
        localStorage.setItem('searchKeyword', keyword);

        // ไปหน้า search พร้อมคำค้นหา
        window.location.href = `search?q=${encodeURIComponent(keyword)}`;
    } else {
        // ถ้าเว้นว่าง
        window.location.href = 'search?type=all';
    }
});

// กด Enter เพื่อค้นหาได้ด้วย
document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});