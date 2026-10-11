import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Crosshair, 
  Layers, 
  MapPin, 
  Navigation, 
  Ambulance, 
  Hospital as HospitalIcon, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface SosMapProps {
  userCoords: {
    lat: number;
    lng: number;
    accuracy?: number;
    address?: string;
  };
  isSosActive: boolean;
  incidentId?: number | null;
  dispatchedUnit?: string | null;
  isSeniorMode?: boolean;
}

export const SosMap: React.FC<SosMapProps> = ({
  userCoords,
  isSosActive,
  incidentId,
  dispatchedUnit = 'Medic-04 (St. Jude EMS)',
  isSeniorMode = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'osm' | 'dark'>('streets');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Hospital & Ambulance simulated coordinates near SF Potrero / Mission
  const hospitalCoords = {
    lat: userCoords.lat - 0.0065,
    lng: userCoords.lng + 0.0125,
    name: 'St. Jude Metro General Hospital & Trauma ER'
  };

  const ambulanceCoords = {
    lat: userCoords.lat - 0.0032,
    lng: userCoords.lng + 0.0062,
    unit: dispatchedUnit || 'Medic-04 ALS'
  };

  // Map Tile Providers
  const tileLayers = {
    streets: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const tileLayer = L.tileLayer(tileLayers[mapStyle].url, {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = markersGroup;
      (map as any)._currentTileLayer = tileLayer;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Tile Style changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentLayer = (map as any)._currentTileLayer;
    if (currentLayer) {
      map.removeLayer(currentLayer);
    }

    const newLayer = L.tileLayer(tileLayers[mapStyle].url, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    (map as any)._currentTileLayer = newLayer;
  }, [mapStyle]);

  // Update Markers, Route and Geofence
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. User Location Pulse Pin
    const userIconHtml = `
      <div class="relative flex items-center justify-center">
        ${isSosActive ? '<div class="absolute w-14 h-14 rounded-full bg-red-600/40 animate-sos-pulse-ring"></div>' : ''}
        <div class="w-10 h-10 rounded-full ${isSosActive ? 'bg-red-600' : 'bg-rose-600'} text-white shadow-xl flex items-center justify-center border-3 border-white ring-2 ring-red-400">
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div class="absolute -bottom-6 bg-slate-900/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm border border-slate-700">
          ${isSosActive ? '🚨 SOS RESIDENT' : 'MARTHA CHEN (HOME)'}
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userIconHtml,
      className: 'custom-user-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon });
    userMarker.bindPopup(`
      <div style="font-family: inherit;">
        <div style="font-weight: 800; color: #dc2626; font-size: 13px;">
          ${isSosActive ? '🚨 ACTIVE SOS BEACON' : 'Registered Home Location'}
        </div>
        <div style="font-weight: 600; font-size: 12px; margin-top: 4px;">
          Martha Chen (Age 78)
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          ${userCoords.address || '742 Evergreen Terrace, Apt 3B, San Francisco, CA'}
        </div>
        <div style="font-size: 10px; font-family: monospace; color: #0284c7; margin-top: 4px;">
          GPS: ${userCoords.lat.toFixed(5)}° N, ${userCoords.lng.toFixed(5)}° W
        </div>
      </div>
    `);
    markersGroup.addLayer(userMarker);

    // 2. Accuracy Geofence Circle
    const accuracyRadius = userCoords.accuracy || 15;
    const accuracyCircle = L.circle([userCoords.lat, userCoords.lng], {
      radius: Math.max(15, accuracyRadius),
      color: isSosActive ? '#dc2626' : '#f43f5e',
      fillColor: isSosActive ? '#ef4444' : '#fb7185',
      fillOpacity: isSosActive ? 0.25 : 0.15,
      weight: 1.5,
      dashArray: isSosActive ? '4, 4' : undefined
    });
    markersGroup.addLayer(accuracyCircle);

    // 3. Hospital Marker
    const hospitalIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="w-8 h-8 rounded-xl bg-blue-700 text-white shadow-lg flex items-center justify-center border-2 border-white">
          <svg class="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path d="M12 6v12m-6-6h12"/>
          </svg>
        </div>
        <div class="absolute -bottom-5 bg-blue-950/90 text-blue-200 text-[9px] font-bold px-1.5 py-0.2 rounded whitespace-nowrap">
          ST. JUDE ER
        </div>
      </div>
    `;

    const hospitalIcon = L.divIcon({
      html: hospitalIconHtml,
      className: 'custom-hospital-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const hospitalMarker = L.marker([hospitalCoords.lat, hospitalCoords.lng], { icon: hospitalIcon });
    hospitalMarker.bindPopup(`
      <div style="font-family: inherit;">
        <strong style="color: #1d4ed8; font-size: 12px;">St. Jude Metro General Hospital</strong>
        <div style="font-size: 11px; color: #475569; margin-top: 2px;">Level 1 Trauma ER · 1.8 km</div>
        <div style="font-size: 10px; color: #16a34a; font-weight: 600; margin-top: 2px;">Available ER Beds: 22</div>
      </div>
    `);
    markersGroup.addLayer(hospitalMarker);

    // 4. Paramedic Ambulance Marker & Route if Active
    if (isSosActive) {
      const ambulanceIconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-9 h-9 rounded-xl bg-amber-500 text-white shadow-xl flex items-center justify-center border-2 border-white animate-pulse">
            <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path d="M10 17h4V5H2v12h3m9 0h4l3 3v-7h-7m-9 4a2 2 0 100-4 2 2 0 000 4zm13 0a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
          </div>
          <div class="absolute -bottom-5 bg-amber-950/90 text-amber-200 text-[9px] font-bold px-1.5 py-0.2 rounded whitespace-nowrap">
            MEDIC-04 (5m ETA)
          </div>
        </div>
      `;

      const ambulanceIcon = L.divIcon({
        html: ambulanceIconHtml,
        className: 'custom-ambulance-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const ambulanceMarker = L.marker([ambulanceCoords.lat, ambulanceCoords.lng], { icon: ambulanceIcon });
      ambulanceMarker.bindPopup(`
        <div style="font-family: inherit;">
          <strong style="color: #d97706; font-size: 12px;">Medic-Unit 04 (Advanced Life Support)</strong>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">Lead Paramedic: Marcus Bell</div>
          <div style="font-size: 11px; color: #dc2626; font-weight: bold; margin-top: 2px;">Priority Code 3 En Route (ETA ~5 mins)</div>
        </div>
      `);
      markersGroup.addLayer(ambulanceMarker);

      // Tactical Routing Trajectory Polyline from Hospital -> Ambulance -> User
      const routePolyline = L.polyline([
        [hospitalCoords.lat, hospitalCoords.lng],
        [ambulanceCoords.lat, ambulanceCoords.lng],
        [userCoords.lat, userCoords.lng]
      ], {
        color: '#dc2626',
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round',
        lineJoin: 'round'
      });
      markersGroup.addLayer(routePolyline);
    }

    // Adjust view bounds to fit points smoothly
    if (isSosActive) {
      const bounds = L.latLngBounds([
        [userCoords.lat, userCoords.lng],
        [hospitalCoords.lat, hospitalCoords.lng],
        [ambulanceCoords.lat, ambulanceCoords.lng]
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } else {
      map.setView([userCoords.lat, userCoords.lng], 15);
    }
  }, [userCoords, isSosActive]);

  // Recenter map action
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userCoords.lat, userCoords.lng], 16, { animate: true });
    }
  };

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${userCoords.lat.toFixed(6)}, ${userCoords.lng.toFixed(6)}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${userCoords.lat},${userCoords.lng}`;

  return (
    <div className={`relative rounded-2xl overflow-hidden border transition-all ${
      isSeniorMode
        ? 'border-2 border-slate-300 bg-white shadow-md'
        : 'border-slate-200 bg-white shadow-xs'
    } ${isExpanded ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'h-[360px] md:h-[420px]'}`}>
      
      {/* Tactical Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Status Badge */}
        <div className={`pointer-events-auto px-3.5 py-1.5 rounded-xl border shadow-md flex items-center gap-2 backdrop-blur-md bg-white/95 text-slate-950 ${
          isSeniorMode ? 'border-2 border-slate-300 font-bold' : 'border-slate-200'
        }`}>
          {isSosActive ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="text-xs font-black text-red-600">SOS ACTIVE · LIVE GPS LOCK</span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-xs font-bold text-slate-900">GPS STANDBY · RESIDENT LOCATION</span>
            </>
          )}
          <span className="text-slate-300">|</span>
          <span className="font-mono text-[11px] font-bold text-slate-700 tabular-nums">
            {userCoords.lat.toFixed(4)}° N, {userCoords.lng.toFixed(4)}° W
          </span>
        </div>

        {/* Map Control Buttons */}
        <div className={`pointer-events-auto flex items-center gap-1.5 p-1 rounded-xl border shadow-md text-xs backdrop-blur-md bg-white/95 text-slate-800 ${
          isSeniorMode ? 'border-2 border-slate-300' : 'border-slate-200'
        }`}>
          {/* Style Selector */}
          <button
            onClick={() => setMapStyle(mapStyle === 'streets' ? 'osm' : 'streets')}
            className="px-2.5 py-1 rounded-lg hover:bg-slate-100 flex items-center gap-1 transition-colors cursor-pointer font-bold text-slate-800"
            title="Switch Map Tiles"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="capitalize">{mapStyle}</span>
          </button>

          {/* Recenter */}
          <button
            onClick={handleRecenter}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-800"
            title="Recenter on Resident"
          >
            <Crosshair className="w-3.5 h-3.5 text-rose-600" />
          </button>

          {/* Expand / Minimize */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-slate-800"
            title={isExpanded ? 'Collapse Map' : 'Full Screen Map'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Map Leaflet Canvas Container */}
      <div ref={mapContainerRef} className="w-full flex-1 z-10 min-h-[280px]" />

      {/* Responder Tactical Reference Footer Bar */}
      <div className={`z-20 border-t p-3.5 px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs bg-white text-slate-900 shadow-xs ${
        isSeniorMode ? 'border-t-2 border-slate-300' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-slate-950 flex items-center gap-2">
              <span>{userCoords.address || '742 Evergreen Terrace, Apt 3B, San Francisco, CA'}</span>
              <span className="text-[10px] bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded font-mono font-bold border border-slate-200">
                Entry Keybox: #4110
              </span>
            </div>
            <div className="text-[11px] text-slate-600 flex items-center gap-2 mt-0.5 font-medium">
              <span>3rd Floor, Elevator North</span>
              <span>·</span>
              <span>Nearest Cross: 24th St & Potrero Ave</span>
              <span>·</span>
              <span className="text-emerald-700 font-bold">St. Jude Trauma ER (1.8 km)</span>
            </div>
          </div>
        </div>

        {/* Quick Responder Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
          <button
            onClick={copyCoordinates}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300 cursor-pointer shadow-2xs"
            title="Copy Latitude, Longitude for CAD"
          >
            {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-600 font-black" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
            <span>{copiedCoords ? 'Copied' : 'Copy GPS Coords'}</span>
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Open in External Navigation App"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Turn-by-Turn GPS</span>
          </a>
        </div>
      </div>
    </div>
  );
};
