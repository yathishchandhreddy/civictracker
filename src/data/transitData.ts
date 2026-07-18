import { TransitRoute, Complaint, LatLng } from '../types';

// Helper to calculate distance in meters between two lat/lng points
export function getDistance(p1: LatLng, p2: LatLng): number {
  const R = 6371000; // meters
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Interpoloate waypoints between points to make a smooth path
function interpolatePoints(p1: LatLng, p2: LatLng, steps: number): LatLng[] {
  const points: LatLng[] = [];
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    points.push({
      lat: p1.lat + (p2.lat - p1.lat) * fraction,
      lng: p1.lng + (p2.lng - p1.lng) * fraction,
    });
  }
  return points;
}

// Karur, Tamil Nadu base coordinates
// Karur Bus Stand: 10.9601, 78.0766
// Collectorate: 10.9425, 78.0831
// Gandhigramam: 10.9330, 78.0805
// Industrial Estate: 10.9180, 78.0910

// Route 12 Path Interpolation
const r12Keypoints = [
  { lat: 10.9601, lng: 78.0766 }, // Karur Bus Stand
  { lat: 10.9520, lng: 78.0790 }, // Midpoint 1
  { lat: 10.9425, lng: 78.0831 }, // Collectorate
  { lat: 10.9380, lng: 78.0810 }, // Midpoint 2
  { lat: 10.9330, lng: 78.0805 }, // Gandhigramam
  { lat: 10.9240, lng: 78.0860 }, // Midpoint 3
  { lat: 10.9180, lng: 78.0910 }, // Industrial Estate
];

const r12Waypoints: LatLng[] = [];
for (let i = 0; i < r12Keypoints.length - 1; i++) {
  const segments = interpolatePoints(r12Keypoints[i], r12Keypoints[i + 1], 8);
  // Avoid duplicate points at segment boundaries
  if (i > 0) segments.shift();
  r12Waypoints.push(...segments);
}

// Route 45 Path Interpolation
// Karur Bus Stand: 10.9601, 78.0766
// Sengunthapuram: 10.9650, 78.0880
// Kamaraj Puram: 10.9695, 78.0930
// Pasupathipalayam: 10.9750, 78.0995
const r45Keypoints = [
  { lat: 10.9601, lng: 78.0766 }, // Karur Bus Stand
  { lat: 10.9620, lng: 78.0820 },
  { lat: 10.9650, lng: 78.0880 }, // Sengunthapuram
  { lat: 10.9675, lng: 78.0910 },
  { lat: 10.9695, lng: 78.0930 }, // Kamaraj Puram
  { lat: 10.9720, lng: 78.0960 },
  { lat: 10.9750, lng: 78.0995 }, // Pasupathipalayam
];

const r45Waypoints: LatLng[] = [];
for (let i = 0; i < r45Keypoints.length - 1; i++) {
  const segments = interpolatePoints(r45Keypoints[i], r45Keypoints[i + 1], 8);
  if (i > 0) segments.shift();
  r45Waypoints.push(...segments);
}

// Route 7 Path Interpolation
// Karur Bus Stand: 10.9601, 78.0766
// Periyar Nagar: 10.9480, 78.0690
// Rayanur: 10.9310, 78.0580
// Gnanapuram: 10.9250, 78.0510
const r7Keypoints = [
  { lat: 10.9601, lng: 78.0766 }, // Karur Bus Stand
  { lat: 10.9540, lng: 78.0720 },
  { lat: 10.9480, lng: 78.0690 }, // Periyar Nagar
  { lat: 10.9395, lng: 78.0630 },
  { lat: 10.9310, lng: 78.0580 }, // Rayanur
  { lat: 10.9280, lng: 78.0540 },
  { lat: 10.9250, lng: 78.0510 }, // Gnanapuram
];

const r7Waypoints: LatLng[] = [];
for (let i = 0; i < r7Keypoints.length - 1; i++) {
  const segments = interpolatePoints(r7Keypoints[i], r7Keypoints[i + 1], 8);
  if (i > 0) segments.shift();
  r7Waypoints.push(...segments);
}

export const TRANSIT_ROUTES: TransitRoute[] = [
  {
    id: 'route-12',
    name: 'Route 12',
    displayName: 'Route 12 (Karur Bus Stand ↔ Industrial Estate)',
    color: '#0d9488', // Teal 600
    averageSpeedKmh: 35,
    waypoints: r12Waypoints,
    stops: [
      { id: 'stop-kbs', name: 'Karur Bus Stand', lat: 10.9601, lng: 78.0766, distanceFromStart: 0 },
      { id: 'stop-col', name: 'Collectorate Office', lat: 10.9425, lng: 78.0831, distanceFromStart: 2100 },
      { id: 'stop-gandhi', name: 'Gandhigramam Junction', lat: 10.9330, lng: 78.0805, distanceFromStart: 3200 },
      { id: 'stop-ind', name: 'Karur Industrial Estate', lat: 10.9180, lng: 78.0910, distanceFromStart: 5100 },
    ],
  },
  {
    id: 'route-45',
    name: 'Route 45',
    displayName: 'Route 45 (Karur Bus Stand ↔ Pasupathipalayam)',
    color: '#0284c7', // Sky Blue 600
    averageSpeedKmh: 38,
    waypoints: r45Waypoints,
    stops: [
      { id: 'stop-kbs', name: 'Karur Bus Stand', lat: 10.9601, lng: 78.0766, distanceFromStart: 0 },
      { id: 'stop-seng', name: 'Sengunthapuram Main Stop', lat: 10.9650, lng: 78.0880, distanceFromStart: 1350 },
      { id: 'stop-kam', name: 'Kamaraj Puram Chanthai', lat: 10.9695, lng: 78.0930, distanceFromStart: 2000 },
      { id: 'stop-pas', name: 'Pasupathipalayam Terminal', lat: 10.9750, lng: 78.0995, distanceFromStart: 3100 },
    ],
  },
  {
    id: 'route-7',
    name: 'Route 7',
    displayName: 'Route 7 (Karur Bus Stand ↔ Rayanur / Gnanapuram)',
    color: '#16a34a', // Green 600
    averageSpeedKmh: 32,
    waypoints: r7Waypoints,
    stops: [
      { id: 'stop-kbs', name: 'Karur Bus Stand', lat: 10.9601, lng: 78.0766, distanceFromStart: 0 },
      { id: 'stop-periyar', name: 'Periyar Nagar Bus Stop', lat: 10.9480, lng: 78.0690, distanceFromStart: 1600 },
      { id: 'stop-rayanur', name: 'Rayanur Corner', lat: 10.9310, lng: 78.0580, distanceFromStart: 3750 },
      { id: 'stop-gnana', name: 'Gnanapuram Terminal', lat: 10.9250, lng: 78.0510, distanceFromStart: 4700 },
    ],
  },
];

export const PRELOADED_COMPLAINTS: Complaint[] = [
  {
    id: 'TKT-2026-001',
    category: 'Pothole',
    description: 'Deep pothole right in front of the Collectorate gate causing severe traffic slow down and dangerous swerving.',
    lat: 10.9430,
    lng: 78.0835,
    timestamp: '2026-07-15T09:30:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80', // street/road photo
    severity: 'High',
    department: 'Roads Dept',
    status: 'In Progress',
    aiLog: {
      severityHeuristic: 'Potholes in major transit arteries (near Collectorate) skew high severity due to high collision risks.',
      duplicateCheckResult: 'Verified: No overlapping pothole complaints in 100m radius within 7 days.',
      departmentAssignment: 'Successfully auto-routed to: Roads Dept.',
    },
  },
  {
    id: 'TKT-2026-002',
    category: 'Streetlight',
    description: 'Three consecutive streetlights are broken on Sengunthapuram Main Road. The stretch is completely dark after 7 PM.',
    lat: 10.9655,
    lng: 78.0875,
    timestamp: '2026-07-16T21:15:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80', // dark street/streetlight
    severity: 'Medium',
    department: 'Electrical Dept',
    status: 'Open',
    aiLog: {
      severityHeuristic: 'Streetlight failure in residential commercial area assigned Medium severity (public security risk).',
      duplicateCheckResult: 'Verified: No overlapping streetlight complaints in 100m radius within 7 days.',
      departmentAssignment: 'Successfully auto-routed to: Electrical Dept.',
    },
  },
  {
    id: 'TKT-2026-003',
    category: 'Water Leak',
    description: 'Huge drinking water pipeline leakage near Gandhigramam Junction. Water is flooding the side walkway.',
    lat: 10.9325,
    lng: 78.0812,
    timestamp: '2026-07-17T07:45:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1542013936693-8848e5740a7a?auto=format&fit=crop&w=600&q=80', // water splash/leakage
    severity: 'High',
    department: 'Water Board',
    status: 'Open',
    aiLog: {
      severityHeuristic: 'Drinking water pipeline bursts are automatically categorized as High severity to minimize public utility loss.',
      duplicateCheckResult: 'Verified: No overlapping water leak complaints in 100m radius within 7 days.',
      departmentAssignment: 'Successfully auto-routed to: Water Board.',
    },
  },
  {
    id: 'TKT-2026-004',
    category: 'Garbage',
    description: 'Illegal dumping of market waste and plastic behind Karur Bus Stand. Stinks badly and attracting stray dogs.',
    lat: 10.9610,
    lng: 78.0775,
    timestamp: '2026-07-14T11:00:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80', // garbage dump
    severity: 'Low',
    department: 'Sanitation',
    status: 'Resolved',
    aiLog: {
      severityHeuristic: 'Garbage accumulation designated Low severity as it does not present immediate traffic or physical threat.',
      duplicateCheckResult: 'Verified: No duplicate active tickets found.',
      departmentAssignment: 'Successfully auto-routed to: Sanitation.',
    },
  },
  {
    id: 'TKT-2026-005',
    category: 'Garbage',
    description: 'Large pile of dry leaves and construction waste blocking the corner pavement in Periyar Nagar.',
    lat: 10.9475,
    lng: 78.0695,
    timestamp: '2026-07-17T16:20:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80', // waste
    severity: 'Medium',
    department: 'Sanitation',
    status: 'Open',
    aiLog: {
      severityHeuristic: 'Pavement blockages with construction wastes skew Medium severity.',
      duplicateCheckResult: 'Verified: No duplicate active tickets found within 100m.',
      departmentAssignment: 'Successfully auto-routed to: Sanitation.',
    },
  }
];
