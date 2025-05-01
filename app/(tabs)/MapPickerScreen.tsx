import React, { useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useLocationSetter } from '@/components/LocationSetterContext';

const MapPickerScreen = () => {
  const { setter } = useLocationSetter();
  const router = useRouter();
  const [selected, setSelected] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleSelect = async () => {
    if (!selected || !setter) return;

    const [place] = await Location.reverseGeocodeAsync(selected);
    const address = `${place.name || ''}, ${place.city || ''}, ${place.region || ''}`;

    setter({
      address,
      coordinates: {
        latitude: selected.latitude,
        longitude: selected.longitude,
      },
    });

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home'); // fallback
    }
  };

  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelected({ latitude, longitude });
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 27.7172,
          longitude: 85.3240,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
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
