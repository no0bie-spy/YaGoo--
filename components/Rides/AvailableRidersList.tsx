import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

type Rider = {
  _id?: string;
  name: string;
  vehicle: string;
  rating: number | string;
};

type Props = {
  riders: Rider[];
  disabled: boolean;
};

const AvailableRidersList = ({ riders, disabled }: Props) => {
  if (riders.length === 0) {
    return <Text style={styles.noData}>No available riders</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Riders Who Accepted Your Ride</Text>
      {riders.map((rider, index) => (
        <View key={rider._id || index} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{rider.name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.name}>{rider.name}</Text>
              <Text style={styles.detail}>⭐ Rating: {rider.rating}</Text>
              <Text style={styles.detail}>🚗 Vehicle: {rider.vehicle}</Text>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton, disabled && styles.disabledButton]}
              onPress={() => console.log('Accept clicked for', rider._id)}
              disabled={disabled}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton, disabled && styles.disabledButton]}
              onPress={() => console.log('Reject clicked for', rider._id)}
              disabled={disabled}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    maxHeight: screenHeight * 0.7,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: '#2c3e50',
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#3498db',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2c3e50',
  },
  detail: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#27ae60',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default AvailableRidersList;
