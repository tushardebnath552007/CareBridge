async function loadHospitals() {
  const res = await fetch('/api/hospitals');
  const data = await res.json();
  const container = document.getElementById('hospitalsList');
  if (!container) return;
  container.innerHTML = data.hospitals.map(h => `
    <div style="border:1px solid #334155; border-radius:8px; padding:12px; margin-bottom:12px; background:#1e293b;">
      <h4 style="margin:0 0 6px 0;">${h.name} (${h.distance_km} km away)</h4>
      <p style="margin:0 0 4px 0; font-size:13px; color:#94a3b8;">${h.address} · Tel: ${h.phone}</p>
      <div style="font-size:13px; color:#38bdf8;">
        Ambulance ETA: ${h.ambulance_eta_mins} mins | Available ER Beds: ${h.available_er_beds} | ICU: ${h.available_icu_beds}
      </div>
    </div>
  `).join('');
}

async function requestAmbulance() {
  const res = await fetch('/api/hospital/dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hospital_id: 1 })
  });
  const data = await res.json();
  document.getElementById('dispatchCard').style.display = 'block';
  document.getElementById('dispatchInfo').innerHTML = `
    <strong>Code:</strong> ${data.dispatch_code}<br>
    <strong>Unit:</strong> ${data.ambulance_unit} (${data.driver_name})<br>
    <strong>Hospital:</strong> ${data.hospital_name}<br>
    <strong>ETA:</strong> ${data.eta_minutes} mins<br>
    <strong>Pre-Admission Packet:</strong> Transmitted (Blood: ${data.blood_type}, Insurance: ${data.insurance_authorized})
  `;
}

loadHospitals();
