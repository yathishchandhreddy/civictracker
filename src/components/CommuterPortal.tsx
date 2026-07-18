import { useState, useEffect } from 'react';
import { TransitRoute, LiveBusState, Stop } from '../types';
import { Search, MapPin, Bell, BellOff, QrCode, Navigation, AlertCircle, ArrowRight, Share2 } from 'lucide-react';
import CivicMap from './CivicMap';
import { getDistance } from '../data/transitData';

interface CommuterPortalProps {
  routes: TransitRoute[];
  liveBuses: LiveBusState[];
}

interface MockQRStop {
  id: string;
  name: string;
  routeId: string;
  stopId: string;
}

const MOCK_QR_SCANS: MockQRStop[] = [
  { id: 'qr-1', name: 'Collectorate Office Stop (Route 12)', routeId: 'route-12', stopId: 'stop-col' },
  { id: 'qr-2', name: 'Sengunthapuram Main Stop (Route 45)', routeId: 'route-45', stopId: 'stop-seng' },
  { id: 'qr-3', name: 'Periyar Nagar Bus Stop (Route 7)', routeId: 'route-7', stopId: 'stop-periyar' },
];

export default function CommuterPortal({ routes, liveBuses }: CommuterPortalProps) {
  // Search query for routes
  const [searchQuery, setSearchQuery] = useState('');
  
  // Current active route being tracked by the commuter
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-12');
  
  // Simulated scanned stop via QR code (defaults to Collectorate Office on Route 12)
  const [scannedStop, setScannedStop] = useState<MockQRStop | null>(MOCK_QR_SCANS[0]);
  
  // Proximity Alert state
  const [isAlertSet, setIsAlertSet] = useState(false);
  const [alertThresholdKm, setAlertThresholdKm] = useState(1.5); // 1.5km is perfect for our small routes!
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  // Active tracked route details
  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const activeBus = liveBuses.find((b) => b.routeId === selectedRouteId);

  // Filter routes by search query
  const filteredRoutes = routes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find stop coords if QR code is scanned
  const currentScannedStopDetails = scannedStop
    ? routes.find((r) => r.id === scannedStop.routeId)?.stops.find((s) => s.id === scannedStop.stopId)
    : null;

  // Track bus distance from scanned stop and trigger proximity alert
  useEffect(() => {
    if (!isAlertSet || !activeBus || activeBus.status !== 'driving' || !currentScannedStopDetails) {
      return;
    }

    const busPosition = activeBus.currentPosition;
    const stopPosition = { lat: currentScannedStopDetails.lat, lng: currentScannedStopDetails.lng };
    
    // Calculate distance in meters
    const distanceMeters = getDistance(busPosition, stopPosition);
    const distanceKm = distanceMeters / 1000;

    // Trigger alert if distance is below threshold
    if (distanceKm <= alertThresholdKm && !alertTriggered) {
      setAlertTriggered(true);
      setShowNotificationToast(true);
      
      // Attempt play alert sound
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        osc.frequency.setValueAtTime(880, context.currentTime); // high chime
        gain.gain.setValueAtTime(0.3, context.currentTime);
        osc.start();
        osc.stop(context.currentTime + 0.15);
        setTimeout(() => {
          const osc2 = context.createOscillator();
          const gain2 = context.createGain();
          osc2.connect(gain2);
          gain2.connect(context.destination);
          osc2.frequency.setValueAtTime(1200, context.currentTime);
          gain2.gain.setValueAtTime(0.3, context.currentTime);
          osc2.start();
          osc2.stop(context.currentTime + 0.3);
        }, 150);
      } catch (e) {
        console.log('Audio alert failed or blocked by browser policies: ', e);
      }
    }
  }, [activeBus?.currentPosition, isAlertSet, alertThresholdKm, alertTriggered, currentScannedStopDetails]);

  // Handle setting/unsetting proximity alert
  const handleToggleAlert = () => {
    if (isAlertSet) {
      setIsAlertSet(false);
      setAlertTriggered(false);
      setShowNotificationToast(false);
    } else {
      setIsAlertSet(true);
      setAlertTriggered(false);
    }
  };

  const handleSimulateScan = (qr: MockQRStop) => {
    setScannedStop(qr);
    setSelectedRouteId(qr.routeId);
    // Reset alert when scanning a new stop
    setIsAlertSet(false);
    setAlertTriggered(false);
    setShowNotificationToast(false);
  };

  // Get distance string for display
  const getDistanceDisplay = () => {
    if (!activeBus || activeBus.status !== 'driving' || !currentScannedStopDetails) {
      return 'Bus Offline';
    }
    const distanceMeters = getDistance(activeBus.currentPosition, {
      lat: currentScannedStopDetails.lat,
      lng: currentScannedStopDetails.lng,
    });
    const distanceKm = distanceMeters / 1000;
    return distanceKm < 1 ? `${Math.round(distanceMeters)}m` : `${distanceKm.toFixed(2)} km`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-4">
      {/* Real-time Push Notification Simulation Overlay */}
      {showNotificationToast && scannedStop && currentScannedStopDetails && (
        <div className="fixed top-6 right-6 z-[9999] max-w-md bg-emerald-900 text-white rounded-2xl shadow-2xl p-4 border-2 border-emerald-400 animate-bounce flex gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-start">
              <strong className="text-sm font-display font-bold">📢 CivicTrack Proximity Alert</strong>
              <button
                onClick={() => setShowNotificationToast(false)}
                className="text-emerald-300 hover:text-white font-bold text-xs px-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Your bus (<strong className="text-white">{currentRoute.name}</strong>) is currently{' '}
              <span className="bg-emerald-700 px-1.5 py-0.5 rounded text-white font-bold">
                {getDistanceDisplay()}
              </span>{' '}
              away from <strong className="text-white">{currentScannedStopDetails.name}</strong>! Head to the bus stop now!
            </p>
          </div>
        </div>
      )}

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Route selection, QR simulation, ETA panels (5 columns) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* QR Code Scan Simulator Panel */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold font-display text-slate-900 text-sm uppercase tracking-wider">
                QR-Code Smart Stop Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              In Karur, physical QR stickers are affixed to city bus shelter poles. Commuters scan them to immediately view live transit schedules without installing any app.
            </p>

            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                Simulate Scanning a Stop QR:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                {MOCK_QR_SCANS.map((qr) => {
                  const isActive = scannedStop?.id === qr.id;
                  return (
                    <button
                      key={qr.id}
                      onClick={() => handleSimulateScan(qr)}
                      className={`text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between border ${
                        isActive
                          ? 'bg-emerald-55/60 border-emerald-500 text-emerald-800 font-semibold shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="truncate">{qr.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active QR Stop Tracker Landing Card */}
          {scannedStop && currentScannedStopDetails && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    QR-LANDING VIEW
                  </span>
                  <h4 className="font-bold font-display text-slate-900 text-lg">
                    {currentScannedStopDetails.name}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Karur Smart Stop Node ({currentScannedStopDetails.lat.toFixed(4)}, {currentScannedStopDetails.lng.toFixed(4)})
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <QrCode className="w-8 h-8 text-slate-700" />
                </div>
              </div>

              {/* Live Bus Connection Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Tracked Route:</span>
                  <span className="font-bold font-mono text-emerald-700" style={{ color: currentRoute.color }}>
                    {currentRoute.displayName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm text-center">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase block">Estimated ETA</span>
                    <strong className="text-xl font-mono text-emerald-900 block mt-1">
                      {activeBus?.status === 'driving' ? `${activeBus.etaMinutes} Min` : 'Offline'}
                    </strong>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm text-center">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase block">Distance</span>
                    <strong className="text-sm font-mono text-slate-800 block mt-2 truncate">
                      {getDistanceDisplay()}
                    </strong>
                  </div>
                </div>

                {/* Proximity Alerts Config */}
                <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">PROXIMITY ALERTS</span>
                      <p className="text-xs font-semibold text-slate-700">Set alert when bus is near</p>
                    </div>
                    {/* Custom threshold selector */}
                    <select
                      value={alertThresholdKm}
                      onChange={(e) => {
                        setAlertThresholdKm(parseFloat(e.target.value));
                        setAlertTriggered(false);
                      }}
                      disabled={isAlertSet}
                      className="bg-white border border-slate-200 text-xs rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 font-mono"
                    >
                      <option value="0.5">500m</option>
                      <option value="1.0">1.0 km</option>
                      <option value="1.5">1.5 km</option>
                      <option value="3.0">3.0 km</option>
                      <option value="5.0">5.0 km</option>
                    </select>
                  </div>

                  <button
                    onClick={handleToggleAlert}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isAlertSet
                        ? alertTriggered
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : 'bg-emerald-600 text-white animate-pulse shadow'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow'
                    }`}
                  >
                    {isAlertSet ? (
                      alertTriggered ? (
                        <>
                          <BellOff className="w-3.5 h-3.5" /> Reset Proximity Alert Trigger
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                          Monitoring Radar Active (ETA: {activeBus?.etaMinutes || 'Offline'} Mins)...
                        </>
                      )
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" /> Enable Proximity Alert ({alertThresholdKm} km)
                      </>
                    )}
                  </button>
                  {isAlertSet && !alertTriggered && (
                    <p className="text-[9px] text-emerald-600 text-center font-mono leading-tight">
                      *Waiting for bus distance to cross &lt;= {alertThresholdKm}km. Open "Driver App" tab to drive Route 12!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Route Lookups Finder Search Bar */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search other routes (e.g. Route 45)..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
              />
            </div>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {filteredRoutes.map((route) => {
                const isActive = selectedRouteId === route.id;
                const activeBusOnRoute = liveBuses.find((b) => b.routeId === route.id);
                return (
                  <button
                    key={route.id}
                    onClick={() => {
                      setSelectedRouteId(route.id);
                      setScannedStop(null); // Clear QR scanned stop when clicking other routes manually
                      setIsAlertSet(false);
                      setAlertTriggered(false);
                      setShowNotificationToast(false);
                    }}
                    className={`w-full p-2 rounded-xl text-left text-xs transition-all flex items-center justify-between border ${
                      isActive
                        ? 'bg-slate-50 border-slate-300 font-bold text-slate-800'
                        : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: route.color }}></span>
                      <span className="truncate">{route.displayName}</span>
                    </div>
                    {activeBusOnRoute?.status === 'driving' ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide animate-pulse">
                        Live
                      </span>
                    ) : (
                      <span className="text-[8px] text-slate-400 font-mono">Offline</span>
                    )}
                  </button>
                );
              })}
              {filteredRoutes.length === 0 && (
                <p className="text-[11px] text-slate-400 text-center py-2">No matching routes found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Map Container (7 columns) */}
        <div className="lg:col-span-7 h-[500px] lg:h-[650px] flex flex-col">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold font-display text-slate-800 uppercase tracking-wide">
                  Live Commuter Map tracking Route {currentRoute?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Feature simulated successfully!')}
                  className="p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                  title="Share live location"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                {activeBus?.status === 'driving' ? (
                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 font-mono text-[9px] px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    ACTIVE TRACKING
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-slate-50 text-slate-500 font-mono text-[9px] px-2 py-0.5 rounded-full border border-slate-200">
                    STANDBY
                  </span>
                )}
              </div>
            </div>

            {/* Render CivicMap */}
            <div className="flex-1 min-h-0">
              <CivicMap
                center={
                  currentScannedStopDetails
                    ? { lat: currentScannedStopDetails.lat, lng: currentScannedStopDetails.lng }
                    : currentRoute?.waypoints[0]
                }
                zoom={14}
                routes={routes}
                stops={currentRoute?.stops || []}
                buses={liveBuses}
                activeRouteId={selectedRouteId}
                showStopsLabel={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
