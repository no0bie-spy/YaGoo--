import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const storeSession = async (key: string, value: string) => {
  console.log(`Storing session: ${key} = ${value}`); // Debugging log
  if (Platform.OS !== 'web') {
    await SecureStore.setItemAsync(key, value);
  } else {
    localStorage.setItem(key, value);
  }
};

export const getSession = async (key: string) => {
  const value = Platform.OS !== 'web'
    ? await SecureStore.getItemAsync(key)
    : localStorage.getItem(key);
  console.log(`Retrieved session: ${key} = ${value}`); // Debugging log
  return value;
};

export const clearSession = async (key: string) => {
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync(key);
  } else {
    localStorage.removeItem(key);
  }
};