async function loadErrands() {
  const res = await fetch('/api/community/requests');
  const data = await res.json();
  const el = document.getElementById('errandList');
  if (!el) return;
  el.innerHTML = data.requests.map(r => `
    <div style="border:1px solid #334155; border-radius:6px; padding:12px; margin-bottom:10px; background:#1e293b;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${r.title}</strong>
        <span style="font-size:12px; padding:2px 8px; border-radius:4px; background:#334155;">${r.status}</span>
      </div>
      <p style="margin:4px 0; font-size:13px; color:#94a3b8;">${r.description}</p>
      <div style="font-size:12px; color:#38bdf8;">
        Category: ${r.category} | ${r.volunteer_name ? `Assigned: ${r.volunteer_name} (⭐ ${r.volunteer_rating})` : 'Awaiting Match'}
      </div>
    </div>
  `).join('');
}

async function submitErrand(e) {
  e.preventDefault();
  const category = document.getElementById('errandCategory').value;
  const title = document.getElementById('errandTitle').value;
  const description = document.getElementById('errandDesc').value;

  await fetch('/api/community/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, title, description, scheduled_time: 'Today, within 2 hrs' })
  });

  e.target.reset();
  loadErrands();
}

loadErrands();
