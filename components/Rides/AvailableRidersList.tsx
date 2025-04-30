import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Rider = {
  _id?: string;
  riderName: string;
  vehicle: string;
  price: number;
};

type Props = {
  riders: Rider[];
  disabled: boolean; 
};

const AvailableRidersList = ({ riders }: Props) => {
    if (riders.length === 0) {
        return <Text>No available riders</Text>;
      }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Riders Who Accepted Your Ride:</Text>
      {riders.map((rider, index) => (
        <View key={rider._id || index} style={styles.card}>
          <Text>👤 Rider: {rider.riderName}</Text>
          <Text>🚗 Vehicle: {rider.vehicle}</Text>
          <Text>💰 Offered Price: Rs. {rider.price}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  card: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
});

export default AvailableRidersList;
