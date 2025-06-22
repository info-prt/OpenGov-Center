document.addEventListener('DOMContentLoaded', async () => {
  // โหลดข้อมูลนโยบาย
  const response = await fetch('https://script.google.com/macros/s/AKfycbz_mC7gxqm-x3XL2G_PWHeCOgGyBoWZlN68mmvFXSbDiKR_80rkCrAO_qom7vLYTcBP_g/exec?action=getPolicies');
  const { data: policies } = await response.json();
  
  // แสดงผลนโยบาย
  function renderPolicies(category = 'all') {
    const filteredPolicies = category === 'all' 
      ? policies 
      : policies.filter(policy => policy.หมวดหมู่ === category);
    
    const policiesList = document.getElementById('policiesList');
    policiesList.innerHTML = filteredPolicies.map(policy => `
      <div class="policy-card">
        <h3>${policy.ชื่อนโยบาย}</h3>
        <p class="policy-category">${policy.หมวดหมู่}</p>
        <p><strong>สถานะ:</strong> ${policy.สถานะ}</p>
        <p><strong>วันที่ประกาศ:</strong> ${policy.วันที่ประกาศ}</p>
        <div class="policy-details">
          <p>${policy.รายละเอียด}</p>
        </div>
      </div>
    `).join('');
  }

  // แสดงทั้งหมดเริ่มต้น
  renderPolicies();

  // จัดการแท็บ
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPolicies(btn.dataset.category);
    });
  });
});
