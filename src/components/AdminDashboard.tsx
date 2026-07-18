import React, { useState, useMemo } from 'react';
import { Complaint, ComplaintCategory } from '../types';
import { MapPin, FileSpreadsheet, Eye, RefreshCw, BarChart4, Filter, ChevronRight, Check, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import CivicMap from './CivicMap';

interface AdminDashboardProps {
  complaints: Complaint[];
  onUpdateComplaintStatus: (id: string, newStatus: 'Open' | 'In Progress' | 'Resolved') => void;
}

export default function AdminDashboard({ complaints, onUpdateComplaintStatus }: AdminDashboardProps) {
  // Filters state
  const [filterDept, setFilterDept] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Selected complaint for sidebar details
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);

  // Map center coordinates (updated when clicking a ticket to focus)
  const [mapCenter, setMapCenter] = useState({ lat: 10.9601, lng: 78.0766 });
  const [mapZoom, setMapZoom] = useState(14);

  // Get departments present in complaints for filters
  const departmentsList = useMemo(() => {
    const depts = new Set<string>();
    complaints.forEach((c) => {
      if (c.department) depts.add(c.department);
    });
    return Array.from(depts);
  }, [complaints]);

  // Filter complaints based on criteria
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchDept = filterDept === 'All' || c.department === filterDept;
      const matchSeverity = filterSeverity === 'All' || c.severity === filterSeverity;
      const matchStatus = filterStatus === 'All' || c.status === filterStatus;
      return matchDept && matchSeverity && matchStatus;
    });
  }, [complaints, filterDept, filterSeverity, filterStatus]);

  // Compute analytics statistics
  const stats = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
    const open = complaints.filter((c) => c.status === 'Open').length;
    
    // Average Resolution Time (mocked but reflects active tickets)
    const baseResHours = 12.8;
    const avgResTime = (baseResHours - (resolved * 0.4)).toFixed(1);

    // Count complaints by category for the bar chart
    const categoryCounts: Record<ComplaintCategory, number> = {
      Pothole: 0,
      Streetlight: 0,
      'Water Leak': 0,
      Garbage: 0,
      Other: 0,
    };
    complaints.forEach((c) => {
      if (categoryCounts[c.category] !== undefined) {
        categoryCounts[c.category]++;
      } else {
        categoryCounts.Other++;
      }
    });

    const maxCategoryCount = Math.max(...(Object.values(categoryCounts) as number[]), 1);

    return {
      total,
      resolved,
      inProgress,
      open,
      avgResTime,
      categoryCounts,
      maxCategoryCount,
    };
  }, [complaints]);

  // Focus and select a ticket
  const handleSelectTicket = (ticket: Complaint) => {
    setSelectedTicket(ticket);
    setMapCenter({ lat: ticket.lat, lng: ticket.lng });
    setMapZoom(16); // zoom in on selected complaint!
  };

  const handleStatusChange = (ticketId: string, newStatus: 'Open' | 'In Progress' | 'Resolved') => {
    onUpdateComplaintStatus(ticketId, newStatus);
    // Sync local selected ticket state
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wider font-display">
            Module 4 — Municipal Admin Portal
          </span>
          <h2 className="text-2xl font-bold font-display text-slate-900 mt-2">
            Karur Municipal GIS Command Center
          </h2>
          <p className="text-slate-600 text-xs mt-1">
            Real-time visual map, automatic ticket queue deduplication, and direct task status dispatching.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>ADMINISTRATIVE GIS SECURE UPTIME: 100%</span>
        </div>
      </div>

      {/* Analytics Summary Header Cards & Custom Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI Card 1: Total Reports */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Reports</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-mono text-slate-950">{stats.total}</span>
            <span className="text-xs font-mono text-slate-400">Tickets active</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>{stats.open} Open</span>
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>{stats.inProgress} In-Progress</span>
          </div>
        </div>

        {/* KPI Card 2: Resolution Rate */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Resolution Rate</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-mono text-emerald-600">
              {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
            </span>
            <span className="text-xs font-mono text-slate-400">{stats.resolved} of {stats.total} resolved</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>Resolved This Week:</span>
            <strong className="text-slate-800 font-bold">{stats.resolved} Tickets</strong>
          </div>
        </div>

        {/* KPI Card 3: Avg Resolution Time */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Avg Resolution Time</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-mono text-slate-950">{stats.avgResTime} Hrs</span>
            <span className="text-xs font-mono text-slate-400">Karur District Target: 24h</span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-600 pt-2 border-t border-slate-100 flex items-center gap-1 font-semibold">
            <Check className="w-3.5 h-3.5" />
            <span>Exceeding target SLAs by 41%</span>
          </div>
        </div>

        {/* KPI Card 4: Category Bar Chart (High fidelity HTML layout) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between md:col-span-1">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex justify-between items-center mb-1">
            <span>Complaints by Category</span>
            <BarChart4 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          
          {/* Custom micro bar chart */}
          <div className="space-y-1.5 py-1">
            {Object.entries(stats.categoryCounts).map(([cat, val]) => {
              const count = val as number;
              const percent = (count / stats.maxCategoryCount) * 100;
              return (
                <div key={cat} className="space-y-0.5">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-slate-600 font-medium truncate max-w-[80px]">{cat}</span>
                    <span className="font-mono font-bold text-slate-900">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Filters, Table, Map, Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left GIS Table View Panel (7 columns) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[700px]">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Filter GIS View ({filteredComplaints.length} loaded)</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Dept filter */}
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-white border border-slate-200 text-[11px] rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">All Departments</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Severity filter */}
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-white border border-slate-200 text-[11px] rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">All Severities</option>
                <option value="High">🔴 High</option>
                <option value="Medium">🟠 Medium</option>
                <option value="Low">🔵 Low</option>
              </select>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-200 text-[11px] rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Ticket Queue list */}
          <div className="flex-1 overflow-y-auto">
            {filteredComplaints.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono bg-slate-50/20">
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Severity</th>
                    <th className="py-3 px-2">Department</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-4 text-right">Focus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredComplaints.map((ticket) => {
                    const isSelected = selectedTicket?.id === ticket.id;
                    return (
                      <tr
                        key={ticket.id}
                        onClick={() => handleSelectTicket(ticket)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-50/40 border-l-4 border-l-emerald-600' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-slate-900 block font-mono">{ticket.id}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(ticket.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="font-semibold text-slate-800">{ticket.category}</span>
                          {ticket.mergedWithId && (
                            <span className="text-[8px] block font-semibold text-rose-500 uppercase mt-0.5 animate-pulse">
                              Duplicate (Merged)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-2">
                          <span
                            className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              ticket.severity === 'High'
                                ? 'bg-red-50 text-red-700'
                                : ticket.severity === 'Medium'
                                ? 'bg-orange-50 text-orange-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {ticket.severity}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-slate-500 font-mono text-[10px]">{ticket.department}</td>
                        <td className="py-3.5 px-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                              ticket.status === 'Resolved'
                                ? 'bg-green-50 text-green-700'
                                : ticket.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            <span
                              className={`w-1 h-1 rounded-full ${
                                ticket.status === 'Resolved'
                                  ? 'bg-green-500'
                                  : ticket.status === 'In Progress'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            ></span>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button className="p-1 hover:bg-slate-200/60 rounded text-slate-400 hover:text-slate-700 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4">
                <FileSpreadsheet className="w-12 h-12 text-slate-300 mb-2" />
                <h4 className="font-semibold text-slate-700">No tickets found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                  No complaints match your active filters. Try adjusting your parameters.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Map View & Interactive Details (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-[700px]">
          
          {/* Map view section */}
          <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 min-h-0 flex flex-col">
            <div className="flex justify-between items-center mb-1.5 px-1">
              <span className="text-xs font-bold text-slate-800 uppercase font-display tracking-wider flex items-center gap-1">
                <MapPin className="w-4 h-4 text-rose-500" />
                Karur District Ticket Pins
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Zoom level: {mapZoom}</span>
            </div>
            
            <div className="flex-1 min-h-0">
              <CivicMap
                center={mapCenter}
                zoom={mapZoom}
                complaints={filteredComplaints}
                selectedComplaintId={selectedTicket?.id}
                onComplaintClick={handleSelectTicket}
                showStopsLabel={false}
              />
            </div>
          </div>

          {/* Interactive Ticket Details Sidebar/Panel */}
          <div className="h-[280px] bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between overflow-y-auto">
            {selectedTicket ? (
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-sm font-mono text-slate-900">{selectedTicket.id}</strong>
                        {selectedTicket.mergedWithId && (
                          <span className="bg-red-50 text-red-600 border border-red-200 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                            DUPLICATE MERGED
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Filer Coordinates: ({selectedTicket.lat.toFixed(5)}, {selectedTicket.lng.toFixed(5)})
                      </p>
                    </div>
                    
                    {/* Status Select action */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-400">DISPATCH:</span>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) =>
                          handleStatusChange(
                            selectedTicket.id,
                            e.target.value as 'Open' | 'In Progress' | 'Resolved'
                          )
                        }
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  {/* Desc & photo content */}
                  <div className="flex gap-4 mt-3">
                    {selectedTicket.photoUrl && (
                      <img
                        src={selectedTicket.photoUrl}
                        alt="Evidence evidence"
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500">{selectedTicket.category}</span>
                        <span className="text-[10px] text-slate-300">|</span>
                        <span className="text-[10px] text-slate-400 font-mono">{selectedTicket.department}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {selectedTicket.description}
                      </p>
                    </div>
                  </div>

                  {/* AI Logs nested drawer */}
                  {selectedTicket.aiLog && (
                    <div className="mt-3 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[9px] font-mono text-slate-500 leading-tight space-y-1">
                      <div className="text-[10px] text-emerald-800 font-bold uppercase font-display tracking-wider flex items-center gap-1 mb-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Transparent AI Log
                      </div>
                      <p>
                        <strong className="text-slate-700">Deduplication:</strong> {selectedTicket.aiLog.duplicateCheckResult}
                      </p>
                      <p>
                        <strong className="text-slate-700">Classification:</strong> {selectedTicket.aiLog.severityHeuristic}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-2.5 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Filed {new Date(selectedTicket.timestamp).toLocaleTimeString()}</span>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Deselect Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-6">
                <Eye className="w-10 h-10 text-slate-300 mb-2" />
                <h4 className="font-semibold text-slate-700 text-xs">No Ticket Selected</h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[240px]">
                  Select any ticket in the list or click a marker on the map to display full telemetry reports, upload evidence, and update status.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
