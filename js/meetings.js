document.addEventListener('DOMContentLoaded', async () => {
  // โหลดข้อมูลการประชุม
  const response = await fetch('https://script.google.com/macros/s/AKfycbz_mC7gxqm-x3XL2G_PWHeCOgGyBoWZlN68mmvFXSbDiKR_80rkCrAO_qom7vLYTcBP_g/exec?action=getMeetings');
  const { data: meetings } = await response.json();
  
  // แสดงผลการประชุม
  const meetingsList = document.getElementById('meetingsList');
  meetingsList.innerHTML = meetings.map(meeting => `
    <div class="meeting-card">
      <h3>${meeting.ชื่อการประชุม}</h3>
      <p><strong>วันที่:</strong> ${meeting.วันที่}</p>
      <p><strong>สถานที่:</strong> ${meeting.สถานที่}</p>
      <p><strong>ผู้เข้าร่วม:</strong> ${meeting.ผู้เข้าร่วม} คน</p>
      <div class="meeting-summary">
        <p>${meeting.สรุปผลการประชุม}</p>
      </div>
      ${meeting.ไฟล์แนบ ? `<a href="${meeting.ไฟล์แนบ}" class="btn" target="_blank">ดูไฟล์แนบ</a>` : ''}
    </div>
  `).join('');

  // สร้างปฏิทิน
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events: meetings.map(meeting => ({
      title: meeting.ชื่อการประชุม,
      start: meeting.วันที่,
      url: meeting.ไฟล์แนบ || '#'
    })),
    locale: 'th'
  });
  calendar.render();
});
