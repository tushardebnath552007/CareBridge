async function loadClaims() {
  const res = await fetch('/api/insurance/claims');
  const data = await res.json();
  const el = document.getElementById('claimsList');
  if (!el) return;

  el.innerHTML = data.claims.map(c => `
    <div style="border:1px solid #334155; padding:12px; border-radius:6px; margin-bottom:10px; background:#1e293b;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${c.claim_number} - ${c.hospital_name}</strong>
        <span style="font-size:12px; padding:2px 8px; border-radius:4px; background:#0f172a; color:#4ade80;">${c.status}</span>
      </div>
      <p style="font-size:13px; color:#94a3b8; margin:4px 0;">${c.service_type}</p>
      <div style="font-size:12px; color:#cbd5e1; margin-top:4px;">
        Total: $${c.amount_total.toFixed(2)} | Covered: $${c.amount_covered.toFixed(2)} | Copay: $${c.copay_amount.toFixed(2)}
      </div>
    </div>
  `).join('');
}

loadClaims();
