import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import type { LocationObject } from 'expo-location';

type Props = {
  location: LocationObject | null;
};

const MapComponent = ({ location }: Props) => {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webMapPlaceholder}>
        <MapPin size={48} color="#0066FF" />
        <Text style={styles.webMapText}>Use mobile app for interactive map.</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.webMapPlaceholder}>
        <Text style={styles.webMapText}>Enable location permissions.</Text>
      </View>
    );
  }

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
      <Marker
        coordinate={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }}
        title="Your Location"
      />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1 },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 20,
  },
  webMapText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default MapComponent;
