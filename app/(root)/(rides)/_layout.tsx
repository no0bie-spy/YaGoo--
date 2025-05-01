import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(rides)/VerifyOtpScreen" options={{ title: 'Verify OTP' }} />
      <Stack.Screen name="(rides)/CompleteRideScreen" options={{ title: 'Complete Ride' }} />
      <Stack.Screen name="(rides)/ReviewScreen" options={{ title: 'Submit Review' }} />
    </Stack>
  );
}