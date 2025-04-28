interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Location {
  address: string;
  coordinates: Coordinates;
}

interface CreateRideRequest {
  pickup: Location;
  destination: Location;
  distance: number;
  minimumPrice: number;
}

export type { CreateRideRequest, Location, Coordinates };