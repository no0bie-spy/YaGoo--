import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { useRouter } from 'expo-router';

import MapComponent from '@/components/Home/MapComponent';

import BidForm from '@/components/Home/BidForm';
import RiderDashboard from '@/components/Rider/RiderDahsboard';
import AvailableRidersList from '@/components/Rides/AvailableRidersList';
import { useLocationSetter } from '@/components/LocationSetterContext';
import { getSession, getUserRole } from '@/usableFunction/Session';
import MapPickerScreen from '@/components/Home/MapPickerScreen';
import FindRideForm from '@/components/Home/FindRideForm';

// Import MapPickerScreen as a component

const screenHeight = Dimensions.get('window').height;
const IP_Address = process.env.EXPO_PUBLIC_ADDRESS || 'YOUR_IP_ADDRESS'; // Replace with your IP

export default function HomeScreen() {
  const router = useRouter();
  const { setSetter } = useLocationSetter();

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
  const [hasPlacedBid, setHasPlacedBid] = useState(false);

  // Get location & user role
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        const userRole = await getUserRole();
        setRole(userRole);
      } catch (err) {
        console.error('Location Error:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

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
      return Alert.alert('Please enter both pickup and destination');
    }

    try {
      const token = await getSession('accessToken');
      if (!token) {
        return Alert.alert('You are not logged in. Please log in to continue.');
      }
      console.log('Pickup:', pickup);
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
      setRideId(ride._id); // Ensure rideId is set
      setMinimumPrice(minimumPrice);
    } catch (error: any) {
      console.error('Create Ride Error:', error);
      handleError(error);
    }
  };

  // Place bid
  const handleBid = async () => {
    if (!price || !rideId) return Alert.alert('Enter a valid bid amount');

    try {
      const token = await getSession('accessToken');

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

      Alert.alert('Bid placed successfully!');
      setHasPlacedBid(true);
      fetchAvailableRiders(); // Immediate fetch after bidding
    } catch (error: any) {
      console.error('Bid Error:', error);
      handleError(error);
    }
  };

  // Cancel ride
  const handleCancelRide = async () => {
    try {
      const token = await getSession('accessToken');
      if (!token || !rideId) return;

      const response = await axios.delete(
        `http://${IP_Address}:8002/rides/cancel`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { rideId },
        }
      );

      Alert.alert(response.data.message || 'Ride canceled successfully');
      setRideId(null);
      setPrice('');
      setAvailableRiders([]);
    } catch (error: any) {
      console.error('Cancel Ride Error:', error);
      handleError(error);
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
      const data=await response.data;
     const email=data.email;
     
      router.push({
        pathname: '/(root)/(rides)/VerifyOtpScreen',
        params: { email: email, rideId },
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
    if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
      const messages = error.response.data.details.map((err: any) => err.message);
      setErrors(messages);
    } else if (error.response?.data?.message) {
      setErrors([error.response.data.message]);
    } else {
      setErrors(['Something went wrong.']);
    }
  };

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
        <MapComponent location={location} />
        <View style={styles.overlay}>
          <RiderDashboard />
        </View>
      </View>
    );
  }

  // Passenger view
  return (
    <View style={styles.container}>
      <MapComponent location={location} />
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
  container: { flex: 1 },
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
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 10, // Ensure it's on top
  },
});