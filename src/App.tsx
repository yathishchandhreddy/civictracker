import { useState, useEffect } from 'react';
import { TRANSIT_ROUTES, PRELOADED_COMPLAINTS } from './data/transitData';
import { createInitialBusStates, simulateBusStep } from './utils/simulation';
import { LiveBusState, Complaint } from './types';

// Component Imports
import DriverPortal from './components/DriverPortal';
import CommuterPortal from './components/CommuterPortal';
import CivicReporting from './components/CivicReporting';
import AdminDashboard from './components/AdminDashboard';

// Icon Imports
import { Compass, Bus, Wrench, ShieldAlert, Sparkles, CheckCircle, Home, ArrowRight, Activity, Cpu } from 'lucide-react';

export default function App() {
  // Navigation Tabs State
  // 'home' | 'commuter' | 'driver' | 'report' | 'admin'
  const [activeTab, setActiveTab] = useState<string>('home');

  // Shared Central State (Syncs transit simulator & citizen complaints)
  const [liveBuses, setLiveBuses] = useState<LiveBusState[]>(() =>
    createInitialBusStates(TRANSIT_ROUTES)
  );
  const [complaints, setComplaints] = useState<Complaint[]>(PRELOADED_COMPLAINTS);

  // Centralized Simulation Timer Interval:
  // Runs every 2 seconds to calculate real-time bus telemetry updates
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveBuses((prevBuses) =>
        prevBuses.map((bus) => {
          if (bus.status !== 'driving') return bus;
          const matchingRoute = TRANSIT_ROUTES.find((r) => r.id === bus.routeId);
          if (!matchingRoute) return bus;
          return simulateBusStep(bus, matchingRoute, 25); // Simulate 25 seconds of route progress per tick
        })
      );
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  // Dispatchers & Handlers
  const handleStartTrip = (routeId: string, driverId: string) => {
    setLiveBuses((prev) =>
      prev.map((bus) => {
        if (bus.routeId === routeId) {
          const matchingRoute = TRANSIT_ROUTES.find((r) => r.id === routeId);
          return {
            ...bus,
            status: 'driving',
            currentWaypointIndex: 0,
            currentPosition: matchingRoute?.waypoints[0] || bus.currentPosition,
            speed: matchingRoute?.averageSpeedKmh || 30,
            duration: 0,
            distanceCovered: 0,
            nextStop: matchingRoute?.stops[1] || null,
            etaMinutes: 3,
          };
        }
        return bus;
      })
    );
  };

  const handleEndTrip = (routeId: string) => {
    setLiveBuses((prev) =>
      prev.map((bus) => {
        if (bus.routeId === routeId) {
          return {
            ...bus,
            status: 'idle',
            speed: 0,
            nextStop: null,
            etaMinutes: 0,
          };
        }
        return bus;
      })
    );
  };

  // Prepend new complaint reported by citizens
  const handleAddComplaint = (newComplaint: Complaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
  };

  // Update complaint status from Admin console
  const handleUpdateComplaintStatus = (
    id: string,
    newStatus: 'Open' | 'In Progress' | 'Resolved'
  ) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  // Count active stats
  const activeBusesCount = liveBuses.filter((b) => b.status === 'driving').length;
  const unresolvedComplaintsCount = complaints.filter((c) => c.status !== 'Resolved').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Master Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* App Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl flex items-center justify-center shadow shadow-emerald-500/20">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-display tracking-tight leading-none">CivicTrack <span className="text-emerald-400 font-normal">Karur</span></h1>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider font-mono">Smart Mobility & GIS</span>
              </div>
            </div>

            {/* Nav Tabs */}
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'home'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4" /> Home Hub
              </button>

              <button
                onClick={() => setActiveTab('commuter')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'commuter'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Bus className="w-4 h-4" /> Commuter Portal
              </button>

              <button
                onClick={() => setActiveTab('driver')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'driver'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Cpu className="w-4 h-4" /> Driver App
              </button>

              <button
                onClick={() => setActiveTab('report')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'report'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Wrench className="w-4 h-4" /> Report Issue
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'admin'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4" /> Admin Command
              </button>
            </div>

            {/* Live Operational Metadata Pills */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-mono">
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${activeBusesCount > 0 ? 'animate-ping' : ''}`}></span>
                BUSES LIVE: {activeBusesCount}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[9px] font-mono">
                PENDING TICKETS: {unresolvedComplaintsCount}
              </span>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer Overlay (Bottom bar for smaller devices) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950 border-t border-slate-850 py-2.5 px-3 flex justify-around items-center text-[10px] text-slate-400">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('commuter')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'commuter' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <Bus className="w-4 h-4" />
          <span>Commuter</span>
        </button>
        <button
          onClick={() => setActiveTab('driver')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'driver' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <Cpu className="w-4 h-4" />
          <span>Driver</span>
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'report' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <Wrench className="w-4 h-4" />
          <span>Report</span>
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'admin' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Admin</span>
        </button>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 md:mb-6">
        
        {activeTab === 'home' && (
          <div className="space-y-10 py-4 max-w-6xl mx-auto">
            {/* Interactive Hero Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="max-w-2xl space-y-4 relative z-10">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold tracking-wide font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Hackathon Working Demo
                </span>
                <h2 className="text-3xl md:text-4.5xl font-bold font-display tracking-tight leading-tight">
                  Unified GIS Smart Mobility & Civic Reporting for Tier-2/3 Cities
                </h2>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  CivicTrack solves the "data-blind" transit wait and municipal scheduling problems in emerging cities like <strong className="text-white font-semibold">Karur, Tamil Nadu</strong> using low-cost QR smart indicators and automated AI-heuristic ticket deduplication.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('commuter')}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Interactive Commuter Map <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveTab('report')}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    File Civic Complaint <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Hackathon Guide & Walkthrough Flow */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
              <h3 className="text-sm font-bold font-display text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" /> Live Demo Judges' Guided Tour
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-slate-600">
                <div className="space-y-2 border-l-2 border-slate-200 pl-4">
                  <span className="font-mono text-emerald-600 font-bold block">STEP 1</span>
                  <h4 className="font-bold text-slate-900 text-xs">Simulate Driver Dispatch</h4>
                  <p className="leading-relaxed">
                    Go to the <strong className="text-slate-800">Driver App</strong> tab. Log in, select Route 12, and click <strong className="text-slate-800">Start Trip</strong>. This begins transmitting simulated GPS coordinate telemetry.
                  </p>
                </div>

                <div className="space-y-2 border-l-2 border-slate-200 pl-4">
                  <span className="font-mono text-emerald-600 font-bold block">STEP 2</span>
                  <h4 className="font-bold text-slate-900 text-xs">Observe Commuter Map</h4>
                  <p className="leading-relaxed">
                    Switch to the <strong className="text-slate-800">Commuter Portal</strong>. You'll see the bus moving along Route 12 in real-time, displaying live ETAs and distance markers dynamically.
                  </p>
                </div>

                <div className="space-y-2 border-l-2 border-slate-200 pl-4">
                  <span className="font-mono text-emerald-600 font-bold block">STEP 3</span>
                  <h4 className="font-bold text-slate-900 text-xs">Trigger Proximity Alert</h4>
                  <p className="leading-relaxed">
                    Click "Enable Proximity Alert". Choose a 1.5km limit. As the bus drives closer, watch a physical SMS-style alert popup with chime audio immediately!
                  </p>
                </div>

                <div className="space-y-2 border-l-2 border-slate-200 pl-4">
                  <span className="font-mono text-emerald-600 font-bold block">STEP 4</span>
                  <h4 className="font-bold text-slate-900 text-xs">File & Deduplicate Issues</h4>
                  <p className="leading-relaxed">
                    Go to <strong className="text-slate-800">Report Issue</strong>. Use a presentation preset. Submit to test Heuristic AI NLP and spatial deduplication merging!
                  </p>
                </div>
              </div>
            </div>

            {/* Features Spotlight bento grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Feature Card 1 */}
              <div
                onClick={() => setActiveTab('commuter')}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-md cursor-pointer transition-all space-y-4 group"
              >
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold font-display text-slate-900 group-hover:text-emerald-900 text-sm">QR Commuter Station</h4>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    Preloads stop-specific timetables, live tracking maps, and proximity SMS/sound chimes upon QR scan.
                  </p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div
                onClick={() => setActiveTab('driver')}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-md cursor-pointer transition-all space-y-4 group"
              >
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold font-display text-slate-900 group-hover:text-emerald-900 text-sm">Driver IoT Terminal</h4>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    In-cab mobile driver screen compiling telemetry logs, speed dials, route progress, and dispatch terminals.
                  </p>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div
                onClick={() => setActiveTab('report')}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-md cursor-pointer transition-all space-y-4 group"
              >
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold font-display text-slate-900 group-hover:text-emerald-900 text-sm">AI Citizen Reporting</h4>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    Citizen incident filings with geo-tags, camera captures, and heuristic duplicate spatial merges within 100m.
                  </p>
                </div>
              </div>

              {/* Feature Card 4 */}
              <div
                onClick={() => setActiveTab('admin')}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-md cursor-pointer transition-all space-y-4 group"
              >
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold font-display text-slate-900 group-hover:text-emerald-900 text-sm">Municipal GIS Command</h4>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    Control tower filtering citizen reports by category/severity with status modifications and routing maps.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab Modules Routing Rendering */}
        {activeTab === 'commuter' && (
          <CommuterPortal routes={TRANSIT_ROUTES} liveBuses={liveBuses} />
        )}

        {activeTab === 'driver' && (
          <DriverPortal
            routes={TRANSIT_ROUTES}
            liveBuses={liveBuses}
            onStartTrip={handleStartTrip}
            onEndTrip={handleEndTrip}
          />
        )}

        {activeTab === 'report' && (
          <CivicReporting complaints={complaints} onSubmitComplaint={handleAddComplaint} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            complaints={complaints}
            onUpdateComplaintStatus={handleUpdateComplaintStatus}
          />
        )}

      </main>

      {/* Simple footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-850 mt-auto">
        <p>CivicTrack — Tier-2 Smart Mobility & Reporting Hackathon Demo • Base Map Center: Karur, Tamil Nadu (10.9601° N, 78.0766° E)</p>
        <p className="text-[10px] text-slate-600 mt-1 font-mono">Stand-alone LocalStorage & In-Memory Mode (Production Build Ready)</p>
      </footer>

    </div>
  );
}
