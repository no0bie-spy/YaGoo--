import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export default function HomeScreen() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync('userRole').then(setRole);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome! to YaGoo</Text>
      <Text style={styles.role}>You are logged in as: {role}</Text>
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
    marginBottom: 10,
  },
  role: {
    fontSize: 18,
    color: '#666',
  },
});