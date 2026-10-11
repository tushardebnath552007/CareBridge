async function loadTelehealth() {
  const [sessRes, rxRes] = await Promise.all([
    fetch('/api/telehealth/sessions'),
    fetch('/api/telehealth/prescriptions')
  ]);
  const sessData = await sessRes.json();
  const rxData = await rxRes.json();

  const sessEl = document.getElementById('telehealthSessionsList');
  if (sessEl) {
    sessEl.innerHTML = sessData.sessions.map(s => `
      <div style="border:1px solid #334155; padding:12px; border-radius:6px; margin-bottom:10px; background:#1e293b;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${s.doctor_name}</strong>
          <span style="font-size:12px; padding:2px 8px; border-radius:4px; background:#0f172a; color:#38bdf8;">${s.status}</span>
        </div>
        <p style="font-size:13px; color:#94a3b8; margin:4px 0;">${s.specialty} · ${s.notes || ''}</p>
        <div style="font-size:12px; color:#cbd5e1; margin-top:4px;">
          Time: ${s.scheduled_time} (${s.duration_mins} mins)
        </div>
      </div>
    `).join('');
  }

  const rxEl = document.getElementById('rxList');
  if (rxEl) {
    rxEl.innerHTML = rxData.prescriptions.map(r => `
      <div style="border:1px solid #334155; padding:10px; border-radius:6px; margin-bottom:8px; background:#1e293b; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>${r.drug}</strong>
          <div style="font-size:12px; color:#94a3b8;">${r.doctor} · ${r.pharmacy}</div>
        </div>
        <span style="font-size:12px; color:#4ade80;">${r.status}</span>
      </div>
    `).join('');
  }
}

function launchTelehealthCall() {
  alert('Connecting to Dr. Evelyn Vance, MD via HIPAA-secure WebRTC exam room...');
}

loadTelehealth();
