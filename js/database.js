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

        const downloadCell = item.url
          ? `<td>
              <a class="download-btn" href="${item.url}" target="_blank">
                <i class="fas fa-download"></i> ดาวน์โหลด
              </a>
            </td>`
          : `<td><span style="color: gray;">ไม่มีไฟล์</span></td>`;

        row.innerHTML = nameCell + divisionCell + typeCell + dateCell + downloadCell;
        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('เกิดข้อผิดพลาด:', error);
      tableBody.innerHTML = `<tr><td colspan="5">ไม่สามารถโหลดข้อมูลได้</td></tr>`;
    });
});
