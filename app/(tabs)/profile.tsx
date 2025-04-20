import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { clearSession, getSession } from '@/usableFunction/Session';
import axios from 'axios';
import { Edit2Icon, EditIcon, Lock, LogOut } from 'lucide-react-native';
import AppButton from '@/components/Button';
import Input from '@/components/Input';

export default function ProfileScreen() {
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [riderDocuments, setRiderDocuments] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [showChangePassword, setShowChangePassword] = useState(false); // State to toggle Change Password view
  const [showEditProfile, setShowEditProfile] = useState(false); // State to toggle Edit Profile view
  const [currentpassword, setcurrentPassword] = useState('');
  const [newpassword, setnewPassword] = useState('');

  const handleLogout = async () => {
    await clearSession('accessToken');
    router.replace('/login');
  };

  const fetchUserDetails = async () => {
    try {
      const token = await getSession('accessToken');
      console.log('Fetched Token:', token); // Debugging log

      const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

      console.log('IP Address:', IP_Address); // Debugging log
      const response = await axios.get(`http://${IP_Address}:8002/userdetails`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add "Bearer" prefix
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

  const handleSaveProfile = async () => {
    try {
      const token = await getSession('accessToken');
      const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

      const response = await axios.put(
        `http://${IP_Address}:8002/editProfileDetails`,
        { fullname, phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Profile updated:', response.data);
      alert('Profile updated successfully!');
      setShowEditProfile(false); // Go back to Profile view
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };
  const handleChangePassword = async () => {
    try {
      const token = await getSession('accessToken');
      const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

      const response = await axios.put(
        `http://${IP_Address}:8002/changePassword`,
        { currentpassword, newpassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Password changed:', response.data);
      alert('Password changed successfully!');
      setShowChangePassword(false); // Go back to Profile view
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please try again.');
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {showChangePassword ? (
        // Change Password View
        <View style={styles.centeredContainer}>
          <Text style={styles.heading}>Change Password</Text>
          <View style={styles.formContainer}>
            <Input
              icon={<Lock size={20} />}
              placeholder="Current Password"
              value={currentpassword}
              setValue={setcurrentPassword}
              secureTextEntry
            />
            <Input
              icon={<Lock size={20} />}
              placeholder="New Password"
              value={newpassword}
              setValue={setnewPassword}
              secureTextEntry
            />
            <Input
              icon={<Lock size={20} />}
              placeholder="Confirm Password"
              value={newpassword}
              setValue={setnewPassword}
              secureTextEntry
            />

            <AppButton title="Change Password" onPress={handleChangePassword} />
            <AppButton
              title="Back to Profile"
              onPress={() => setShowChangePassword(false)} // Go back to Profile view
              style={{ backgroundColor: '#007AFF' }}
              textStyle={{ color: '#FFF' }}
            />
          </View>
        </View>
      ) : showEditProfile ? (
        // Edit Profile View
        <View style={styles.centeredContainer}>
          <Text style={styles.heading}>Edit Profile</Text>
          <View style={styles.formContainer}>
            <Input
              placeholder="Full Name"
              value={fullname}
              setValue={setFullname}
            />
            <Input
              placeholder="Phone Number"
              value={phone}
              setValue={setPhone}
              keyboardType="phone-pad"
            />
            <AppButton title="Save Changes" onPress={handleSaveProfile} />
            <AppButton
              title="Back to Profile"
              onPress={() => setShowEditProfile(false)} // Go back to Profile view
              style={{ backgroundColor: '#007AFF' }}
              textStyle={{ color: '#FFF' }}
            />
          </View>
        </View>
      ) : (
        // Profile View
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
          <AppButton
            title="Edit Profile"
            onPress={() => setShowEditProfile(true)}
            Icon={Edit2Icon}
            iconColor="#FFF"
            iconSize={28}
            style={{ backgroundColor: '#007AFF' }}
            textStyle={{ color: '#FFF' }}
          />
          <AppButton
            title="Change Password"
            onPress={() => setShowChangePassword(true)}
            Icon={EditIcon}
            iconColor="#FFF"
            iconSize={28}
            style={{ backgroundColor: '#007AFF' }}
            textStyle={{ color: '#FFF' }}
          />
          <AppButton
            title="Logout"
            onPress={handleLogout}
            Icon={LogOut}
            iconColor="#FF3B30"
            iconSize={28}
            style={{ backgroundColor: '#fff' }}
            textStyle={{ color: '#FF3B30' }}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 30,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  formContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4, // For Android
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4, // For Android
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
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
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4, // For Android
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 15,
    marginBottom: 10,
    color: '#333',
  },
  button: {
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4, // For Android
  },
});