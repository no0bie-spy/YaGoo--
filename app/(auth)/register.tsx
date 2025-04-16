import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Lock, Mail, User, Phone, BadgeCheck, Bike } from 'lucide-react-native';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import Input from '@/components/Input';
import AppButton from '@/components/Button';
import CustomImagePicker from '@/components/ImageInput';

type UserRole = 'customer' | 'rider';

export default function Register() {
  const [role, setRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<string[]>([]);


  const handleRegister = async () => {
    try {
      const userData: any = {
        email,
        password,
        fullname,
        phone,
        role: 'Customer',  // Note: Ensure role is 'Customer' here if that's intended
      };
  
      const response = await axios.post('http://192.168.1.149:8002/register', userData);
      const data = await response.data;
      console.log(data);
  
      // After successful registration, navigate to switch-role.tsx
      router.push('/switch-role');  // Change the path to switch-role
  
    } catch (error: any) {
      console.log("Full error:", error);
  
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const errorMessages = error.response.data.details.map((err: any) => err.message);
        setErrors(errorMessages);
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]); // fallback if message is provided
      } else {
        setErrors(["Something went wrong."]);
      }
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>

      <Text style={styles.title}>Create Account</Text>

      {/* Show errors if any */}
      {errors.length > 0 && errors.map((err, i) => (
        <Text key={i} style={styles.error}>{err}</Text>
      ))}

      {/* Shared Inputs */}
      <Input icon={<Mail size={20} />} placeholder="Email" value={email} setValue={setEmail} keyboardType="email-address" />
      <Input icon={<Lock size={20} />} placeholder="Password" value={password} setValue={setPassword} secureTextEntry />
      <Input icon={<User size={20} />} placeholder="Full Name" value={fullname} setValue={setFullname} />
      <Input icon={<Phone size={20} />} placeholder="Phone" value={phone} setValue={setPhone} keyboardType="phone-pad" />

      

      <AppButton title="Register" onPress={handleRegister} style={styles.fullWidth} />
      <AppButton
        title="Already have an account? Login"
        onPress={() => router.push('/login')}
        style={{ backgroundColor: 'transparent' }}
        textStyle={{ color: '#2196F3' }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  roleButtonActive: {
    backgroundColor: '#007AFF',
  },
  roleText: {
    color: '#666',
  },
  roleTextActive: {
    color: '#fff',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  
});
