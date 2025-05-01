import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface Rider {
  riderListId: string;
  name: string;
  rating: string;
  vehicle: string;
}

interface AvailableRidersListProps {
  riders: Rider[];
  disabled: boolean;
  onAccept: (riderId: string) => void;
  onReject: (riderId: string) => void;
}

const AvailableRidersList: React.FC<AvailableRidersListProps> = ({
  riders,
  disabled,
  onAccept,
  onReject,
}) => {
  return (
    <View style={styles.container}>
      {riders.map((rider) => (
        <View key={rider.riderListId} style={styles.riderCard}>
          <Text>Name: {rider.name}</Text>
          <Text>Rating: {rider.rating}</Text>
          <Text>Vehicle: {rider.vehicle}</Text>
          <View style={styles.actions}>
            <Button
              title="Accept"
              onPress={() => onAccept(rider.riderListId)}
              disabled={disabled}
            />
            <Button
              title="Reject"
              onPress={() => onReject(rider.riderListId)}
              disabled={disabled}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  riderCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default AvailableRidersList;
