import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { clearSession, getSession } from '@/usableFunction/Session';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProfileScreen() {
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogout = async () => {
    await clearSession('accessToken');
    router.replace('/login');
  };

  const fetchUserDetails = async () => {
    try {
      const token = await getSession('accessToken');
      const response = await axios.get('http://192.168.1.149:8002/userdetails', {
        headers: {
          Authorization: `${token}`,
        },
      });

      const data = response.data;
      setRole(data.user.role);
      setFullname(data.user.fullname);
      setPhone(data.user.phone);
      setEmail(data.user.email);
    } catch (error: any) {
      console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Full Name: {fullname || 'Loading...'}</Text>
        <Text style={styles.infoText}>Phone: {phone || 'Loading...'}</Text>
        <Text style={styles.infoText}>Email: {email || 'Loading...'}</Text>
        <Text style={styles.infoText}>Role: {role || 'Loading...'}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  infoContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,  
    }
  },
  infoText: {
    fontSize: 15,
    marginBottom: 12,
    color: '#333',
  },
  button: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    maxWidth: 200,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
