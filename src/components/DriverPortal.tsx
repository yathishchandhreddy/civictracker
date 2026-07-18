import React, { useState, useEffect } from 'react';
import { TransitRoute, LiveBusState } from '../types';
import { Play, Square, User, MapPin, Gauge, Clock, Navigation, CheckCircle } from 'lucide-react';

interface DriverPortalProps {
  routes: TransitRoute[];
  liveBuses: LiveBusState[];
  onStartTrip: (routeId: string, driverId: string) => void;
  onEndTrip: (routeId: string) => void;
  onUpdateSpeed?: (routeId: string, speedMultiplier: number) => void;
}

export default function DriverPortal({
  routes,
  liveBuses,
  onStartTrip,
  onEndTrip,
}: DriverPortalProps) {
  const [driverId, setDriverId] = useState('DRV-2026');
  const [selectedRouteId, setSelectedRouteId] = useState('route-12');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Find the live bus state for the selected route
  const currentBus = liveBuses.find((b) => b.routeId === selectedRouteId);
  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (driverId.trim()) {
      setIsLoggedIn(true);
    }
  };

  const handleStart = () => {
    onStartTrip(selectedRouteId, driverId);
  };

  const handleEnd = () => {
    onEndTrip(selectedRouteId);
  };

  // Format seconds into MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate percentage completion of waypoints
  const getPercentCompleted = () => {
    if (!currentBus || !selectedRoute) return 0;
    return Math.round((currentBus.currentWaypointIndex / (selectedRoute.waypoints.length - 1)) * 100);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-stretch max-w-5xl mx-auto py-4">
      {/* Introduction Card */}
      <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full uppercase tracking-wider font-display">
            Module 1 — Mobile View
          </span>
          <h2 className="text-2xl font-bold font-display text-slate-900 mt-3 mb-4">
            Smart Transit Driver Terminal
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            This module represents the in-vehicle driver console interface. It transmits simulated high-fidelity GPS telemetry back to the central servers at regular intervals.
          </p>
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl text-xs text-slate-500 font-mono mb-6">
            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span>Telemetry Interval:</span>
              <span className="text-emerald-600 font-bold">2.0s (Simulated GPS Ping)</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span>Accuracy:</span>
              <span className="text-emerald-600 font-bold">High Precision (&lt;5m error)</span>
            </div>
            <div className="flex justify-between">
              <span>Time-Compression:</span>
              <span className="text-emerald-600 font-bold">15x Accelerated Route Time</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 text-xs text-slate-400">
          <p>💡 Tip: Login, choose <strong className="text-slate-600">Route 12</strong>, and click <strong className="text-slate-600">Start Trip</strong>. Then, switch to the Commuter tab to view the live bus tracking synchronously on the public map!</p>
        </div>
      </div>

      {/* Mobile Simulation Frame */}
      <div className="w-full max-w-[360px] mx-auto bg-slate-950 p-3 rounded-[40px] shadow-2xl border-4 border-slate-800 relative overflow-hidden flex-shrink-0">
        {/* Smartphone Camera Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
          <div className="w-4 h-1 bg-slate-900 rounded-full"></div>
        </div>

        {/* Screen Container */}
        <div className="bg-slate-900 rounded-[32px] h-[580px] overflow-hidden relative flex flex-col pt-6 font-sans text-slate-100">
          
          {/* Header Bar */}
          <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>CivicTrack Driver v1.0</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>5G</span>
            </div>
          </div>

          {!isLoggedIn ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="flex-1 p-6 flex flex-col justify-between">
              <div className="space-y-5 pt-8">
                <div className="text-center">
                  <div className="inline-flex p-3 bg-emerald-500/10 rounded-full text-emerald-400 mb-2">
                    <Navigation className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-white">Console Authorization</h3>
                  <p className="text-xs text-slate-400 mt-1">Authenticate your in-vehicle terminal</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Driver Employee ID</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={driverId}
                        onChange={(e) => setDriverId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                        placeholder="DRV-XXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Assigned Route Path</label>
                    <select
                      value={selectedRouteId}
                      onChange={(e) => setSelectedRouteId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.name} — {route.stops[route.stops.length - 1].name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all duration-150 shadow-lg shadow-emerald-900/30 font-display"
              >
                Sign In to Console
              </button>
            </form>
          ) : (
            /* Active Simulation Interface */
            <div className="flex-1 flex flex-col justify-between p-5">
              
              {/* Route & Driver details */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">ACTIVE DRIVER</span>
                  <p className="text-sm font-bold text-white">{driverId}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">ROUTE</span>
                  <p className="text-sm font-bold text-emerald-400">{selectedRoute?.name}</p>
                </div>
              </div>

              {/* Status display logic */}
              {currentBus?.status === 'idle' && (
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mb-4 animate-pulse">
                    <Square className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-white">System Idle</h4>
                  <p className="text-xs text-slate-400 max-w-[200px] mt-1">
                    Terminal connected. GPS broadcasting offline until trip starts.
                  </p>
                  
                  <button
                    onClick={handleStart}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all shadow-emerald-950/40"
                  >
                    <Play className="w-4 h-4 fill-white" /> Start Dispatch Trip
                  </button>
                </div>
              )}

              {currentBus?.status === 'driving' && (
                <div className="flex-1 flex flex-col justify-between py-4">
                  {/* Dynamic Broadcasting Alert */}
                  <div className="flex items-center justify-center gap-2 py-1.5 px-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 w-fit mx-auto animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">BROADCASTING GPS TELEMETRY</span>
                  </div>

                  {/* Telemetry Dashboard Widgets */}
                  <div className="grid grid-cols-2 gap-3 my-4">
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-semibold uppercase">Speed</span>
                      </div>
                      <p className="text-xl font-bold font-mono text-white">
                        {Math.round(currentBus.speed)} <span className="text-xs text-slate-400">km/h</span>
                      </p>
                    </div>

                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-semibold uppercase">Duration</span>
                      </div>
                      <p className="text-xl font-bold font-mono text-white">
                        {formatDuration(currentBus.duration)}
                      </p>
                    </div>
                  </div>

                  {/* Next Stop Panel */}
                  <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700/80 space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>NEXT TRANSIT NODE</span>
                      <span className="text-emerald-400">ETA: {currentBus.etaMinutes} MIN</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <p className="text-sm font-bold text-white leading-tight">
                        {currentBus.nextStop?.name || 'Approaching Terminal'}
                      </p>
                    </div>

                    {/* Simple progress track */}
                    <div className="space-y-1 pt-1.5">
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>Route Progress</span>
                        <span>{getPercentCompleted()}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${getPercentCompleted()}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* End Trip Action */}
                  <button
                    onClick={handleEnd}
                    className="w-full mt-4 py-2.5 bg-red-600/90 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" /> End Dispatch Trip
                  </button>
                </div>
              )}

              {currentBus?.status === 'completed' && (
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <h4 className="font-semibold text-white">Trip Completed</h4>
                  <p className="text-xs text-slate-400 max-w-[200px] mt-1">
                    Route terminated successfully. Total duration: {formatDuration(currentBus.duration)}.
                  </p>

                  <div className="mt-6 flex flex-col gap-2 w-full">
                    <button
                      onClick={handleStart}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
                    >
                      Start New Dispatch
                    </button>
                    <button
                      onClick={() => setIsLoggedIn(false)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
                    >
                      Logout Terminal
                    </button>
                  </div>
                </div>
              )}

              {/* Console logs output simulator */}
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[8px] font-mono text-slate-500 overflow-hidden text-left h-12 select-none">
                <span className="text-slate-400">&gt;_ CONSOLE BROADCAST FEED</span>
                {currentBus?.status === 'driving' ? (
                  <p className="text-emerald-500/80 animate-pulse">
                    [{new Date().toLocaleTimeString()}] PING lat:{currentBus.currentPosition.lat.toFixed(4)} lng:{currentBus.currentPosition.lng.toFixed(4)} speed:{Math.round(currentBus.speed)}km/h (OK)
                  </p>
                ) : (
                  <p>[{new Date().toLocaleTimeString()}] BROADCAST OFFLINE — WAITING INGRESS_EVENT...</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
