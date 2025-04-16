import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const storeSession = async (key: string, value: string) => {
  if (Platform.OS !== 'web') {
    await SecureStore.setItemAsync(key, value);
  } else {
    localStorage.setItem(key, value);
  }
};

export const getSession = async (key: string) => {
  if (Platform.OS !== 'web') {
    return await SecureStore.getItemAsync(key);
  } else {
    return localStorage.getItem(key);
  }
};

export const clearSession = async (key: string) => {
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync(key);
  } else {
    localStorage.removeItem(key);
  }
};