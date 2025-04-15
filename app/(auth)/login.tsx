import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const { message } = useLocalSearchParams();

  const handleLogin = async () => {
    try {
      const userData: any = {
        email,
        password
      };
      const response = await axios.post('http://192.168.1.65:8002/login', userData);
      const data = await response.data;


      router.replace('/(tabs)');
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
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      {message ? (
        <Text style={styles.success}>{message}</Text>
      ) : null}

      {errors.length > 0 &&
        errors.map((err, index) => (
          <Text key={index} style={styles.error}>
            {err}
          </Text>
        ))}



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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  success: {
    color: 'green',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
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
  },
});