import React, { useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';

interface MapPickerScreenProps {
    onLocationSelect: (location: { address: string; coordinates: { latitude: number; longitude: number } }) => void;
    onClose?: () => void;
    initialCoordinate?: { latitude: number; longitude: number };
  }
  
  const MapPickerScreen: React.FC<MapPickerScreenProps> = ({ onLocationSelect, onClose, initialCoordinate }) => {
    const [selected, setSelected] = useState<{ latitude: number; longitude: number } | null>(initialCoordinate || null);

  const handleSelect = async () => {
    if (!selected) {
      console.log('No location selected.');
      return;
    }

    const [place] = await Location.reverseGeocodeAsync(selected);
    const address = `${place.name || ''}, ${place.city || ''}, ${place.region || ''}`;

    onLocationSelect({
      address,
      coordinates: {
        latitude: selected.latitude,
        longitude: selected.longitude,
      },
    });

    if (onClose) {
      onClose(); // Call the onClose prop if provided
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
          latitude: initialCoordinate?.latitude || 27.7172,
          longitude: initialCoordinate?.longitude || 85.3240,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        {selected && <Marker coordinate={selected} />}
      </MapView>
      <View style={styles.footer}>
        <Button title="Confirm Location" onPress={handleSelect} disabled={!selected} />
        {onClose && <Button title="Cancel" onPress={onClose} />}
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
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default MapPickerScreen;