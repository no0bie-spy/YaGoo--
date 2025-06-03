import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '@/services/socketService';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

interface SocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  lastMessage: any | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  lastMessage: null,
  connect: async () => {},
  disconnect: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        setConnectionError('No internet connection');
        socketService.disconnect();
      } else if (state.isConnected && !isConnected && !isConnecting) {
        connect();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isConnected, isConnecting]);

  const connect = async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      await socketService.connect();
      
      if (socketService.isConnected()) {
        setIsConnected(true);
        setConnectionError(null);
      } else {
        throw new Error('Failed to establish connection');
      }
    } catch (error) {
      console.error('Socket connection error:', error);
      setConnectionError('Unable to connect to server');
      Alert.alert(
        'Connection Error',
        'Unable to connect to server. Please check your internet connection and try again.',
        [
          {
            text: 'Retry',
            onPress: connect,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    socketService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(null);
  };

  // Set up global message listener
  useEffect(() => {
    if (isConnected) {
      socketService.onAnyMessage((message: any) => {
        setLastMessage(message);
      });
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, [isConnected]);

  const value = {
    isConnected,
    isConnecting,
    connectionError,
    lastMessage,
    connect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 