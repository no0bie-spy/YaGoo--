import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Lock, Mail, User, Phone, Truck } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

type UserRole = 'customer' | 'rider' | 'admin';

export default function Register() {
  const [role, setRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [bikeNumberPlate, setBikeNumberPlate] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      const userData = {
        email,
        password,
        name,
        phone,
        role,
        ...(role === 'rider' && {
          licenseNumber,
          bikeNumberPlate,
          bikeModel,
        }),
      };

      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (Platform.OS !== 'web') {
        // Use SecureStore for native platforms
        await SecureStore.setItemAsync('token', data.token);
        await SecureStore.setItemAsync('userRole', data.user.role);
      } else {
        // Use localStorage for web platform
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
      }

      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === 'customer' && styles.roleButtonActive]}
          onPress={() => setRole('customer')}
        >
          <Text style={[styles.roleText, role === 'customer' && styles.roleTextActive]}>
            Customer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === 'rider' && styles.roleButtonActive]}
          onPress={() => setRole('rider')}
        >
          <Text style={[styles.roleText, role === 'rider' && styles.roleTextActive]}>
            Rider
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Mail size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Lock size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <User size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Phone size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      {role === 'rider' && (
        <>
          <View style={styles.inputContainer}>
            <Truck size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="License Number"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />
          </View>

          <View style={styles.inputContainer}>
            <Truck size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Bike Number Plate"
              value={bikeNumberPlate}
              onChangeText={setBikeNumberPlate}
            />
          </View>

          <View style={styles.inputContainer}>
            <Truck size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Bike Model"
              value={bikeModel}
              onChangeText={setBikeModel}
            />
          </View>
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 40,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 30,
  },
});