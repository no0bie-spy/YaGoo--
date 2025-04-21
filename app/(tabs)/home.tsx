import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { MapPin, Navigation, Search, DollarSign } from 'lucide-react-native';
import * as Location from 'expo-location';
import Input from '@/components/Input';
import AppButton from '@/components/Button';
import axios from 'axios';
import { getSession } from '@/usableFunction/Session';

// Import MapView conditionally
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [start_location, setstart_location] = useState('');
  const [destination, setDestination] = useState('');
  const [rideId, setRideId] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // Fetch user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('Location permission not granted. Please enable it in your settings.');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    })();
  }, []);

  // Handle ride creation
  async function handleRideCreation() {
    try {
      if (!start_location || !destination) {
        alert('Please enter both pickup and destination locations.');
        return;
      }

      const token = await getSession('accessToken');
      const locationDetails = { start_location, destination };

      const response = await axios.post(`http://${IP_Address}:8002/find-ride`, locationDetails, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const ride = response.data.ride;
      const ride_id = ride._id;

      setRideId(ride_id); // Store ride ID
      alert('Ride created successfully');
    } catch (error: any) {
      console.log('Full error:', error);
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const errorMessages = error.response.data.details.map((err: any) => err.message);
        setErrors(errorMessages);
        alert(errorMessages.join('\n'));
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
        alert(error.response.data.message);
      } else {
        setErrors(['Something went wrong.']);
        alert('Something went wrong.');
      }
    }
  }

  // Handle bid creation
  async function handleBid() {
    try {
      if (!rideId) {
        alert('Ride ID not available.');
        return;
      }

      if (!price) {
        alert('Please enter a price.');
        return;
      }

      const token = await getSession('accessToken');
      const bidDetails = {
        rideId: rideId,
        amount:price,
      };

      const response = await axios.post(`http://${IP_Address}:8002/place-bid`, bidDetails, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Bid created successfully!');
    } catch (error: any) {
      console.log('Full error:', error);
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const errorMessages = error.response.data.details.map((err: any) => err.message);
        setErrors(errorMessages);
        alert(errorMessages.join('\n'));
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
        alert(error.response.data.message);
      } else {
        setErrors(['Something went wrong.']);
        alert('Something went wrong.');
      }
    }
  }

  // Render map or fallback
  const renderMap = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.webMapPlaceholder}>
          <MapPin size={48} color="#0066FF" />
          <Text style={styles.webMapText}>
            Interactive map is not available on web.
            Please use our mobile app for the full experience.
          </Text>
        </View>
      );
    }

    if (!location) {
      return (
        <View style={styles.webMapPlaceholder}>
          <Text style={styles.webMapText}>
            Location permissions are required to display the map.
          </Text>
        </View>
      );
    }

    if (!MapView) return null;

    return (
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {Marker && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
          />
        )}
      </MapView>
    );
  };

  return (
    <View style={styles.container}>
      {renderMap()}

      <View style={styles.inputContainer}>
        {/* Show Find Ride only if no ride created yet */}
        {!rideId && (
          <>
            <Input
              icon={<Search size={20} />}
              placeholder="Enter pickup location"
              value={start_location}
              setValue={setstart_location}
              keyboardType="default"
            />
            <Input
              icon={<Navigation size={20} />}
              placeholder="Enter destination"
              value={destination}
              setValue={setDestination}
              keyboardType="default"
            />
            <AppButton title="Find Ride" onPress={handleRideCreation} />
          </>
        )}

        {/* Show Create Bid section only when ride is created */}
        {rideId && (
          <View style={{ marginTop: 20 }}>
           
            <Input
              icon={<DollarSign size={20} />}
              placeholder="Enter your price"
              value={price}
              setValue={setPrice}
              keyboardType="numeric"
            />
            <AppButton title="Create Bid" onPress={handleBid} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  webMapPlaceholder: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inputContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  webMapText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    maxWidth: 300,
  },
});
