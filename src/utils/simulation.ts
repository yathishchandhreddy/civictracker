import { LatLng, Stop, TransitRoute, LiveBusState } from '../types';
import { getDistance } from '../data/transitData';

// Generate default inactive states for all routes
export function createInitialBusStates(routes: TransitRoute[]): LiveBusState[] {
  return routes.map((route) => ({
    routeId: route.id,
    status: 'idle',
    currentPosition: route.waypoints[0],
    currentWaypointIndex: 0,
    speed: 0,
    duration: 0,
    distanceCovered: 0,
    nextStop: route.stops[1] || null,
    etaMinutes: 0,
  }));
}

// Calculate total distance covered along waypoints up to current index
export function calculateDistanceCovered(waypoints: LatLng[], upToIndex: number): number {
  let distance = 0;
  for (let i = 0; i < Math.min(upToIndex, waypoints.length - 1); i++) {
    distance += getDistance(waypoints[i], waypoints[i + 1]);
  }
  return distance;
}

// Compute ETA to a target stop from the current position
export function computeEta(
  distanceCovered: number,
  targetStop: Stop,
  currentSpeedKmh: number
): number {
  const remainingDistanceMeters = targetStop.distanceFromStart - distanceCovered;
  if (remainingDistanceMeters <= 0) return 0;
  
  const speedMetersPerSecond = (currentSpeedKmh * 1000) / 3600;
  if (speedMetersPerSecond <= 0) return 5; // Default fallback

  const etaSeconds = remainingDistanceMeters / speedMetersPerSecond;
  return Math.max(1, Math.round(etaSeconds / 60)); // Round to nearest minute, min 1 min
}

// Simulate one step of bus movement
export function simulateBusStep(
  bus: LiveBusState,
  route: TransitRoute,
  timeMultiplier: number = 15 // seconds elapsed per real tick
): LiveBusState {
  if (bus.status !== 'driving') return bus;

  const nextIndex = bus.currentWaypointIndex + 1;
  
  // Check if route completed
  if (nextIndex >= route.waypoints.length) {
    return {
      ...bus,
      status: 'completed',
      currentPosition: route.waypoints[route.waypoints.length - 1],
      currentWaypointIndex: route.waypoints.length - 1,
      speed: 0,
      nextStop: null,
      etaMinutes: 0,
    };
  }

  const currentPosition = route.waypoints[nextIndex];
  const newDistanceCovered = calculateDistanceCovered(route.waypoints, nextIndex);
  
  // Add some realistic speed fluctuation (e.g., +/- 5 km/h around average)
  const speedFluctuation = (Math.random() - 0.5) * 10;
  const currentSpeed = Math.max(15, Math.min(60, route.averageSpeedKmh + speedFluctuation));

  // Find next stop (first stop along route whose distanceFromStart > newDistanceCovered)
  let nextStop: Stop | null = null;
  for (let i = 0; i < route.stops.length; i++) {
    if (route.stops[i].distanceFromStart > newDistanceCovered) {
      nextStop = route.stops[i];
      break;
    }
  }

  // If no next stop, it is heading to the final terminal stop
  if (!nextStop && route.stops.length > 0) {
    nextStop = route.stops[route.stops.length - 1];
  }

  const etaMinutes = nextStop ? computeEta(newDistanceCovered, nextStop, currentSpeed) : 0;

  return {
    ...bus,
    currentPosition,
    currentWaypointIndex: nextIndex,
    speed: currentSpeed,
    duration: bus.duration + timeMultiplier,
    distanceCovered: newDistanceCovered,
    nextStop,
    etaMinutes,
  };
}
