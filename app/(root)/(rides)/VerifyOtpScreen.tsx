import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSession } from '@/usableFunction/Session';

const IP_Address = process.env.EXPO_PUBLIC_ADDRESS || 'YOUR_IP_ADDRESS';

const VerifyOtpScreen = ({ route }: any) => {
  const { email, rideId } = route.params;
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const handleVerifyOtp = async () => {
    if (!otp) {
      return Alert.alert('Please enter the OTP');
    }
    const {email}=useLocalSearchParams();
    const {rideId}=useLocalSearchParams();

    try {
      const token = await getSession('accessToken');
      const response = await axios.post(
        `http://${IP_Address}:8002/rides/verify-otp`,
        { email:email, rideId:rideId, riderOtp: otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(response.data.message || 'OTP verified successfully');
      router.push({
        pathname: '/(root)/(rides)/CompleteRideScreen',
        params: {  rideId },
      });
    } catch (error: any) {
      console.error('Verify OTP Error:', error);
      Alert.alert(
        error.response?.data?.message || 'Failed to verify OTP. Please try again.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the OTP sent to the rider's email to start the ride.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
      />
      <Button title="Verify OTP" onPress={handleVerifyOtp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
  },
});

export default VerifyOtpScreen;