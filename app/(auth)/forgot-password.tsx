
import AppButton from '@/components/Button'
import Input from '@/components/Input'
import { Mail, View } from 'lucide-react-native'
import React from 'react'
import { Text } from 'react-native-svg'

export default function forgotPassword() {
    const [email, setEmail] = React.useState('')
    const [errors, setErrors] = React.useState<string[]>([])

    const handleforgetPassword = async () => {
        try {
            const userData={
                email
            }

        }
        catch (error: any) {
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
            <Text>forgot-password</Text>
            <Input icon={<Mail size={20} />} placeholder="Email" value={email} setValue={setEmail} keyboardType="email-address" />
            <AppButton title="Send OTP" onPress={handleforgetPassword} />
        </View>
    )

}

