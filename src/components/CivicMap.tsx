import { useEffect, useRef } from 'react';
import { LatLng, Stop, TransitRoute, LiveBusState, Complaint } from '../types';

declare const L: any;

interface CivicMapProps {
  center?: LatLng;
  zoom?: number;
  routes?: TransitRoute[];
  stops?: Stop[];
  buses?: LiveBusState[];
  complaints?: Complaint[];
  onComplaintClick?: (complaint: Complaint) => void;
  selectedComplaintId?: string | null;
  activeRouteId?: string | null;
  showStopsLabel?: boolean;
}

export default function CivicMap({
  center = { lat: 10.9601, lng: 78.0766 }, // Karur
  zoom = 14,
  routes = [],
  stops = [],
  buses = [],
  complaints = [],
  onComplaintClick,
  selectedComplaintId = null,
  activeRouteId = null,
  showStopsLabel = true,
}: CivicMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const pathsLayerRef = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof L === 'undefined') {
      console.error('Leaflet L is not defined. Ensure unpkg script loaded.');
      return;
    }

    // Create Leaflet Map Instance
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([center.lat, center.lng], zoom);

    // Standard high contrast clean tile layer (CartoDB Positron - light, very modern civic tech feel!)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapInstanceRef.current = map;

    // Create Layers
    pathsLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Watch for center/zoom updates
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom);
    }
  }, [center.lat, center.lng, zoom]);

  // Render Routes, Stops, Buses, and Complaints
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || typeof L === 'undefined') return;

    // Clear old elements from layers
    pathsLayerRef.current.clearLayers();
    markersLayerRef.current.clearLayers();

    // 1. Draw Predefined Routes (Polylines)
    routes.forEach((route) => {
      // Highlight active route, fade others slightly
      const isActive = activeRouteId === null || activeRouteId === route.id;
      const opacity = isActive ? 0.85 : 0.25;
      const weight = isActive ? 5 : 3;

      const pathLatLngs = route.waypoints.map((w) => [w.lat, w.lng]);
      if (pathLatLngs.length > 0) {
        L.polyline(pathLatLngs, {
          color: route.color,
          weight: weight,
          opacity: opacity,
          lineJoin: 'round',
        }).addTo(pathsLayerRef.current);
      }
    });

    // 2. Draw Stop Markers
    if (stops.length > 0) {
      stops.forEach((stop) => {
        // Find if stop belongs to the active route or should be rendered
        const stopHtml = `
          <div class="flex flex-col items-center group">
            <div class="w-4 h-4 rounded-full bg-slate-800 border-2 border-white flex items-center justify-center shadow-md hover:scale-125 transition-transform duration-150">
              <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
            ${
              showStopsLabel
                ? `<div class="mt-0.5 px-1.5 py-0.5 bg-slate-950/80 text-white rounded text-[10px] whitespace-nowrap opacity-75 pointer-events-none select-none shadow">
                     ${stop.name}
                   </div>`
                : ''
            }
          </div>
        `;

        const stopIcon = L.divIcon({
          html: stopHtml,
          className: '',
          iconSize: [80, 40],
          iconAnchor: [40, 8],
        });

        L.marker([stop.lat, stop.lng], { icon: stopIcon })
          .bindPopup(`<strong class="text-xs font-semibold">${stop.name}</strong><br/><span class="text-[10px] text-slate-500">Bus Stop Node</span>`)
          .addTo(markersLayerRef.current);
      });
    }

    // 3. Draw Active Simulated Buses
    buses.forEach((bus) => {
      if (bus.status !== 'driving') return;

      const matchingRoute = routes.find((r) => r.id === bus.routeId);
      const color = matchingRoute ? matchingRoute.color : '#0d9488';
      const label = matchingRoute ? matchingRoute.name : 'Bus';

      const busHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full animate-ping opacity-30" style="background-color: ${color}"></div>
          <div class="w-7 h-7 rounded-full text-white flex items-center justify-center shadow-lg border-2 border-white transform hover:scale-110 transition-transform" style="background-color: ${color}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
              <rect x="3" y="11" width="18" height="6" rx="2" />
              <path d="M5 17v2a1 1 0 0 1-1 1H3v-3" />
              <path d="M19 17v2a1 1 0 0 0 1 1h1v-3" />
              <path d="M14 6V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2" />
              <circle cx="7" cy="14" r="1.5" fill="white" />
              <circle cx="17" cy="14" r="1.5" fill="white" />
            </svg>
          </div>
          <div class="absolute -top-6 px-1.5 py-0.5 rounded bg-teal-900 text-white font-mono text-[9px] font-bold shadow whitespace-nowrap">
            ${label}
          </div>
        </div>
      `;

      const busIcon = L.divIcon({
        html: busHtml,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([bus.currentPosition.lat, bus.currentPosition.lng], { icon: busIcon })
        .bindPopup(`
          <div class="p-1">
            <h4 class="font-bold text-teal-800 font-display text-sm">${label}</h4>
            <p class="text-[11px] text-slate-600 my-0.5">Speed: <strong class="text-slate-800">${Math.round(bus.speed)} km/h</strong></p>
            <p class="text-[11px] text-slate-600 my-0.5">Next Stop: <strong class="text-slate-800">${bus.nextStop?.name || 'End of route'}</strong></p>
            <p class="text-[11px] text-teal-600 my-0.5 font-semibold">ETA: ${bus.etaMinutes} mins</p>
          </div>
        `)
        .addTo(markersLayerRef.current);
    });

    // 4. Draw Civic Complaints/Tickets
    complaints.forEach((ticket) => {
      // Set color based on severity
      const sevColor =
        ticket.severity === 'High'
          ? '#ef4444' // Red 500
          : ticket.severity === 'Medium'
          ? '#f97316' // Orange 500
          : '#3b82f6'; // Blue 500

      // Category Icon
      let iconSvg = '';
      if (ticket.category === 'Pothole') {
        iconSvg = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />`;
      } else if (ticket.category === 'Streetlight') {
        iconSvg = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />`;
      } else if (ticket.category === 'Water Leak') {
        iconSvg = `<path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />`;
      } else if (ticket.category === 'Garbage') {
        iconSvg = `<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />`;
      } else {
        iconSvg = `<path stroke-linecap="round" stroke-linejoin="round" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />`;
      }

      const isSelected = selectedComplaintId === ticket.id;
      const markerSize = isSelected ? 42 : 32;
      const borderSize = isSelected ? 'border-4 border-slate-900' : 'border-2 border-white';

      const pinHtml = `
        <div class="relative flex items-center justify-center transform transition-transform hover:scale-115">
          ${isSelected ? `<div class="absolute w-12 h-12 rounded-full animate-ping opacity-25" style="background-color: ${sevColor}"></div>` : ''}
          <div class="rounded-full text-white flex items-center justify-center shadow-lg ${borderSize}" 
               style="background-color: ${sevColor}; width: ${markerSize}px; height: ${markerSize}px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4">
              ${iconSvg}
            </svg>
          </div>
          ${
            ticket.status === 'Resolved'
              ? `<div class="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center border border-white text-[9px] font-bold">✓</div>`
              : ''
          }
        </div>
      `;

      const pinIcon = L.divIcon({
        html: pinHtml,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([ticket.lat, ticket.lng], { icon: pinIcon })
        .addTo(markersLayerRef.current);

      if (onComplaintClick) {
        marker.on('click', () => {
          onComplaintClick(ticket);
        });
      }

      // Bind simple popup
      marker.bindPopup(`
        <div class="p-1 max-w-[180px]">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${sevColor}"></span>
            <strong class="text-xs text-slate-800">${ticket.category}</strong>
            <span class="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1 rounded">${ticket.status}</span>
          </div>
          <p class="text-[10px] text-slate-600 line-clamp-2 my-0.5">${ticket.description}</p>
          <p class="text-[9px] font-mono text-slate-400 mt-1">${ticket.id}</p>
        </div>
      `);
    });
  }, [routes, stops, buses, complaints, selectedComplaintId, activeRouteId, showStopsLabel]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <div id="leaflet-map-root" ref={mapContainerRef} className="w-full h-full bg-slate-100" />
      
      {/* Small Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-slate-100 z-[1000] text-[10px] text-slate-600 max-w-[150px] pointer-events-none select-none">
        <div className="font-semibold text-slate-800 mb-1 font-display">Map Indicators</div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span>High Severity Ticket</span>
        </div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <span>Medium Severity</span>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>Low Severity</span>
        </div>
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          <span>Simulated Active Bus</span>
        </div>
      </div>
    </div>
  );
}
