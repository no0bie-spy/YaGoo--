import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import axios from 'axios';
import { getSession } from '@/usableFunction/Session';
import { router } from 'expo-router';

const screenHeight = Dimensions.get('window').height;

const RiderDashboard = () => {
  const [rideRequests, setRideRequests] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

  const fetchRideRequests = async () => {
    try {
      setIsLoading(true); // Start loading
      const token = await getSession('accessToken');
      if (!token) {
        setErrors(['You are not logged in. Please log in to continue.']);
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`http://${IP_Address}:8002/rides/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched ride requests:", response.data.rides);

      setRideRequests(Array.isArray(response.data.rides) ? response.data.rides : []);
      setErrors([]);
    } catch (error: any) {
      console.error('Fetch ride requests error:', error);
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        setErrors(error.response.data.details.map((err: any) => err.message));
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(['Something went wrong.']);
      }
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handleAccept = async (rideId: string) => {
    try {
      const token = await getSession('accessToken');
      if (!token) {
        setErrors(['You are not logged in. Please log in to continue.']);
        return;
      }

      console.log('Attempting to accept ride:', rideId);

      // Send request to accept the ride
      const response = await axios.post(
        `http://${IP_Address}:8002/rides/rider-request`,
        { rideId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        console.log('Ride accepted successfully:', rideId);

        // Remove the accepted ride from the list
        setRideRequests((prevRequests) =>
          prevRequests.filter((ride) => ride.rideId !== rideId)
        );

        Alert.alert('Success', `You have accepted ride: ${rideId}`);
      } else {
        console.error('Unexpected response status:', response.status);
      }

      // Fetch OTP for the accepted ride
      const otpResponse = await axios.get(
        `http://${IP_Address}:8002/rides/view-otp`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (otpResponse.status === 200) {
        console.log('OTP received successfully:', otpResponse.data.otp);

        Alert.alert('OTP Received', 'Please check your email for the OTP.');
        router.push({
          pathname: '/(root)/(rides)/ViewOtpScreen',
          params: { otp: otpResponse.data.otp, rideId },
        });
      } else {
        console.error('Unexpected OTP response status:', otpResponse.status);
      }
    } catch (error: any) {
      console.error('Error accepting ride:', error);

      // Handle errors
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        setErrors(error.response.data.details.map((err: any) => err.message));
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(['Something went wrong. Please try again.']);
      }
    }
  };

  const handleReject = (rideId: string) => {
    setRideRequests(prevRequests => prevRequests.filter(ride => ride.rideId !== rideId));
    alert(`Rejected ride: ${rideId}`);
  };

  useEffect(() => {
    fetchRideRequests(); // Fetch data initially
    const interval = setInterval(() => {
      fetchRideRequests(); // Fetch data every 5 seconds
    }, 5000);
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Ride Requests</Text>

      {isLoading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <>
          {errors.map((err, idx) => (
            <Text key={idx} style={styles.error}>{err}</Text>
          ))}

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContainer}>
            {rideRequests.length > 0 ? (
              rideRequests.map((item, idx) => (
                <View key={item.rideId || idx} style={styles.card}>
                  <View style={styles.cardContent}>
                    <Text style={styles.name}>{item.customerName}</Text>
                    <Text style={styles.label}>📍 Pickup: <Text style={styles.value}>{item.startDestination}</Text></Text>
                    <Text style={styles.label}>🏁 Drop-off: <Text style={styles.value}>{item.endDestination}</Text></Text>
                    <Text style={styles.label}>✉️ Email: <Text style={styles.value}>{item.customerEmail}</Text></Text>
                    <Text style={styles.label}>💰 Bid: <Text style={styles.value}>Rs. {item.bid}</Text></Text>
                  </View>

                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={[styles.button, styles.acceptButton]}
                      onPress={() => handleAccept(item.rideId)}
                    >
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.rejectButton]}
                      onPress={() => handleReject(item.rideId)}
                    >
                      <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noData}>No ride requests available.</Text>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: screenHeight * 0.7,
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  error: {
    color: 'red',
    marginBottom: 6,
    fontSize: 14,
    textAlign: 'center',
  },
  scrollArea: {
    flexGrow: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  cardContent: {
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1e1e1e',
  },
  label: {
    fontSize: 14,
    marginBottom: 3,
    color: '#444',
  },
  value: {
    fontWeight: '600',
    color: '#000',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  loading: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});

export default RiderDashboard;
