// components/MapComponent.tsx
import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import type { LocationObject } from 'expo-location';
import { generateLeafletHTML } from '@/utils/leafletMap';

type Props = {
  location: LocationObject | null;
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    title?: string;
    description?: string;
    icon?: string;
  }>;
  onMapPress?: (event: { lat: number; lng: number }) => void;
};

const MapComponent = ({ location, markers = [], onMapPress }: Props) => {
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

  const userLat = location.coords.latitude;
  const userLng = location.coords.longitude;

  // Create markers array including user location
  const allMarkers = [
    {
      id: 'user-location',
      lat: userLat,
      lng: userLng,
      title: 'Your Location',
      description: 'Current location',
      icon: '🔵'
    },
    ...markers
  ];

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapPress' && onMapPress) {
        onMapPress({ lat: data.lat, lng: data.lng });
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <WebView
      style={styles.map}
      source={{ 
        html: generateLeafletHTML({
          center: { lat: userLat, lng: userLng },
          markers: allMarkers,
          enableClick: !!onMapPress,
          fitBounds: true
        })
      }}
      onMessage={handleMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      scalesPageToFit={false}
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  map: { 
    flex: 1,
    backgroundColor: '#f0f0f0'
  },
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