let currentIncidentId = null;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      document.getElementById('gpsCoords').innerText = `Latitude: ${pos.coords.latitude.toFixed(4)}, Longitude: ${pos.coords.longitude.toFixed(4)} (Accuracy: ${Math.round(pos.coords.accuracy)}m)`;
    },
    () => {
      document.getElementById('gpsCoords').innerText = 'Using Registered Home GPS: 37.7599° N, 122.4148° W (742 Evergreen Terrace, Apt 3B)';
    }
  );
}

async function triggerSOS() {
  const res = await fetch('/api/sos/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: 1, lat: 37.7599, lng: -122.4148, location_name: '742 Evergreen Terrace, Apt 3B' })
  });
  const data = await res.json();
  currentIncidentId = data.incident_id;
  document.getElementById('sosStatusCard').style.display = 'block';
  document.getElementById('incidentDetails').innerText = `${data.broadcast_message} Unit: ${data.dispatched_unit} (ETA ${data.eta_minutes} mins)`;
}

async function resolveSOS() {
  if (!currentIncidentId) return;
  await fetch('/api/sos/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ incident_id: currentIncidentId })
  });
  document.getElementById('sosStatusCard').style.display = 'none';
  alert('SOS Incident resolved.');
}
