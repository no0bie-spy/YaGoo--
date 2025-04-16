import AppButton from '@/components/Button';
import Input from '@/components/Input';
import { storeSession } from '@/usableFunction/Session';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { Lock, Mail, Phone } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function VerifyPassword() {
    const { email } = useLocalSearchParams();
    const [errors, setErrors] = useState<string[]>([]);
    const [OTP, setOtp] = useState('');
    const [newPassword, setPassword] = useState('');
    const [retypePassword, setretypePassword] = useState('');

    const handleVerify = async () => {
        if (newPassword !== retypePassword) {
            return setErrors(['Passwords do not match.']);
        }

        try {
            const userData = {
                email,
                OTP,
                newPassword,
                retypePassword,
            };

            const response = await axios.post('http://192.168.1.149:8002/changePassword', userData);
            const data = await response.data;

            await storeSession('accessToken', data.token);
            router.replace('/(tabs)');
        } catch (error: any) {
            console.log('Full error:', error);

            if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
                const errorMessages = error.response.data.details.map((err: any) => err.message);
                setErrors(errorMessages);
            } else if (error.response?.data?.message) {
                setErrors([error.response.data.message]);
            } else {
                setErrors(['Something went wrong.']);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Verify Password</Text>
                <Text style={styles.subtitle}>We’ve sent an OTP to: {email}</Text>

                {errors.length > 0 &&
                    errors.map((err, i) => (
                        <Text key={i} style={styles.error}>
                            {err}
                        </Text>
                    ))}

                <Input
                    icon={<Phone size={20} />}
                    placeholder="OTP"
                    value={OTP}
                    setValue={setOtp}
                    keyboardType="numeric"
                />
                <Input
                    icon={<Lock size={20} />}
                    placeholder="New Password"
                    value={newPassword}
                    setValue={setPassword}
                    secureTextEntry
                />
                <Input
                    icon={<Lock size={20} />}
                    placeholder="Retype New Password"
                    value={retypePassword}
                    setValue={setretypePassword}
                    secureTextEntry
                />

                <AppButton title="Verify" onPress={handleVerify} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
        marginTop: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    error: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
});
