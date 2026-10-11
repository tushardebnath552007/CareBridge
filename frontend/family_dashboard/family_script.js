async function loadFamilyData() {
  const res = await fetch('/api/family/dashboard');
  const data = await res.json();
  const senior = data.senior;
  const tel = data.telemetry;

  const card = document.getElementById('familySeniorCard');
  if (card && senior) {
    card.innerHTML = `
      <h3 style="margin:0 0 6px 0;">${senior.full_name}, Age ${senior.age}</h3>
      <p style="color:#94a3b8; font-size:13px; margin:0 0 10px 0;">${senior.address}</p>
      <div style="font-size:13px; color:#4ade80;">
        Battery: ${tel.battery_level}% | Status: ${tel.device_status} | Fall Sensor: ${tel.fall_sensor_status}
      </div>
    `;
  }

  const telBox = document.getElementById('telemetryBox');
  if (telBox && tel) {
    telBox.innerHTML = `
      <div style="border:1px solid #334155; padding:12px; border-radius:6px; background:#0f172a;">
        <span style="font-size:12px; color:#94a3b8;">Steps Today</span>
        <div style="font-size:20px; font-weight:bold; margin-top:4px;">${tel.pedometer_steps_today}</div>
      </div>
      <div style="border:1px solid #334155; padding:12px; border-radius:6px; background:#0f172a;">
        <span style="font-size:12px; color:#94a3b8;">Kitchen Activity</span>
        <div style="font-size:14px; font-weight:bold; margin-top:4px;">${tel.last_kitchen_motion}</div>
      </div>
      <div style="border:1px solid #334155; padding:12px; border-radius:6px; background:#0f172a;">
        <span style="font-size:12px; color:#94a3b8;">Last Voice Check-In</span>
        <div style="font-size:14px; font-weight:bold; margin-top:4px;">${tel.last_checkin_voice}</div>
      </div>
    `;
  }
}

async function sendPing() {
  const text = document.getElementById('pingInput').value;
  await fetch('/api/family/ping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text })
  });
  alert('Screen note transmitted to Martha Chen tablet in SF.');
}

loadFamilyData();
