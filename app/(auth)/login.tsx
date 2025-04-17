import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import Input from '@/components/Input';
import AppButton from '@/components/Button';
import { storeSession } from '@/usableFunction/Session';
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
      const response = await axios.post('http://192.168.1.149:8002/login', userData);

      const data = await response.data;
      console.log(data)
      await storeSession('accessToken', String(data.token));
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
      <Input
        icon={<Mail size={20} />}
        placeholder="Email"
        value={email}
        setValue={setEmail}
        keyboardType="email-address"
      />
      <Input
        icon={<Lock size={20} />}
        placeholder="Password"
        value={password}
        setValue={setPassword}
        secureTextEntry
      />

      <AppButton title="Login" onPress={handleLogin} />

      <AppButton
        title="Don't have an account? Register"
        onPress={() => router.push('/register')}
        style={{ backgroundColor: 'transparent' }}
        textStyle={{ color: '#2196F3' }}
      />
      <AppButton
        title="Forget Password?"
        onPress={() => router.replace('/forgot-password')} // Corrected route name
        style={{ backgroundColor: 'transparent' }}
        textStyle={{ color: '#2196F3' }}
      />

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