export interface LatLng {
  lat: number;
  lng: number;
}

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceFromStart: number; // in meters along route
}

export interface TransitRoute {
  id: string;
  name: string;
  displayName: string;
  color: string;
  stops: Stop[];
  waypoints: LatLng[];
  averageSpeedKmh: number;
}

export interface LiveBusState {
  routeId: string;
  status: 'idle' | 'driving' | 'completed';
  currentPosition: LatLng;
  currentWaypointIndex: number;
  speed: number; // km/h
  duration: number; // seconds
  distanceCovered: number; // meters
  nextStop: Stop | null;
  etaMinutes: number;
}

export type ComplaintCategory = 'Pothole' | 'Streetlight' | 'Water Leak' | 'Garbage' | 'Other';

export interface Complaint {
  id: string;
  category: ComplaintCategory;
  description: string;
  lat: number;
  lng: number;
  timestamp: string;
  photoUrl: string | null;
  severity: 'Low' | 'Medium' | 'High';
  department: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  mergedWithId?: string; // If duplicate, merges with existing ticket
  aiLog?: {
    severityHeuristic: string;
    duplicateCheckResult: string;
    departmentAssignment: string;
  };
}

export interface ProximityAlert {
  stopId: string;
  routeId: string;
  distanceThresholdKm: number;
  triggered: boolean;
  active: boolean;
}
