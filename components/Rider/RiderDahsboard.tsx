import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import AppButton from '../Button';
import axios from 'axios';
import { getSession } from '@/usableFunction/Session';

const RiderDashboard = () => {
  const [rideRequests, setRideRequests] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

  const fetchRideRequests = async () => {
    try {
      const token = await getSession('accessToken');
      if (!token) {
        setErrors(['You are not logged in. Please log in to continue.']);
        return;
      }

      const response = await axios.get(`http://${IP_Address}:8002/rides/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRideRequests(response.data || []);
      setErrors([]);
    } catch (error: any) {
      console.error('Full error:', error);
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        setErrors(error.response.data.details.map((err: any) => err.message));
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(['Something went wrong.']);
      }
    }
  };

  // Refresh ride requests every 5 seconds
  useEffect(() => {
    fetchRideRequests(); // initial fetch
    const interval = setInterval(fetchRideRequests, 5000); // refresh every 5s
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  const renderRide = ({ item }: { item: any }) => (
    <View style={styles.rideCard}>
      <Text style={styles.title}>Customer: {item.customerName}</Text>
      <Text>Pickup: {item.startDestination}</Text>
      <Text>Drop-off: {item.endDestination}</Text>
      <Text>Email: {item.customerEmail}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Rides</Text>

      {errors.map((err, idx) => (
        <Text key={idx} style={styles.error}>{err}</Text>
      ))}

<ScrollView contentContainerStyle={styles.scrollContainer}>
  {rideRequests.map((item, idx) => (
    <View key={item._id || idx} style={styles.rideCard}>
      <Text style={styles.title}>Customer: {item.customerName}</Text>
      <Text>Pickup: {item.startDestination}</Text>
      <Text>Drop-off: {item.endDestination}</Text>
      <Text>Email: {item.customerEmail}</Text>
    </View>
  ))}
</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  rideCard: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  error: {
    color: 'red',
    marginBottom: 5,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
});

export default RiderDashboard;
