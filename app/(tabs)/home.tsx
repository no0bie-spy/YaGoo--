import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { MapPin, Navigation, Search } from 'lucide-react-native';
import * as Location from 'expo-location';
import Input from '@/components/Input';
import AppButton from '@/components/Button';

// Import MapView conditionally
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');

  // Handle ride creation
  function handleRideCreation() {
    if (!source || !destination) {
      alert('Please enter both pickup and destination locations.');
      return;
    }
    console.log('Ride created from', source, 'to', destination);
  }

  // Fetch user's location
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

  // Render the map or placeholder
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
        <Input
          icon={<Search size={20} />}
          placeholder="Enter pickup location"
          value={source}
          setValue={setSource}
          keyboardType="default"
        />
        <Input
          icon={<Navigation size={20} />}
          placeholder="Enter destination"
          value={destination}
          setValue={setDestination}
          keyboardType="default"
        />
        <AppButton title="Create Ride" onPress={handleRideCreation} />
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