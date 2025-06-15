import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import MapComponent from '@/components/Home/MapComponent';
import BidForm from '@/components/Home/BidForm';
import RiderDashboard from '@/components/Rider/RiderDahsboard';
import AvailableRidersList from '@/components/Rides/AvailableRidersList';
import { useLocationSetter } from '@/components/LocationSetterContext';
import { getSession, getUserRole } from '@/usableFunction/Session';
import MapPickerScreen from '@/components/Home/MapPickerScreen';
import FindRideForm from '@/components/Home/FindRideForm';
import socketService from '@/services/socketService';
import type { 
  NewBidEvent, 
  RideAcceptedEvent, 
  RideCancelledEvent,
  RiderLocationUpdateEvent,
  RideStatusUpdateEvent
} from '@/types/socket';

const screenHeight = Dimensions.get('window').height;
const IP_Address = process.env.EXPO_PUBLIC_ADDRESS || 'YOUR_IP_ADDRESS';

const FALLBACK_LOCATION = {
  coords: {
    latitude: 28.2334,
    longitude: 83.9500,
  },
} as Location.LocationObject;

export default function HomeScreen() {
  const router = useRouter();
  const { setSetter } = useLocationSetter();
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [pickup, setPickup] = useState({ address: '', coordinates: null });
  const [destination, setDestination] = useState({ address: '', coordinates: null });
  const [isPickupMapVisible, setIsPickupMapVisible] = useState(false);
  const [isDestinationMapVisible, setIsDestinationMapVisible] = useState(false);

  const [rideId, setRideId] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [availableRiders, setAvailableRiders] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [minimumPrice, setMinimumPrice] = useState<number | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPlacedBid, setHasPlacedBid] = useState(false);
  const [riderLocation, setRiderLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [rideStatus, setRideStatus] = useState<'pending' | 'accepted' | 'started' | 'completed' | 'cancelled'>('pending');

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isPickupMapVisible) {
        setIsPickupMapVisible(false);
        return true;
      }
      if (isDestinationMapVisible) {
        setIsDestinationMapVisible(false);
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isPickupMapVisible, isDestinationMapVisible]);

  // Function to fetch user role
 const fetchUserRole = async () => {
    try {
      const userRole = await getUserRole();
      console.log('Current user role:', userRole);
      setRole(userRole);
    } catch (err) {
      console.error('Error fetching user role:', err);
      handleError(err);
    }
  };

  // Function to get current location
  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this feature. Using a fallback location.'
        );
        setLocation(FALLBACK_LOCATION);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);

      // Start watching position
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
        }
      );
    } catch (err) {
      console.error('Location Error:', err);
      Alert.alert('Error', 'Failed to get current location. Using a fallback location.');
      setLocation(FALLBACK_LOCATION);
    }
  };

  // Initialize data on first load
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchLocation(), fetchUserRole()]);
      } catch (error) {
        console.error('Initialization error:', error);
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  // Use useFocusEffect to refresh role and data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused - refreshing user role and data');
      fetchUserRole();
      
      // Reset ride-related state if coming back to this screen
      if (!rideId) {
        setPickup({ address: '', coordinates: null });
        setDestination({ address: '', coordinates: null });
        setHasPlacedBid(false);
        setPrice('');
        setAvailableRiders([]);
        setErrors([]);
      }
      
      return () => {
        // Cleanup if needed when screen is unfocused
      };
    }, [rideId])
  );

  const handlePickupLocationSelect = (location: { address: string; coordinates: any }) => {
    setPickup(location);
    setIsPickupMapVisible(false);
  };

  const handleDestinationLocationSelect = (location: { address: string; coordinates: any }) => {
    setDestination(location);
    setIsDestinationMapVisible(false);
  };

  const openPickupMapPicker = () => {
    setIsPickupMapVisible(true);
  };

  const closePickupMapPicker = () => {
    setIsPickupMapVisible(false);
  };

  const openDestinationMapPicker = () => {
    setIsDestinationMapVisible(true);
  };

  const closeDestinationMapPicker = () => {
    setIsDestinationMapVisible(false);
  };

  // Create ride
  const handleRideCreation = async () => {
    if (!pickup.address || !destination.address) {
      return Alert.alert('Missing Information', 'Please enter both pickup and destination locations');
    }

    setIsSubmitting(true);
    try {
      const token = await getSession('accessToken');
      if (!token) {
        return Alert.alert('Authentication Error', 'You are not logged in. Please log in to continue.');
      }

      const response = await axios.post(
        `http://${IP_Address}:8002/rides/create`,
        {
          start_location: {
            address: pickup.address,
            coordinates: pickup.coordinates,
          },
          destination: {
            address: destination.address,
            coordinates: destination.coordinates,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { ride, minimumPrice } = response.data;

      console.log('Ride created:', ride);
      setRideId(ride._id);
      setMinimumPrice(minimumPrice);
      setErrors([]);
    } catch (error: any) {
      console.error('Create Ride Error:', error);
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Place bid
  const handleBid = async () => {
    if (!price || !rideId) {
      return Alert.alert('Invalid Input', 'Please enter a valid bid amount');
    }

    setIsSubmitting(true);
    try {
      const token = await getSession('accessToken');
      if (!token) {
        return Alert.alert('Authentication Error', 'Please log in to continue');
      }

      await axios.post(
        `http://${IP_Address}:8002/rides/bid`,
        {
          rideId,
          amount: price,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Success', 'Bid placed successfully!');
      setHasPlacedBid(true);
      setErrors([]);
      fetchAvailableRiders();
    } catch (error: any) {
      console.error('Bid Error:', error);
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel ride
  const handleCancelRide = async () => {
    if (!rideId) return;

    setIsCanceling(true);
    try {
      const token = await getSession('accessToken');
      if (!token) {
        return Alert.alert('Authentication Error', 'Please log in to continue');
      }

      const response = await axios.delete(
        `http://${IP_Address}:8002/rides/cancel`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { rideId },
        }
      );

      Alert.alert('Success', response.data.message || 'Ride canceled successfully');
      setRideId(null);
      setPrice('');
      setAvailableRiders([]);
      setErrors([]);
    } catch (error: any) {
      console.error('Cancel Ride Error:', error);
      handleError(error);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleAcceptRider = async (riderId: string) => {
    try {
      const token = await getSession('accessToken');
      if (!token || !rideId) return;

      const response = await axios.post(
        `http://${IP_Address}:8002/rides/accept`,
        { rideListId: riderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(response.data.message || 'Rider accepted successfully');
      console.log('Rider accepted:', response.data);
      const riderEmail = response.data.email;
      console.log('Navigating to VerifyOtpScreen with params:', {
        email: riderEmail,
        rideId,
      });
      router.push({
        pathname: '/(root)/(rides)/VerifyOtpScreen',
        params: { email: riderEmail, rideId },
      });
    } catch (error: any) {
      console.error('Accept Rider Error:', error);
      handleError(error);
    }
  };

  const handleRejectRider = async (riderId: string) => {
    try {
      const token = await getSession('accessToken');
      if (!token || !rideId) return;

      const response = await axios.post(
        `http://${IP_Address}:8002/rides/reject-rider`,
        {
          riderListId: riderId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert(response.data.message || 'Rider rejected successfully');
      fetchAvailableRiders(); // Refresh the list of available riders
    } catch (error: any) {
      console.error('Reject Rider Error:', error);
      handleError(error);
    }
  };

  // Fetch available riders (polling every 5 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (rideId) {
      console.log('Starting polling for available riders...');
      fetchAvailableRiders(); // Immediate fetch
      interval = setInterval(fetchAvailableRiders, 5000); // Poll every 5 seconds
    }

    return () => {
      console.log('Stopping polling for available riders...');
      clearInterval(interval);
    };
  }, [rideId]);

  const fetchAvailableRiders = async () => {
    try {
      console.log('Fetching available riders...');
      const token = await getSession('accessToken');
      const res = await axios.get(
        `http://${IP_Address}:8002/rides/available-riders?rideId=${rideId}`, // Include rideId as a query parameter
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.data;
      console.log('Available riders:', data.data);
      setAvailableRiders(data.data || []);
    } catch (error) {
      console.error('Error fetching available riders:', error);
    }
  };

  // Error handler utility
  const handleError = (error: any) => {
    let errorMessages: string[] = [];
    if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
      errorMessages = error.response.data.details.map((err: any) => err.message);
    } else if (error.response?.data?.message) {
      errorMessages = [error.response.data.message];
    } else if (error.message) {
      errorMessages = [error.message];
    } else {
      errorMessages = ['An unexpected error occurred. Please try again.'];
    }
    setErrors(errorMessages);
    Alert.alert('Error', errorMessages[0]);
  };

  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = async () => {
      await socketService.connect();
    };

    initializeSocket();

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!rideId) return;

    // Join ride room when ride is created
    socketService.joinRideRoom(rideId);

    // Listen for new bids (for passenger)
    socketService.onNewBid((event: NewBidEvent) => {
      if (event.rideId === rideId) {
        console.log('New bid received:', event);
        fetchAvailableRiders();
      }
    });

    // Listen for ride acceptance (for passenger)
    socketService.onRideAccepted((event: RideAcceptedEvent) => {
      if (event.rideId === rideId) {
        console.log('Ride accepted:', event);
        Alert.alert('Ride Accepted', 'A rider has accepted your ride request!');
        router.push({
          pathname: '/(root)/(rides)/ChatScreen',
          params: { 
            rideId: event.rideId,
            riderId: event.riderId,
            isRider: 'false'
          },
        });
      }
    });

    // Listen for ride cancellation
    socketService.onRideCancelled((event: RideCancelledEvent) => {
      if (event.rideId === rideId) {
        console.log('Ride cancelled:', event);
        Alert.alert('Ride Cancelled', event.reason || 'The ride has been cancelled.');
        setRideId(null);
        setPrice('');
        setAvailableRiders([]);
      }
    });

    // Listen for rider location updates
    socketService.onRiderLocationUpdate((event: RiderLocationUpdateEvent) => {
      if (event.rideId === rideId) {
        console.log('Rider location update:', event);
        setRiderLocation(event.location);
      }
    });

    // Listen for ride status updates
    socketService.onRideStatusUpdate((event: RideStatusUpdateEvent) => {
      if (event.rideId === rideId) {
        console.log('Ride status update:', event);
        setRideStatus(event.status.status);
      }
    });

    return () => {
      socketService.leaveRideRoom(rideId);
      socketService.removeAllListeners();
    };
  }, [rideId]);

  // Update location through socket when it changes
  useEffect(() => {
    if (location && role === 'rider') {
      socketService.updateLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  }, [location, role]);

  // Rider view
  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4B7BE5" />
      </View>
    );
  }

  if (role === 'rider') {
    return (
      <View style={styles.container}>
        <MapComponent 
          location={location} 
          markers={riderLocation ? [
            {
              id: 'rider',
              lat: riderLocation.latitude,
              lng: riderLocation.longitude,
              title: 'Rider Location',
              description: 'Current rider location',
              icon: '🛵'
            }
          ] : []}
        />
        <View style={styles.overlay}>
          <RiderDashboard />
        </View>
      </View>
    );
  }

  // Passenger view
  return (
    <View style={styles.container}>
      <MapComponent 
        location={location} 
        markers={riderLocation ? [
          {
            id: 'rider',
            lat: riderLocation.latitude,
            lng: riderLocation.longitude,
            title: 'Rider Location',
            description: 'Current rider location',
            icon: '🛵'
          }
        ] : []}
      />
      <View style={styles.overlay}>
        {!rideId ? (
          <FindRideForm
            pickup={pickup}
            destination={destination}
            setPickup={setPickup}
            setDestination={setDestination}
            onOpenPickupMap={openPickupMapPicker}
            onOpenDestinationMap={openDestinationMapPicker}
            onSubmit={handleRideCreation}
            isSubmitting={isSubmitting}
            errors={errors}
          />
        ) : hasPlacedBid ? (
          <AvailableRidersList
            riders={availableRiders}
            disabled={isCanceling}
            onAccept={handleAcceptRider}
            onReject={handleRejectRider}
          />
        ) : (
          <BidForm
            price={price}
            setPrice={setPrice}
            onSubmit={handleBid}
            onCancel={handleCancelRide}
            startLocation={pickup.address}
            destination={destination.address}
            minimumPrice={minimumPrice}
            isSubmitting={isSubmitting}
            isCanceling={isCanceling}
            errors={errors}
          />
        )}
      </View>

      {isPickupMapVisible && (
        <View style={styles.modalOverlay}>
          <MapPickerScreen
            onLocationSelect={handlePickupLocationSelect}
            onClose={closePickupMapPicker}
            initialCoordinate={pickup.coordinates !== null ? pickup.coordinates : undefined}
          />
        </View>
      )}

      {isDestinationMapVisible && (
        <View style={styles.modalOverlay}>
          <MapPickerScreen
            onLocationSelect={handleDestinationLocationSelect}
            onClose={closeDestinationMapPicker}
            initialCoordinate={destination.coordinates !== null ? destination.coordinates : undefined}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    position: 'relative'
  },
  overlay: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    maxHeight: screenHeight * 0.7,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 6,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 10,
  },
});