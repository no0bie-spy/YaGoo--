import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import AppButton from '../Button';
import Input from '../Input';

interface FindRideFormProps {
  pickup: { address: string; coordinates: any };
  destination: { address: string; coordinates: any };
  setPickup: (location: { address: string; coordinates: any }) => void;
  setDestination: (location: { address: string; coordinates: any }) => void;
  onOpenPickupMap: () => void;
  onOpenDestinationMap: () => void;
  onSubmit: () => void;
}

const FindRideForm: React.FC<FindRideFormProps> = ({
  pickup,
  destination,
  setPickup,
  setDestination,
  onOpenPickupMap,
  onOpenDestinationMap,
  onSubmit,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pickup Location:</Text>
      <Input
        placeholder="Enter pickup address"
        value={pickup.address}
        setValue={(text) => setPickup({ ...pickup, address: text })}
      />
      <AppButton title="Select on Map" onPress={onOpenPickupMap}  />

      <View style={styles.separator} />

      <Text style={styles.label}>Destination:</Text>
      <Input
        placeholder="Enter destination address"
        value={destination.address}
        setValue={(text) => setDestination({ ...destination, address: text })}
      />
      <AppButton title="Select on Map" onPress={onOpenDestinationMap}  />

      <AppButton title="Find Riders" onPress={onSubmit} style={styles.findButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  separator: {
    height: 15,
  },
 
  findButton: {
    marginTop: 25,
    backgroundColor: '#27ae60', // A nice green color for primary action
  },
});

export default FindRideForm;