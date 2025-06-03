import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Button, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { getSession } from '@/usableFunction/Session';
import { router, useRouter } from 'expo-router';
import AppButton from '../Button';
import socketService from '@/services/socketService';
import type { NewBidEvent, RideStatusUpdateEvent } from '@/types/socket';

interface AvailableRide {
  _id: string;
  start_location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  destination: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  status: string;
  minimumPrice: number;
}

const RiderDashboard = () => {
  const router = useRouter();
  const [availableRides, setAvailableRides] = useState<AvailableRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Listen for new rides or bids
    socketService.onNewBid((event: NewBidEvent) => {
      if (currentRideId === event.rideId) {
        // Update the current ride's information
        fetchRideDetails(event.rideId);
      }
    });

    socketService.onRideStatusUpdate((event: RideStatusUpdateEvent) => {
      if (currentRideId === event.rideId) {
        setRideStatus(event.status.status);
        if (event.status.status === 'completed' || event.status.status === 'cancelled') {
          setCurrentRideId(null);
          fetchAvailableRides();
        }
      }
    });

    // Initial fetch
    fetchAvailableRides();

    return () => {
      socketService.removeAllListeners();
    };
  }, [currentRideId]);

  const fetchAvailableRides = async () => {
    try {
      setLoading(true);
      const token = await getSession('accessToken');
      if (!token) {
        setErrors(['You are not logged in. Please log in to continue.']);
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://${process.env.EXPO_PUBLIC_ADDRESS}:8002/rides/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched ride requests:", response.data.rides);

      setAvailableRides(Array.isArray(response.data.rides) ? response.data.rides : []);
      setErrors([]);
    } catch (error: any) {
      console.error('Fetch ride requests error:', error);
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        setErrors(error.response.data.details.map((err: any) => err.message));
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(['Something went wrong.']);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRideDetails = async (rideId: string) => {
    try {
      const token = await getSession('accessToken');
      const response = await axios.get(
        `http://${process.env.EXPO_PUBLIC_ADDRESS}:8002/rides/${rideId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Update the specific ride in the list
      setAvailableRides(prev => 
        prev.map(ride => 
          ride._id === rideId ? { ...ride, ...response.data.ride } : ride
        )
      );
    } catch (error) {
      console.error('Error fetching ride details:', error);
    }
  };

  const handleAcceptRide = async (ride: AvailableRide) => {
    try {
      const token = await getSession('accessToken');
      const response = await axios.post(
        `http://${process.env.EXPO_PUBLIC_ADDRESS}:8002/rides/accept-request`,
        { rideId: ride._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCurrentRideId(ride._id);
      socketService.joinRideRoom(ride._id);
      
      // Navigate to chat screen
      router.push({
        pathname: '/(root)/(rides)/ChatScreen',
        params: {
          rideId: ride._id,
          riderId: response.data.riderId,
          isRider: 'true'
        }
      });
    } catch (error) {
      console.error('Error accepting ride:', error);
      Alert.alert('Error', 'Failed to accept ride. Please try again.');
    }
  };

  const startLocationUpdates = () => {
    // Location updates are handled in HomeScreen
    // This is just for additional ride-specific updates if needed
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B7BE5" />
      </View>
    );
  }

  if (currentRideId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Current Ride</Text>
        <Text style={styles.status}>Status: {rideStatus}</Text>
        {/* Add more ride details and controls here */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Rides</Text>
      {availableRides.length === 0 ? (
        <Text style={styles.noRides}>No rides available at the moment</Text>
      ) : (
        <ScrollView style={styles.ridesList}>
          {availableRides.map((ride) => (
            <View key={ride._id} style={styles.rideCard}>
              <Text style={styles.rideDetail}>
                From: {ride.start_location.address}
              </Text>
              <Text style={styles.rideDetail}>
                To: {ride.destination.address}
              </Text>
              <Text style={styles.price}>
                Minimum Price: Rs. {ride.minimumPrice}
              </Text>
              <AppButton
                title="Accept Ride"
                onPress={() => handleAcceptRide(ride)}
                style={styles.acceptButton}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  noRides: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  ridesList: {
    flex: 1,
  },
  rideCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rideDetail: {
    fontSize: 16,
    marginBottom: 5,
    color: '#444',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27ae60',
    marginVertical: 10,
  },
  acceptButton: {
    backgroundColor: '#4B7BE5',
    marginTop: 10,
  },
  status: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textTransform: 'capitalize',
  },
});

export default RiderDashboard;
