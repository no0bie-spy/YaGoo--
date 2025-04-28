import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Input from '@/components/Input';
import AppButton from '@/components/Button';
import { Search, Navigation } from 'lucide-react-native';
import LocationPicker from './LocationPicker';

type Props = {
  pickup: any;
  destination: any;
  setPickup: (loc: any) => void;
  setDestination: (loc: any) => void;
  onOpenMap: (setter: any) => void;
  onSubmit: () => void;
};

const FindRideForm = ({
  pickup,
  destination,
  setPickup,
  setDestination,
  onOpenMap,
  onSubmit,
}: Props) => {
  return (
    <View>
      <Text style={styles.title}>Find a Ride</Text>
      <LocationPicker
        label="Pickup Location"
        location={pickup}
        setLocation={setPickup}
        onOpenMap={() => onOpenMap(setPickup)}
      />
      <LocationPicker
        label="Destination"
        location={destination}
        setLocation={setDestination}
        onOpenMap={() => onOpenMap(setDestination)}
      />
      <AppButton title="Search Ride" onPress={onSubmit} />
    </View>
  );
};


const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default FindRideForm;
