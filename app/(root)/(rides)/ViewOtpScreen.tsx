import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ViewOtpScreen = () => {
    // Replace with actual OTP data and logic
    const otp = '123456';

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your OTP</Text>
            <Text style={styles.otp}>{otp}</Text>
            <Text style={styles.instruction}>Please share this OTP with your rider.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    otp: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'blue',
        marginBottom: 20,
    },
    instruction: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default ViewOtpScreen;