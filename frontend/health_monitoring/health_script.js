async function loadHealthData() {
  const [vitalsRes, medsRes] = await Promise.all([
    fetch('/api/vitals'),
    fetch('/api/medications')
  ]);
  const vitalsData = await vitalsRes.json();
  const medsData = await medsRes.json();

  const vitalsEl = document.getElementById('vitalsTableContainer');
  if (vitalsEl) {
    vitalsEl.innerHTML = `
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <thead>
          <tr style="text-align:left; border-bottom:1px solid #334155; color:#94a3b8;">
            <th style="padding:8px;">Date</th>
            <th>BP (mmHg)</th>
            <th>Heart Rate</th>
            <th>Sugar (mg/dL)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${vitalsData.vitals.map(v => `
            <tr style="border-bottom:1px solid #1e293b;">
              <td style="padding:8px;">${v.recorded_at}</td>
              <td>${v.systolic}/${v.diastolic}</td>
              <td>${v.heart_rate} BPM</td>
              <td>${v.blood_sugar}</td>
              <td>${v.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  const medsEl = document.getElementById('medsList');
  if (medsEl) {
    medsEl.innerHTML = medsData.medications.map(m => `
      <div style="border:1px solid #334155; border-radius:6px; padding:10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>${m.name} (${m.dosage})</strong>
          <div style="font-size:12px; color:#94a3b8;">${m.schedule_time} · ${m.instructions}</div>
        </div>
        <button onclick="toggleMed(${m.id}, ${!m.taken_today})" style="padding:6px 12px; background:${m.taken_today ? '#16a34a' : '#334155'}; color:#fff; border:none; border-radius:4px; cursor:pointer;">
          ${m.taken_today ? 'Taken ✓' : 'Mark Taken'}
        </button>
      </div>
    `).join('');
  }
}

async function toggleMed(id, taken) {
  await fetch('/api/medications/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, taken })
  });
  loadHealthData();
}

async function logQuickVital(sys, dia, hr, sugar) {
  await fetch('/api/vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systolic: sys, diastolic: dia, heart_rate: hr, blood_sugar: sugar, spo2: 98, temperature: 98.6 })
  });
  loadHealthData();
}

loadHealthData();
