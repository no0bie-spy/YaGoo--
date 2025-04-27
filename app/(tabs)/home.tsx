import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { getSession } from '@/usableFunction/Session';
import MapComponent from '@/components/Home/MapComponent';
import FindRideForm from '@/components/Home/FindRideForm';
import BidForm from '@/components/Home/BidForm';
import { useLocationSetter } from '@/components/LocationSetterContext';

const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [pickup, setPickup] = useState({ address: '', coordinates: null });
  const [destination, setDestination] = useState({ address: '', coordinates: null });
  const [rideId, setRideId] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const router = useRouter();
  const { setSetter } = useLocationSetter();
  const [errors, setErrors] = useState<string[]>([]);
  const [minimumPrice, setMinimumPrice] = useState<number | null>(null);
  // Request location permissions and get the current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  // Open the map picker screen
  const openMap = (setterFn: typeof setPickup) => {
    setSetter(() => setterFn); // Set the context setter
    router.push('/MapPickerScreen'); // Navigate to the map picker screen
  };

  // Handle ride creation
  const handleRideCreation = async () => {
    if (!pickup.address || !destination.address) {
      return alert('Please enter all fields');
    }
    try {
      const token = await getSession('accessToken');
      if (!token) {
        return alert('You are not logged in. Please log in to continue.');
      }
      console.log("token:"+token)

      const response = await axios.post(`http://${IP_Address}:8002/find-ride`, {
        start_location: {
          address: pickup.address,
          coordinates: pickup.coordinates,
        },
        destination: {
          address: destination.address,
          coordinates: destination.coordinates,
        },
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      const minimumPrice = data.ride.minimumPrice;
      console.log('Minimum Price:', minimumPrice);
      setMinimumPrice(minimumPrice);
      setRideId(data.ride._id);
    } catch (error: any) {
      console.log("Full error:", error);

      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const errorMessages = error.response.data.details.map((err: any) => err.message);
        setErrors(errorMessages);
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(["Something went wrong."]);
      }
    }
  };

  // Handle bid placement
  const handleBid = async () => {
    if (!price || !rideId) {
      return alert('Please enter a valid bid amount');
    }
    try {
      const token = await getSession('accessToken');
      await axios.post(`http://${IP_Address}:8002/place-bid`, {
        rideId,
        amount: price,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Bid placed successfully!');
    } catch (error: any) {
      console.log("Full error:", error);

      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const errorMessages = error.response.data.details.map((err: any) => err.message);
        setErrors(errorMessages);
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]); // Fallback if message is provided
      } else {
        setErrors(["Something went wrong."]);
      }
    }
  };

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
            onOpenMap={openMap}
            onSubmit={handleRideCreation}
          />
        ) : (
          <BidForm
            price={price}
            setPrice={setPrice}
            onSubmit={handleBid}
            onCancel={() => {
              setRideId(null);
              setPrice('');
            }}
            startLocation={pickup.address}
            destination={destination.address}
            minimumPrice={minimumPrice}
            
          />
        )}
      </View>
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 6,
  },
});