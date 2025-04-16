import AppButton from '@/components/Button';
import Input from '@/components/Input';
import { storeSession } from '@/usableFunction/Session';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { Phone, Text, View } from 'lucide-react-native'
import React, { useState } from 'react'
import { StyleSheet } from 'react-native';

export default function verifyPassword() {
    const { email } = useLocalSearchParams();
    const [errors, setErrors] = useState<string[]>([]);
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [retypepassword, setretypePassword] = useState('');
    const handleVerify = async () => {
        try {
            const userData = {
                email,
                otp,
                password,
                retypepassword
            }
            const response=await axios.post('http://192.168.1.149:8002/verify-password', userData)
            const data = await response.data;
            console.log(data)
            await storeSession('accessToken', data.token);
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
    }
    return (
        <View>
            <Text>verify-password</Text>
            <Text style={styles.subtitle}>We’ve sent an OTP to: {email}</Text>
            {errors.length > 0 && errors.map((err, i) => (
                <Text key={i} style={styles.error}>{err}</Text>
            ))}

            <Input
                icon={<Phone size={20} />}
                placeholder="Otp"
                value={otp}
                setValue={setOtp}
                keyboardType="numeric"
            />
            <Input
                icon={<Text size={20} />}
                placeholder="New Password"
                value={password}
                setValue={setPassword}
                secureTextEntry
            />
            <Input
                icon={<Text size={20} />}
                placeholder="New Password"
                value={retypepassword}
                setValue={setretypePassword}
                secureTextEntry
            />
            <AppButton title="Verify" onPress={handleVerify} />


        </View>
    )
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