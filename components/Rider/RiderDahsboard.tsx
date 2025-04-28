import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RiderDashboard = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rider Dashboard</Text>
      <Text>Here you can manage your rides, view earnings, and more.</Text>
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
});

export default RiderDashboard;