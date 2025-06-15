import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSession } from '@/usableFunction/Session';

const IP_Address = process.env.EXPO_PUBLIC_ADDRESS;

export default function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let socketClient: Socket;

    async function initSocket() {
      try {
        const token = await getSession('accessToken');

        socketClient = io(`http://${IP_Address}:8000`, {
          auth: {
            token,
          },
          transports: ['websocket'], // recommended for React Native
        });

        setSocket(socketClient);
        setLoading(false);

        // Example: Add event listeners if needed
        socketClient.on('connect', () => {
          console.log('Socket connected:', socketClient.id);
        });

        socketClient.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
        });

      } catch (error) {
        console.error('Error getting token or connecting socket:', error);
        setLoading(false);
      }
    }

    initSocket();

    // Cleanup on unmount
    return () => {
      if (socketClient) {
        socketClient.disconnect();
      }
    };
  }, []);

  return { socket, loading };
}
