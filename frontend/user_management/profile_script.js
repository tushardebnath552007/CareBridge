async function loadProfile() {
  const res = await fetch('/api/user/profile');
  const data = await res.json();
  const u = data.user;

  const profEl = document.getElementById('profileContainer');
  if (profEl && u) {
    profEl.innerHTML = `
      <div style="background:#1e293b; padding:16px; border-radius:8px;">
        <h3 style="margin:0 0 8px 0;">${u.full_name}, Age ${u.age}</h3>
        <p style="margin:0 0 6px 0; color:#94a3b8;">${u.address}</p>
        <div style="font-size:13px; line-height:1.6;">
          <strong>Blood Type:</strong> ${u.blood_type}<br>
          <strong>Allergies:</strong> ${u.allergies}<br>
          <strong>Conditions:</strong> ${u.chronic_conditions}<br>
          <strong>Primary Doctor:</strong> ${u.primary_doctor} (${u.doctor_phone})<br>
          <strong>Family Caregiver:</strong> ${u.caregiver_name} - ${u.caregiver_relation} (${u.caregiver_phone})<br>
          <strong>Current Plan:</strong> ${u.subscription_plan}
        </div>
      </div>
    `;
  }

  const contEl = document.getElementById('contactsContainer');
  if (contEl && data.contacts) {
    contEl.innerHTML = data.contacts.map(c => `
      <div style="border:1px solid #334155; padding:10px; border-radius:6px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>#${c.priority} ${c.name}</strong> (${c.relationship})
          <div style="font-size:12px; color:#94a3b8;">${c.phone}</div>
        </div>
        <button onclick="deleteContact(${c.id})" style="padding:4px 8px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer;">Remove</button>
      </div>
    `).join('');
  }
}

async function addContact(e) {
  e.preventDefault();
  await fetch('/api/user/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: document.getElementById('cName').value,
      relationship: document.getElementById('cRel').value,
      phone: document.getElementById('cPhone').value,
      priority: parseInt(document.getElementById('cPriority').value, 10)
    })
  });
  e.target.reset();
  loadProfile();
}

async function deleteContact(id) {
  await fetch(`/api/user/contacts/${id}`, { method: 'DELETE' });
  loadProfile();
}

loadProfile();
