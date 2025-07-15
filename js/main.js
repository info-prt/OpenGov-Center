window.addEventListener("DOMContentLoaded", () => {
    const currentPath = location.pathname;
    const links = document.querySelectorAll("header a");

    links.forEach(link => {
        const dataLink = link.getAttribute("data-link");

        // ตั้งค่า href จาก data-link
        if (dataLink) {
            link.setAttribute("href", dataLink);
        }

        // ตรวจสอบว่าหน้านี้ตรงกับ data-link หรือไม่ (เช่น /DBT/ เท่ากับ /DBT/index.html)
        if (
            currentPath === dataLink || // เช่น /DBT/
            (currentPath.endsWith("/index.html") && currentPath.replace("index.html", "") === dataLink)
        ) {
            link.classList.add("active");
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("menuToggle");
    const hdList = document.querySelector(".hd_list");

    toggle.addEventListener("click", () => {
        toggle.classList.toggle("active");     // แปลง 3 ขีด ↔ กากบาท
        hdList.classList.toggle("toggle");     // แสดง/ซ่อนเมนู
    });
});
