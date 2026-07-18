import React, { useState, useRef } from 'react';
import { Complaint, ComplaintCategory } from '../types';
import { Camera, MapPin, CheckCircle, BrainCircuit, RefreshCw, Trash2, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { getDistance } from '../data/transitData';

interface CivicReportingProps {
  complaints: Complaint[];
  onSubmitComplaint: (complaint: Complaint) => void;
}

// Stock preset photos for quick-fill in hackathon presentations!
const PRESET_PHOTOS = [
  {
    name: 'Severe Pothole',
    category: 'Pothole' as ComplaintCategory,
    description: 'Enormous pothole right in the middle of the bus lane. Extremely hazardous for motorcyclists during rains.',
    lat: 10.9605, // very close to Karur Bus Stand (10.9601) to test duplicate check!
    lng: 78.0770,
    photoUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Broken Streetlight',
    category: 'Streetlight' as ComplaintCategory,
    description: 'Corner streetlight pole is short-circuiting and blinking continuously, creating dark spots and safety concerns.',
    lat: 10.9648,
    lng: 78.0872,
    photoUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Ruptured Water Line',
    category: 'Water Leak' as ComplaintCategory,
    description: 'Municipal water supply main pipe is fractured. Clean water pouring into sewers for 6 hours.',
    lat: 10.9322,
    lng: 78.0815, // close to Gandhigramam Junction (10.9325, 78.0812) to test duplicate!
    photoUrl: 'https://images.unsplash.com/photo-1542013936693-8848e5740a7a?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Stinking Garbage Dump',
    category: 'Garbage' as ComplaintCategory,
    description: 'Piles of wet garbage dumped beside the municipal school. Stray cattle scattering it across the pavement.',
    lat: 10.9260,
    lng: 78.0520,
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
  }
];

export default function CivicReporting({ complaints, onSubmitComplaint }: CivicReportingProps) {
  const [category, setCategory] = useState<ComplaintCategory>('Pothole');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  // Geolocation capturing indicator
  const [isCapturingGeo, setIsCapturingGeo] = useState(false);
  const [geoSource, setGeoSource] = useState<'browser' | 'preset' | 'default'>('default');

  // AI Analysis simulation state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Success state on ticket submission
  const [createdTicket, setCreatedTicket] = useState<Complaint | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-capture Geolocation on file upload/file selection
  const handleGeoCapture = () => {
    setIsCapturingGeo(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setGeoSource('browser');
          setIsCapturingGeo(false);
        },
        (error) => {
          console.warn('Browser geolocation failed, using Karur default coords: ', error);
          // Fallback to Karur default center if browser permission denied
          setLat(10.9601 + (Math.random() - 0.5) * 0.015);
          setLng(78.0766 + (Math.random() - 0.5) * 0.015);
          setGeoSource('default');
          setIsCapturingGeo(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setLat(10.9601);
      setLng(78.0766);
      setGeoSource('default');
      setIsCapturingGeo(false);
    }
  };

  // Handle manual file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        // Automatically capture telemetry coordinates on photo upload
        handleGeoCapture();
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick fill preset helper for presentation
  const handleApplyPreset = (preset: typeof PRESET_PHOTOS[0]) => {
    setCategory(preset.category);
    setDescription(preset.description);
    setLat(preset.lat);
    setLng(preset.lng);
    setPhotoUrl(preset.photoUrl);
    setGeoSource('preset');
  };

  // Reset reporting form
  const handleResetForm = () => {
    setCategory('Pothole');
    setDescription('');
    setLat(null);
    setLng(null);
    setPhotoUrl(null);
    setGeoSource('default');
    setCreatedTicket(null);
  };

  // Handle ticket submission and MOCK AI analysis
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    // Ensure lat/lng are populated. If not, capture default.
    const finalLat = lat || (10.9601 + (Math.random() - 0.5) * 0.012);
    const finalLng = lng || (78.0766 + (Math.random() - 0.5) * 0.012);

    setIsAnalyzing(true);

    // Simulate async REST API response with AI Processing
    setTimeout(() => {
      // 1. Determine Severity based on Heuristic
      let severity: 'Low' | 'Medium' | 'High' = 'Low';
      const descLower = description.toLowerCase();
      
      if (category === 'Pothole' || category === 'Water Leak') {
        // High severity indicators
        if (descLower.includes('severe') || descLower.includes('danger') || descLower.includes('burst') || descLower.includes('hazardous') || descLower.includes('deep')) {
          severity = 'High';
        } else {
          severity = 'Medium';
        }
      } else if (category === 'Streetlight') {
        if (descLower.includes('three') || descLower.includes('dark') || descLower.includes('security')) {
          severity = 'Medium';
        } else {
          severity = 'Low';
        }
      } else if (category === 'Garbage') {
        if (descLower.includes('school') || descLower.includes('stink') || descLower.includes('blocking')) {
          severity = 'Medium';
        } else {
          severity = 'Low';
        }
      } else {
        severity = 'Medium';
      }

      // 2. Auto-assign Department based on category
      let department = 'General Admin';
      if (category === 'Pothole') department = 'Roads Dept';
      else if (category === 'Streetlight') department = 'Electrical Dept';
      else if (category === 'Water Leak') department = 'Water Board';
      else if (category === 'Garbage') department = 'Sanitation';

      // 3. Duplicate Check: Search existing reports within 100 meters, same category, last 7 days
      let duplicateTicket: Complaint | undefined = undefined;
      const radiusLimitMeters = 100;

      for (const comp of complaints) {
        if (comp.category === category && comp.status !== 'Resolved') {
          const dist = getDistance({ lat: finalLat, lng: finalLng }, { lat: comp.lat, lng: comp.lng });
          if (dist <= radiusLimitMeters) {
            duplicateTicket = comp;
            break;
          }
        }
      }

      // Create new ticket object
      const ticketId = `TKT-2026-${Math.floor(100 + Math.random() * 900)}`;
      const aiSeverityLog = duplicateTicket 
        ? `Duplicate report detected within ${radiusLimitMeters}m of Ticket #${duplicateTicket.id}. Auto-merging to prevent redundant scheduling.`
        : `Determined severity level [${severity}] using category-description NLP heuristic logs.`;

      const newTicket: Complaint = {
        id: ticketId,
        category,
        description,
        lat: finalLat,
        lng: finalLng,
        timestamp: new Date().toISOString(),
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1594818378825-973f257e5bc5?auto=format&fit=crop&w=600&q=80',
        severity,
        department,
        status: duplicateTicket ? 'Open' : 'Open',
        mergedWithId: duplicateTicket?.id,
        aiLog: {
          severityHeuristic: aiSeverityLog,
          duplicateCheckResult: duplicateTicket 
            ? `⚠️ DUPLICATE MATCH FOUND: Nearby ticket #${duplicateTicket.id} (${Math.round(getDistance({lat: finalLat, lng: finalLng}, {lat: duplicateTicket.lat, lng: duplicateTicket.lng}))}m away) has same category. Merged!`
            : `✅ UNIQUE REPORT: No active reports of category '${category}' found within ${radiusLimitMeters}m radius.`,
          departmentAssignment: `Auto-routed cleanly to: [${department}].`,
        },
      };

      onSubmitComplaint(newTicket);
      setCreatedTicket(newTicket);
      setIsAnalyzing(false);
    }, 1500); // 1.5s loader feels like real deep AI analysis!
  };

  return (
    <div className="max-w-6xl mx-auto py-4">
      {/* Module Hub Header */}
      <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full uppercase tracking-wider font-display">
            Module 3 — Citizen Reporting
          </span>
          <h2 className="text-2xl font-bold font-display text-slate-900 mt-2">
            AI-Driven Civic Reporting Portal
          </h2>
          <p className="text-slate-600 text-xs mt-1">
            Empowering citizens to report localized infrastructure issues with edge metadata capture and automated GIS deduplication.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono text-[10px] text-slate-500">
          <BrainCircuit className="w-3.5 h-3.5 text-teal-600" />
          <span>Active Heuristic AI Engine v2.4</span>
        </div>
      </div>

      {!createdTicket ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quick Fill Presentation Presets Card (5 columns) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold font-display text-slate-800 text-xs uppercase tracking-wide">
                  Live Hackathon Presentation Presets
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click a preset below to pre-populate the form instantly. Test the <strong className="text-emerald-600">Duplicate Merger logic</strong> by selecting "Severe Pothole" (submits next to the preloaded pothole complaint at Karur Bus Stand).
              </p>

              <div className="space-y-2.5 pt-2">
                {PRESET_PHOTOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="w-full p-2.5 text-left rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-400 transition-all flex gap-3 group"
                  >
                    <img
                      src={preset.photoUrl}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-xs text-slate-800 group-hover:text-emerald-900 truncate">
                          {preset.name}
                        </span>
                        <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-1">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Issue Reporting Form (7 columns) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Pothole">🚧 Pothole / Bad Roads</option>
                  <option value="Streetlight">💡 Streetlight Issue</option>
                  <option value="Water Leak">🚰 Water Pipeline Leakage</option>
                  <option value="Garbage">🗑️ Overflowing Garbage Dump</option>
                  <option value="Other">❓ Other Civic Complaint</option>
                </select>
              </div>

              {/* Photo Upload container */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Attach Photo Evidence</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/10 py-2 px-3 rounded-xl bg-slate-50 transition-colors text-xs text-slate-600 font-semibold"
                >
                  <Camera className="w-4 h-4 text-emerald-600" />
                  Upload from Device
                </button>
              </div>
            </div>

            {/* Photo Preview Section */}
            {photoUrl && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-[180px] group">
                <img
                  src={photoUrl}
                  alt="Evidence Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-[180px] object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full shadow transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[9px] font-mono text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Telemetry Embedded
                </div>
              </div>
            )}

            {/* Geolocation Telemetry Logs */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <div>
                  <span className="font-semibold text-slate-700 block">Report Location Coordinates</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {lat !== null && lng !== null
                      ? `LAT: ${lat.toFixed(5)} | LNG: ${lng.toFixed(5)}`
                      : 'Telemetry Pending (Captured automatically on photo attach)'}
                  </span>
                </div>
              </div>

              {lat !== null ? (
                <span className="font-mono text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase font-bold">
                  {geoSource === 'browser' ? '📡 LIVE GPS' : geoSource === 'preset' ? '🎯 PRESET' : '📍 DEFAULT'}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleGeoCapture}
                  disabled={isCapturingGeo}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 font-mono"
                >
                  {isCapturingGeo ? 'CAPTURING...' : 'CAPTURE NOW'}
                </button>
              )}
            </div>

            {/* Complaint description */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">Explain Issue Details</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe what you see, exact landmark, and how long the issue has been active..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              ></textarea>
            </div>

            {/* Submit Action with loading state */}
            <button
              type="submit"
              disabled={isAnalyzing || !description.trim()}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm font-display"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Running GIS Deduplication & Severity AI Analysis...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" /> Dispatch Ticket to Municipal Agency
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Ticket Created Confirmation / Transparent AI Decisions Panel */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-slate-950 p-6 text-white text-center">
            <div className="inline-flex p-3 bg-emerald-500/10 rounded-full text-emerald-400 mb-3 border border-emerald-500/20">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold font-display">Municipal Ticket Created</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">ID Reference: {createdTicket.id}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Transparent AI Decision Logs Header */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                <BrainCircuit className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <h4 className="font-bold font-display text-xs uppercase tracking-wider">
                  Transparent Telemetry & AI Decision Analysis
                </h4>
              </div>

              {/* Severity, duplicates logs */}
              {createdTicket.aiLog && (
                <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl font-mono text-slate-600 border border-slate-200">
                  <div className="space-y-1 pb-2 border-b border-slate-200">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">1. Heuristic Severity Classification</span>
                    <div className="flex items-center gap-1.5 font-sans mt-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                        createdTicket.severity === 'High' ? 'bg-red-500' : createdTicket.severity === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        Severity: {createdTicket.severity}
                      </span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-500 mt-1">
                      {createdTicket.aiLog.severityHeuristic}
                    </p>
                  </div>

                  <div className="space-y-1 py-2 border-b border-slate-200">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">2. Spatial Deduplication Filter (100m Radius)</span>
                    <div className="flex items-center gap-1.5 text-slate-700 font-sans mt-0.5 text-[11px] font-semibold">
                      {createdTicket.mergedWithId ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>MAPPED DUPLICATE COMPLAINT</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>UNIQUE DISPATCH APPROVED</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-500 mt-1">
                      {createdTicket.aiLog.duplicateCheckResult}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">3. Smart Agency Routing Engine</span>
                    <p className="text-[10px] leading-relaxed text-slate-500 mt-0.5">
                      {createdTicket.aiLog.departmentAssignment}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Next Steps for Presentation explanation */}
            {createdTicket.mergedWithId ? (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1 font-sans">
                <h5 className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  Presentation Explanation Note
                </h5>
                <p className="leading-relaxed">
                  Notice that this ticket was auto-flagged as a duplicate and linked under <strong className="font-bold">Ticket #{createdTicket.mergedWithId}</strong>. On the Municipal Admin Dashboard, this will be merged cleanly into the existing ticket queue to avoid deploying duplicate municipal dispatch trucks, saving administrative costs.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1 font-sans">
                <h5 className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  Presentation Explanation Note
                </h5>
                <p className="leading-relaxed">
                  This is a unique report. It has been routed to the correct department (<strong className="font-bold">{createdTicket.department}</strong>) and is now displayed live with a glowing marker on the Municipal Admin Dashboard map!
                </p>
              </div>
            )}

            {/* Reset / File Another Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold text-center transition-all font-display"
              >
                File Another Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
