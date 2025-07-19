document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('.dataset-table tbody');

    fetch('https://script.google.com/macros/s/AKfycbzDbQ7Yki_UEIMswORobYK7bSdzKiQXh_8Kd_X-yYHcXSu-ThVQhomBX_YRk5cs_aw/exec')
        .then(response => response.json())
        .then(data => {
            tableBody.innerHTML = ''; // ล้างข้อมูลเดิม

            data.forEach(item => {
                const row = document.createElement('tr');

                const nameCell = `<td>${item.name}</td>`;
                const divisionCell = `<td>${item.division}</td>`;
                const typeCell = `<td>${item.type}</td>`;
                const dateCell = `<td>${item.date}</td>`;

                const fileId = extractDriveId(item.file);
                const downloadCell = `
              <td>
                <a class="download-btn" href="https://drive.google.com/uc?export=download&id=${fileId}" target="_blank">
                  <i class="fas fa-download"></i> ดาวน์โหลด
                </a>
              </td>`;

                row.innerHTML = nameCell + divisionCell + typeCell + dateCell + downloadCell;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            tableBody.innerHTML = `<tr><td colspan="5">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`;
            console.error('เกิดข้อผิดพลาด:', error);
        });

    function extractDriveId(url) {
        const regex = /[-\w]{25,}/;
        const match = url.match(regex);
        return match ? match[0] : '';
    }
});
