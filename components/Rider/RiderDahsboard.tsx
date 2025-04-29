import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from '../Button';
import { Axis3D } from 'lucide-react-native';
import axios from 'axios';
import { getSession } from '@/usableFunction/Session';

const RiderDashboard =() => {
  const [errors,setErrors]=useState<string[]>([])
  const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;
  const handleAvailableRide=async()=>{

    try{ 
      const token = await getSession('accessToken');
      if (!token) {
        return alert('You are not logged in. Please log in to continue.');
      }
      const response=await axios.get(`http://${IP_Address}:8002/request`,{
        headers: { Authorization: `Bearer ${token}` },
      })
      const data=await response.data()
    }catch (error: any) {
      console.error('Full error:', error);

      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const errorMessages = error.response.data.details.map((err: any) => err.message);
        setErrors(errorMessages);
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(['Something went wrong.']);
      }
    }
  }
  return (
    <View style={styles.container}>
    <AppButton title='Get Ride' onPress={handleAvailableRide} /> 
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
    marginBottom: 20,
  },
});

export default RiderDashboard;