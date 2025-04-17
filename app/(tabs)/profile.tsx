

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { clearSession, getSession } from '@/usableFunction/Session';
import { useEffect, useState } from 'react';

export default function ProfileScreen() {
  const [role, setRole] = useState<string | null>(null);

  // Logout function
  const handleLogout = async () => {
    await clearSession('accessToken'); // Make sure this matches the key you actually stored
    router.replace('/login');
  };
  

  // Load role from session
  useEffect(() => {
    (async () => {
      const savedRole = await getSession("accessToken"); // or "token" if that's what you're storing
      if (savedRole) setRole(savedRole);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.title}>Role: {role ?? 'Loading...'}</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    maxWidth: 200,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});