import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { clearSession, getSession } from '@/usableFunction/Session';
import axios from 'axios';
import { LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [riderDocuments, setRiderDocuments] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);

  const handleLogout = async () => {
    await clearSession('accessToken');
    router.replace('/login');
  };

  const fetchUserDetails = async () => {
    try {
      const token = await getSession('accessToken');
      
      const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;
      console.log("IP Address:", IP_Address); // Debugging log
      const response = await axios.post(`http://${IP_Address}:8002/userdetails`, {

        headers: {
          Authorization: `${token}`,
        },
      });

      const data = response.data;
      setRole(data.user.role);
      setFullname(data.user.fullname);
      setPhone(data.user.phone);
      setEmail(data.user.email);

      if (data.user.role === 'rider') {
        setRiderDocuments(data.user.riderDocuments || null);
        setVehicle(data.user.vehicle || null);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{fullname || 'Loading...'}</Text>
        <Text style={styles.email}>{email || 'Loading...'}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Phone: {phone || 'Loading...'}</Text>
        <Text style={styles.infoText}>Role: {role || 'Loading...'}</Text>

        {role === 'rider' && riderDocuments && (
          <>
            <Text style={styles.subHeading}>Rider Documents</Text>
            <Text style={styles.infoText}>License Number: {riderDocuments.licenseNumber}</Text>
            <Text style={styles.infoText}>Citizenship Number: {riderDocuments.citizenshipNumber}</Text>
          </>
        )}

        {role === 'rider' && vehicle && (
          <>
            <Text style={styles.subHeading}>Vehicle Details</Text>
            <Text style={styles.infoText}>Type: {vehicle.vehicleType}</Text>
            <Text style={styles.infoText}>Name: {vehicle.vehicleName}</Text>
            <Text style={styles.infoText}>Model: {vehicle.vehicleModel}</Text>
            <Text style={styles.infoText}>Number Plate: {vehicle.vehicleNumberPlate}</Text>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={24} color="#FF3B30" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 15,
    marginBottom: 10,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginTop: 30,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
});
