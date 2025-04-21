import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Input from '@/components/Input';
import AppButton from '@/components/Button';
import { Search, Navigation } from 'lucide-react-native';

type Props = {
  startLocation: string;
  destination: string;
  setStartLocation: (val: string) => void;
  setDestination: (val: string) => void;
  onSubmit: () => void;
};

const FindRideForm = ({
  startLocation,
  destination,
  setStartLocation,
  setDestination,
  onSubmit,
}: Props) => {
  return (
    <View>
      <Text style={styles.title}>Find a Ride</Text>
      <Input
        icon={<Search size={20} />}
        placeholder="Pickup location"
        value={startLocation}
        setValue={setStartLocation}
      />
      <Input
        icon={<Navigation size={20} />}
        placeholder="Destination"
        value={destination}
        setValue={setDestination}
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
