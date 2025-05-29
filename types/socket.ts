export interface RideLocation {
  latitude: number;
  longitude: number;
}

export interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  location?: RideLocation;
  rating?: number;
}

export interface RideStatus {
  status: 'pending' | 'accepted' | 'started' | 'completed' | 'cancelled';
  updatedAt: string;
}

export interface Bid {
  id: string;
  riderId: string;
  rideId: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  rider: Rider;
}

export interface RideStatusUpdateEvent {
  rideId: string;
  status: RideStatus;
}

export interface RiderLocationUpdateEvent {
  rideId: string;
  riderId: string;
  location: RideLocation;
}

export interface NewBidEvent {
  bid: Bid;
  rideId: string;
}

export interface RideAcceptedEvent {
  rideId: string;
  riderId: string;
  rider: Rider;
}

export interface RideCancelledEvent {
  rideId: string;
  reason?: string;
} 