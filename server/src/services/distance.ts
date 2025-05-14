import axios from 'axios';

// Interface for OSRM response
interface OSRMResponse {
  routes: { distance: number }[];
}

export async function calculateRoadDistance(
  startLat: number, 
  startLng: number, 
  endLat: number, 
  endLng: number
): Promise<number | null> {
  try {
    const response = await axios.get<OSRMResponse>(
      `http://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`
    );

    if (response.data.routes && response.data.routes.length > 0) {
      const distanceInMeters = response.data.routes[0].distance;
      return distanceInMeters / 1000; // Convert to kilometers
    }
    return null;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error calculating road distance:', error.message);
    } else {
      console.error('Error calculating road distance:', error);
    }
    return null;
  }
}

// async function main() {
//   const dist = await calculateRoadDistance(27.7172, 85.324, 27.6727, 85.4298);
//   console.log('Distance in km:', dist);
// }

// main();