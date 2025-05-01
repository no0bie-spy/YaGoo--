import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, ActivityIndicator } from 'react-native';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useLocationSetter } from '@/components/LocationSetterContext';

const MapPickerScreen = () => {
  const { setter } = useLocationSetter();
  const router = useRouter();
  const [selected, setSelected] = useState<{ latitude: number; longitude: number } | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('Location permission status:', status);
        if (status !== 'granted') {
          console.log('Location permission not granted');
          // Default to a fallback location if permission is denied
          setInitialRegion({
            latitude: 28.2334,
            longitude: 83.9500,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        } else {
          const currentLocation = await Location.getCurrentPositionAsync({});
          console.log('Current location:', currentLocation.coords.latitude, currentLocation.coords.longitude);
          setInitialRegion({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } catch (error) {
        console.error('Error getting current location:', error);
        // Default to a fallback location on error
        setInitialRegion({
          latitude: 28.2334,
          longitude: 83.9500,
          latitudeDelta:0.0922,
          longitudeDelta:  0.0421,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = async () => {
    if (!selected || !setter) {
      console.log('Selected is:', selected);
      console.log('Setter is:', setter);
      console.log('Selected or setter is null. Cannot go back.');
      return;
    }

    const [place] = await Location.reverseGeocodeAsync(selected);
    const address = `${place.name || ''}, ${place.city || ''}, ${place.region || ''}`;

    setter({
      address,
      coordinates: {
        latitude: selected.latitude,
        longitude: selected.longitude,
      },
    });

    console.log('Attempting to go back.');
    router.back();
    console.log('Went back (or attempted to).');
  };

  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelected({ latitude, longitude });
  };

  if (loading || !initialRegion) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        onPress={handleMapPress}
      >
        {selected && <Marker coordinate={selected} />}
      </MapView>
      <View style={styles.footer}>
        <Button title="Confirm Location" onPress={handleSelect} disabled={!selected} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    elevation: 4,
  },
});

export default MapPickerScreen;