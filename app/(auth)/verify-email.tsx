import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import Input from '@/components/Input';
import { Mail, Phone } from 'lucide-react-native';
import AppButton from '@/components/Button';

export default function VerifyEmail() {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleVerify = async () => {
    try {
      const response = await axios.post('http://192.168.1.149:8002/verifyOTP', {
        email,
        otp,
      });

      const data = await response.data;
      console.log(data);
      router.replace({
        pathname: '/login',
        params: { message: 'Registration successful!' }
      });
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
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>We’ve sent an OTP to: {email}</Text>

      {errors.length > 0 && errors.map((err, i) => (
        <Text key={i} style={styles.error}>{err}</Text>
      ))}


      <Input
        icon={<Phone size={20} />}
        placeholder="Otp"
        value={otp}
        setValue={setOtp}
        keyboardType="number-pad"
      />

      <AppButton title="Verify Email" onPress={handleVerify} />
      <AppButton
        title="Already have an account? Login"
        onPress={() => router.push('/login')}
        style={{ backgroundColor: 'transparent' }}
        textStyle={{ color: '#2196F3' }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 100 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 20 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  error: { color: 'red', marginBottom: 15, textAlign: 'center' },
});
