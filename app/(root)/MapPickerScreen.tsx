import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, ActivityIndicator, Alert, Platform } from 'react-native';
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
          Alert.alert(
            'Permission Denied',
            'Location permission is required to use this feature. Using a fallback location.'
          );
          setInitialRegion({
            latitude: 28.2334, // Fallback latitude
            longitude: 83.9500, // Fallback longitude
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setInitialRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error('Error getting current location:', error);
        Alert.alert('Error', 'Failed to get current location. Using a fallback location.');
        setInitialRegion({
          latitude: 28.2334, // Fallback latitude
          longitude: 83.9500, // Fallback longitude
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = async () => {
    if (!selected || !setter) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }

    try {
      const [place] = await Location.reverseGeocodeAsync(selected);
      const address = `${place.name || ''}, ${place.city || ''}, ${place.region || ''}`;

      setter({
        address,
        coordinates: {
          latitude: selected.latitude,
          longitude: selected.longitude,
        },
      });

      router.back();
    } catch (error) {
      console.error('Error reverse geocoding location:', error);
      Alert.alert('Error', 'Failed to retrieve address. Please try again.');
    }
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