import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { getSession } from '@/usableFunction/Session';
import MapComponent from '@/components/Home/MapComponent';
import FindRideForm from '@/components/Home/FindRideForm';
import BidForm from '@/components/Home/BidForm';

const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [start_location, setstart_location] = useState('');
  const [destination, setDestination] = useState('');
  const [rideId, setRideId] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const handleRideCreation = async () => {
    if (!start_location || !destination) return alert('Please enter all fields');
    try {
      const token = await getSession('accessToken');
      const response = await axios.post(`http://${IP_Address}:8002/find-ride`, {
        start_location,
        destination,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRideId(response.data.ride._id);
    } catch (error: any) {
      alert('Error finding ride.');
    }
  };

  const handleBid = async () => {
    if (!price || !rideId) return;
    try {
      const token = await getSession('accessToken');
      await axios.post(`http://${IP_Address}:8002/place-bid`, {
        rideId,
        amount: price,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Bid placed!');
    } catch (e) {
      alert('Error placing bid');
    }
  };

  return (
    <View style={styles.container}>
      <MapComponent location={location} />
      <View style={styles.overlay}>
        {!rideId ? (
          <FindRideForm
            startLocation={start_location}
            destination={destination}
            setStartLocation={setstart_location}
            setDestination={setDestination}
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
            startLocation={start_location}
            destination={destination}
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
