import { io, Socket } from 'socket.io-client';
import { getSession } from '@/usableFunction/Session';

const IP_Address = process.env.EXPO_PUBLIC_ADDRESS || 'YOUR_IP_ADDRESS';
const MAX_RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 3000;

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  rideId: string;
}

interface MessageHandler {
  (message: any): void;
}

interface RiderJoinResponse {
  success: boolean;
  error?: string;
  rideDetails?: {
    rideId: string;
    driverId: string;
    status: string;
    currentLocation?: {
      lat: number;
      lon: number;
    };
  };
}

interface Bid {
  bidId: string;
  rideId: string;
  driverId: string;
  amount: number;
  estimatedTime: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  driverDetails?: {
    name: string;
    rating: number;
    vehicleDetails: {
      model: string;
      color: string;
      plateNumber: string;
    };
  };
}

interface BidEventHandler {
  (bid: Bid): void;
}

interface RideStatus {
  rideId: string;
  status: 'pending' | 'accepted' | 'started' | 'completed' | 'cancelled';
  driverId?: string;
  riderId?: string;
  currentLocation?: {
    lat: number;
    lon: number;
  };
  updatedAt: string;
  estimatedArrival?: {
    pickup?: number;
    destination?: number;
  };
}

interface RideEventHandler {
  (rideStatus: RideStatus): void;
}

interface Location {
  lat: number;
  lon: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: number;
}

interface LocationUpdate {
  rideId: string;
  userId: string;
  userType: 'rider' | 'driver';
  location: Location;
}

interface LocationEventHandler {
  (update: LocationUpdate): void;
}

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private reconnectionAttempts = 0;
  private reconnectionTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private connectionPromise: Promise<void> | null = null;
  private eventQueue: Array<{ event: string; handler: any }> = [];
  private messageHandlers: Set<MessageHandler> = new Set();
  private bidHandlers: {
    newBid: Set<BidEventHandler>;
    bidUpdated: Set<BidEventHandler>;
    bidAccepted: Set<BidEventHandler>;
    bidExpired: Set<BidEventHandler>;
  } = {
    newBid: new Set(),
    bidUpdated: new Set(),
    bidAccepted: new Set(),
    bidExpired: new Set(),
  };
  private rideHandlers: {
    rideAccepted: Set<RideEventHandler>;
    rideStarted: Set<RideEventHandler>;
    rideCompleted: Set<RideEventHandler>;
    rideCancelled: Set<RideEventHandler>;
    rideStatusUpdated: Set<RideEventHandler>;
  } = {
    rideAccepted: new Set(),
    rideStarted: new Set(),
    rideCompleted: new Set(),
    rideCancelled: new Set(),
    rideStatusUpdated: new Set(),
  };
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private lastError: Error | null = null;
  private lastSuccessfulConnection: number | null = null;
  private serverHealthCheckTimer: NodeJS.Timeout | null = null;
  private connectionOptions = {
    reconnectionAttempts: MAX_RECONNECTION_ATTEMPTS,
    reconnectionDelay: RECONNECTION_DELAY,
    timeout: 15000,
    transports: ['websocket', 'polling'] as const,
    forceNew: true,
    autoConnect: false,
    query: {
      platform: 'mobile',
      version: '1.0.0',
    }
  };
  private pingInterval: NodeJS.Timeout | null = null;
  private locationHandlers: {
    riderLocationUpdate: Set<LocationEventHandler>;
    driverLocationUpdate: Set<LocationEventHandler>;
  } = {
    riderLocationUpdate: new Set(),
    driverLocationUpdate: new Set(),
  };

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  async connect() {
    // If already connected, return immediately
    if (this.socket?.connected) {
      return;
    }

    // If connecting, return existing promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this._connect();
    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async _connect() {
    if (this.isConnecting) {
      console.log('Connection already in progress');
      return;
    }

    this.isConnecting = true;
    this.connectionStatus = 'connecting';
    this.lastError = null;

    try {
      // Check server health before attempting connection
      const isHealthy = await this.checkServerHealth();
      if (!isHealthy) {
        throw new Error('Server health check failed');
      }

      const token = await getSession('accessToken');
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Clean up existing socket if any
      if (this.socket) {
        this.cleanupSocket();
      }

      // Try each transport with increasing timeouts
      for (const transport of this.connectionOptions.transports) {
        try {
          console.log(`Attempting connection with transport: ${transport}`);
          
          this.socket = io(`http://${IP_Address}:8002`, {
            ...this.connectionOptions,
            transports: [transport],
            auth: { token },
            timeout: this.calculateTimeout()
          });

          await this.setupEnhancedListeners();

          // Wait for connection
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error(`Connection timeout with ${transport}`));
            }, this.calculateTimeout());

            this.socket?.once('connect', () => {
              clearTimeout(timeout);
              this.lastSuccessfulConnection = Date.now();
              console.log(`Successfully connected using ${transport}`);
              this.startServerHealthCheck();
              this.processEventQueue();
              resolve();
            });

            this.socket?.once('connect_error', (error) => {
              clearTimeout(timeout);
              reject(error);
            });
          });

          // If we get here, connection was successful
          return;

        } catch (error) {
          console.error(`Failed to connect with ${transport}:`, error.message);
          this.cleanupSocket();
          
          // If this was the last transport, throw the error
          if (transport === this.connectionOptions.transports[this.connectionOptions.transports.length - 1]) {
            throw error;
          }
          // Otherwise continue to next transport
        }
      }

    } catch (error) {
      this.lastError = error as Error;
      console.error('All connection attempts failed:', {
        error: error.message,
        attempts: this.reconnectionAttempts,
        lastSuccess: this.lastSuccessfulConnection ? new Date(this.lastSuccessfulConnection).toISOString() : 'never'
      });
      this.handleConnectionError();
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private calculateTimeout(): number {
    // Increase timeout based on reconnection attempts
    const baseTimeout = this.connectionOptions.timeout;
    const multiplier = Math.min(this.reconnectionAttempts + 1, 3); // Cap at 3x
    return baseTimeout * multiplier;
  }

  private processEventQueue() {
    while (this.eventQueue.length > 0) {
      const { event, handler } = this.eventQueue.shift()!;
      this.registerEventHandler(event, handler);
    }
  }

  private registerEventHandler(event: string, handler: any) {
    if (!this.socket?.connected) {
      console.log(`Queueing ${event} handler for when connection is established`);
      // Check if handler is already queued
      const isQueued = this.eventQueue.some(e => e.event === event && e.handler === handler);
      if (!isQueued) {
        this.eventQueue.push({ event, handler });
        this.connect().catch(error => {
          console.error('Failed to connect while registering handler:', error);
        });
      }
      return;
    }

    try {
      switch (event) {
        case 'newBid':
          this.bidHandlers.newBid.add(handler);
          break;
        case 'rideAccepted':
          this.rideHandlers.rideAccepted.add(handler);
          break;
        case 'rideCancelled':
          this.rideHandlers.rideCancelled.add(handler);
          break;
        case 'riderLocationUpdate':
          this.locationHandlers.riderLocationUpdate.add(handler);
          break;
        case 'rideStatusUpdated':
        case 'rideStatusUpdate': // Support both versions
          this.rideHandlers.rideStatusUpdated.add(handler);
          break;
        default:
          console.warn(`Unknown event type: ${event}`);
      }
    } catch (error) {
      console.error(`Error registering handler for ${event}:`, error);
    }
  }

  // Update event registration methods
  onNewBid(handler: BidEventHandler) {
    this.registerEventHandler('newBid', handler);
  }

  onRideAccepted(handler: RideEventHandler) {
    this.registerEventHandler('rideAccepted', handler);
  }

  onRideCancelled(handler: RideEventHandler) {
    this.registerEventHandler('rideCancelled', handler);
  }

  onRiderLocationUpdate(handler: LocationEventHandler) {
    this.registerEventHandler('riderLocationUpdate', handler);
  }

  onRideStatusUpdated(handler: RideEventHandler) {
    this.registerEventHandler('rideStatusUpdated', handler);
  }

  // Add backward compatibility for onRideStatusUpdate
  onRideStatusUpdate(handler: RideEventHandler) {
    console.warn('Warning: onRideStatusUpdate is deprecated, use onRideStatusUpdated instead');
    return this.onRideStatusUpdated(handler);
  }

  private async setupEnhancedListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected successfully:', this.socket?.id);
      this.connectionStatus = 'connected';
      this.reconnectionAttempts = 0;
      this.lastError = null;
      this.clearReconnectionTimer();
      this.startPingInterval();
      this.processEventQueue(); // Process any queued events
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', {
        error: error.message,
        timestamp: new Date().toISOString(),
        attempts: this.reconnectionAttempts
      });
      this.lastError = error;
      this.connectionStatus = 'disconnected';
      this.handleConnectionError();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', {
        reason,
        timestamp: new Date().toISOString(),
        wasConnected: this.connectionStatus === 'connected'
      });
      this.connectionStatus = 'disconnected';
      this.clearPingInterval();
      
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // Don't attempt to reconnect for intentional disconnections
        return;
      }
      
      this.handleConnectionError();
    });

    // Enhanced error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      this.lastError = error;
      this.connectionStatus = 'disconnected';
      this.handleConnectionError();
    });

    // Transport error handling
    this.socket.on('transport_error', (error) => {
      console.error('Transport error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      this.attemptTransportFailover();
    });

    // Ping/Pong with timeout detection
    this.socket.on('pong', () => {
      console.log('Received pong from server');
      this.lastPongTime = Date.now();
    });

    // Handle any incoming message
    this.socket.onAny((eventName, ...args) => {
      const message = { event: eventName, data: args[0] };
      this.messageHandlers.forEach(handler => handler(message));
    });
  }

  private attemptTransportFailover() {
    if (!this.socket) return;

    const currentTransports = [...this.connectionOptions.transports];
    const failedTransport = currentTransports.shift();
    
    if (currentTransports.length > 0) {
      console.log(`Failing over from ${failedTransport} to ${currentTransports[0]}`);
      this.connectionOptions.transports = currentTransports;
      this.connect();
    }
  }

  private handleConnectionError() {
    if (this.reconnectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
      console.error('Max reconnection attempts reached', {
        attempts: this.reconnectionAttempts,
        lastError: this.lastError?.message,
        lastSuccess: this.lastSuccessfulConnection ? new Date(this.lastSuccessfulConnection).toISOString() : 'never'
      });
      this.eventQueue = []; // Clear event queue
      return;
    }

    this.reconnectionAttempts++;
    const delay = Math.min(
      RECONNECTION_DELAY * Math.pow(2, this.reconnectionAttempts - 1), // Exponential backoff
      60000 // Cap at 1 minute
    );
    
    console.log(`Scheduling reconnection attempt ${this.reconnectionAttempts}/${MAX_RECONNECTION_ATTEMPTS} in ${delay}ms`);

    this.clearReconnectionTimer();
    this.reconnectionTimer = setTimeout(async () => {
      try {
        // Check server health before attempting reconnection
        const isHealthy = await this.checkServerHealth();
        if (isHealthy) {
          await this.connect();
        } else {
          throw new Error('Server health check failed during reconnection');
        }
      } catch (error) {
        console.error('Reconnection attempt failed:', error);
        this.handleConnectionError(); // Try again if not at max attempts
      }
    }, delay);
  }

  private cleanupSocket() {
    if (!this.socket) return;

    this.clearPingInterval();
    this.clearReconnectionTimer();
    
    const currentRideId = this.socket.data?.currentRideId;
    if (currentRideId) {
      this.removeRideListeners(currentRideId);
    }

    this.socket.removeAllListeners();
    this.socket.close();
    this.socket = null;
  }

  private clearReconnectionTimer() {
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
      this.reconnectionTimer = null;
    }
  }

  private lastPongTime: number = Date.now();

  private startPingInterval() {
    this.clearPingInterval();
    
    this.lastPongTime = Date.now();
    this.pingInterval = setInterval(() => {
      if (!this.socket?.connected) {
        this.clearPingInterval();
        return;
      }

      // Check if we haven't received a pong in too long
      const pongAge = Date.now() - this.lastPongTime;
      if (pongAge > 30000) { // 30 seconds
        console.warn('No pong received in 30 seconds, reconnecting...');
        this.reconnect();
        return;
      }

      this.socket.emit('ping');
    }, 15000); // Ping every 15 seconds
  }

  private clearPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  async reconnect() {
    this.cleanupSocket();
    await this.connect();
  }

  // Add diagnostic method
  getDiagnosticInfo() {
    return {
      connectionStatus: this.connectionStatus,
      reconnectionAttempts: this.reconnectionAttempts,
      lastError: this.lastError?.message,
      socketId: this.socket?.id,
      transport: this.socket?.io?.engine?.transport?.name,
      ping: this.lastPongTime ? Date.now() - this.lastPongTime : null
    };
  }

  // Global message handling
  onAnyMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
  }

  offAnyMessage(handler: MessageHandler) {
    this.messageHandlers.delete(handler);
  }

  // Chat events
  onNewMessage(callback: (message: ChatMessage) => void) {
    this.socket?.on('new_message', callback);
  }

  onChatEnded(callback: () => void) {
    this.socket?.on('chat_ended', callback);
  }

  onRiderArrived(callback: (data: { location: string }) => void) {
    this.socket?.on('rider_arrived', callback);
  }

  onRideCompleted(callback: (data: { duration: number, fare: number }) => void) {
    this.socket?.on('ride_completed', callback);
  }

  // Enhanced message sending with retry
  async sendMessage(rideId: string, content: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.error('Socket not connected. Attempting to reconnect...');
        this.connect();
        resolve(false);
        return;
      }

      let attempts = 0;
      const maxAttempts = 3;
      const tryEmit = () => {
        attempts++;
        this.socket?.emit('send_message', { rideId, content }, (response: { success: boolean }) => {
          if (response.success) {
            resolve(true);
          } else if (attempts < maxAttempts) {
            setTimeout(tryEmit, 1000); // Retry after 1 second
          } else {
            resolve(false);
          }
        });
      };

      tryEmit();
      setTimeout(() => resolve(false), 5000); // Global timeout after 5 seconds
    });
  }

  endChat(rideId: string) {
    if (this.socket?.connected) {
      this.socket.emit('end_chat', { rideId });
    }
  }

  markRiderArrived(rideId: string, location: 'pickup' | 'destination') {
    if (this.socket?.connected) {
      this.socket.emit('rider_arrived', { rideId, location });
    }
  }

  markRideCompleted(rideId: string) {
    if (this.socket?.connected) {
      this.socket.emit('ride_completed', { rideId });
    }
  }

  // Room management
  joinChatRoom(rideId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_chat', { rideId });
    }
  }

  leaveChatRoom(rideId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_chat', { rideId });
    }
  }

  // Cleanup listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Connection status
  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' {
    return this.connectionStatus;
  }

  isConnected(): boolean {
    return this.connectionStatus === 'connected';
  }

  isConnecting(): boolean {
    return this.connectionStatus === 'connecting';
  }

  // Get current socket ID
  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  // Join a ride room (alias for joinRider for backward compatibility)
  async joinRideRoom(rideId: string, userId: string): Promise<RiderJoinResponse> {
    return this.joinRider(rideId, userId);
  }

  // Join a specific ride as a rider
  async joinRider(rideId: string, userId: string): Promise<RiderJoinResponse> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.error('Socket not connected. Attempting to reconnect...');
        this.connect();
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      console.log(`Attempting to join ride room: ${rideId} for user: ${userId}`);

      this.socket.emit('join_ride', { rideId, userId }, (response: RiderJoinResponse) => {
        if (response.success) {
          // Set up ride-specific event listeners
          this.setupRideListeners(rideId);
          console.log(`Successfully joined ride: ${rideId}`);
        } else {
          console.error(`Failed to join ride: ${rideId}`, response.error);
        }
        resolve(response);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        resolve({ success: false, error: 'Request timed out' });
      }, 5000);
    });
  }

  // Leave a ride room (alias for leaveRider for backward compatibility)
  leaveRideRoom(rideId: string, userId: string) {
    return this.leaveRider(rideId, userId);
  }

  // Leave a specific ride
  leaveRider(rideId: string, userId: string) {
    if (this.socket?.connected) {
      console.log(`Leaving ride room: ${rideId} for user: ${userId}`);
      this.socket.emit('leave_ride', { rideId, userId });
      this.removeRideListeners(rideId);
    }
  }

  private setupRideListeners(rideId: string) {
    if (!this.socket) return;

    // Driver location updates
    this.socket.on(`driver_location_${rideId}`, (data: { lat: number; lon: number }) => {
      this.messageHandlers.forEach(handler => 
        handler({ event: 'driver_location_update', data: { ...data, rideId } })
      );
    });

    // Ride status updates
    this.socket.on(`ride_status_${rideId}`, (data: { status: string; message?: string }) => {
      this.messageHandlers.forEach(handler => 
        handler({ event: 'ride_status_update', data: { ...data, rideId } })
      );
    });

    // ETA updates
    this.socket.on(`eta_update_${rideId}`, (data: { minutes: number; distance: number }) => {
      this.messageHandlers.forEach(handler => 
        handler({ event: 'eta_update', data: { ...data, rideId } })
      );
    });

    // Driver details
    this.socket.on(`driver_details_${rideId}`, (data: { 
      name: string;
      vehicleDetails: {
        model: string;
        color: string;
        plateNumber: string;
      };
      rating: number;
    }) => {
      this.messageHandlers.forEach(handler => 
        handler({ event: 'driver_details', data: { ...data, rideId } })
      );
    });

    // Ride cancellation
    this.socket.on(`ride_cancelled_${rideId}`, (data: { reason: string }) => {
      this.messageHandlers.forEach(handler => 
        handler({ event: 'ride_cancelled', data: { ...data, rideId } })
      );
      this.removeRideListeners(rideId);
    });
  }

  private removeRideListeners(rideId: string) {
    if (!this.socket) return;

    const events = [
      `driver_location_${rideId}`,
      `ride_status_${rideId}`,
      `eta_update_${rideId}`,
      `driver_details_${rideId}`,
      `ride_cancelled_${rideId}`,
    ];

    events.forEach(event => {
      this.socket?.off(event);
    });
  }

  // Bid event listeners
  onBidUpdated(handler: BidEventHandler) {
    this.handleMethodCall('onBidUpdated');
    this.bidHandlers.bidUpdated.add(handler);
  }

  onBidAccepted(handler: BidEventHandler) {
    this.handleMethodCall('onBidAccepted');
    this.bidHandlers.bidAccepted.add(handler);
  }

  onBidExpired(handler: BidEventHandler) {
    this.handleMethodCall('onBidExpired');
    this.bidHandlers.bidExpired.add(handler);
  }

  // Remove bid event listeners
  offBidUpdated(handler: BidEventHandler) {
    this.bidHandlers.bidUpdated.delete(handler);
  }

  offBidAccepted(handler: BidEventHandler) {
    this.bidHandlers.bidAccepted.delete(handler);
  }

  offBidExpired(handler: BidEventHandler) {
    this.bidHandlers.bidExpired.delete(handler);
  }

  // Submit a new bid (for drivers)
  async submitBid(rideId: string, amount: number, estimatedTime: number): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.error('Socket not connected. Cannot submit bid.');
        resolve(false);
        return;
      }

      this.socket.emit('submit_bid', { rideId, amount, estimatedTime }, (response: { success: boolean }) => {
        resolve(response.success);
      });

      setTimeout(() => resolve(false), 5000);
    });
  }

  // Accept a bid (for riders)
  async acceptBid(bidId: string, rideId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.error('Socket not connected. Cannot accept bid.');
        resolve(false);
        return;
      }

      this.socket.emit('accept_bid', { bidId, rideId }, (response: { success: boolean }) => {
        resolve(response.success);
      });

      setTimeout(() => resolve(false), 5000);
    });
  }

  // Ride event listeners
  onRideStarted(handler: RideEventHandler) {
    this.handleMethodCall('onRideStarted');
    this.rideHandlers.rideStarted.add(handler);
  }

  onRideCompleted(handler: RideEventHandler) {
    this.handleMethodCall('onRideCompleted');
    this.rideHandlers.rideCompleted.add(handler);
  }

  onRideStatusUpdated(handler: RideEventHandler) {
    this.handleMethodCall('onRideStatusUpdated');
    this.rideHandlers.rideStatusUpdated.add(handler);
  }

  // Remove ride event listeners
  offRideStarted(handler: RideEventHandler) {
    this.rideHandlers.rideStarted.delete(handler);
  }

  offRideCompleted(handler: RideEventHandler) {
    this.rideHandlers.rideCompleted.delete(handler);
  }

  offRideStatusUpdated(handler: RideEventHandler) {
    this.rideHandlers.rideStatusUpdated.delete(handler);
  }

  // Ride actions
  async acceptRide(rideId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.error('Socket not connected. Cannot accept ride.');
        resolve(false);
        return;
      }

      this.socket.emit('accept_ride', { rideId }, (response: { success: boolean }) => {
        resolve(response.success);
      });

      setTimeout(() => resolve(false), 5000);
    });
  }

  async startRide(rideId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.error('Socket not connected. Cannot start ride.');
        resolve(false);
        return;
      }

      this.socket.emit('start_ride', { rideId }, (response: { success: boolean }) => {
        resolve(response.success);
      });

      setTimeout(() => resolve(false), 5000);
    });
  }

  async completeRide(rideId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.error('Socket not connected. Cannot complete ride.');
        resolve(false);
        return;
      }

      this.socket.emit('complete_ride', { rideId }, (response: { success: boolean }) => {
        resolve(response.success);
      });

      setTimeout(() => resolve(false), 5000);
    });
  }

  async cancelRide(rideId: string, reason: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.error('Socket not connected. Cannot cancel ride.');
        resolve(false);
        return;
      }

      this.socket.emit('cancel_ride', { rideId, reason }, (response: { success: boolean }) => {
        resolve(response.success);
      });

      setTimeout(() => resolve(false), 5000);
    });
  }

  // Location event listeners
  onDriverLocationUpdate(handler: LocationEventHandler) {
    this.handleMethodCall('onDriverLocationUpdate');
    this.locationHandlers.driverLocationUpdate.add(handler);
  }

  // Remove location event listeners
  offDriverLocationUpdate(handler: LocationEventHandler) {
    this.locationHandlers.driverLocationUpdate.delete(handler);
  }

  // Send location updates
  async updateLocation(rideId: string, location: Omit<Location, 'timestamp'>): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.error('Socket not connected. Cannot update location.');
        resolve(false);
        return;
      }

      const locationUpdate = {
        ...location,
        timestamp: Date.now(),
      };

      this.socket.emit('update_location', { rideId, location: locationUpdate }, (response: { success: boolean }) => {
        resolve(response.success);
      });

      setTimeout(() => resolve(false), 5000);
    });
  }

  // Start location tracking
  async startLocationTracking(rideId: string, interval: number = 10000): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.error('Socket not connected. Cannot start location tracking.');
        resolve(false);
        return;
      }

      this.socket.emit('start_location_tracking', { rideId, interval }, (response: { success: boolean }) => {
        resolve(response.success);
      });

      setTimeout(() => resolve(false), 5000);
    });
  }

  // Stop location tracking
  async stopLocationTracking(rideId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.error('Socket not connected. Cannot stop location tracking.');
        resolve(false);
        return;
      }

      this.socket.emit('stop_location_tracking', { rideId }, (response: { success: boolean }) => {
        resolve(response.success);
      });

      setTimeout(() => resolve(false), 5000);
    });
  }

  // Add method validation
  private validateMethod(methodName: string): boolean {
    const methods = new Set([
      'onRideStatusUpdated',
      'onRideAccepted',
      'onRideStarted',
      'onRideCompleted',
      'onRideCancelled',
      'onNewBid',
      'onBidUpdated',
      'onBidAccepted',
      'onBidExpired',
      'onRiderLocationUpdate',
      'onDriverLocationUpdate'
    ]);
    return methods.has(methodName);
  }

  private handleMethodCall(methodName: string, ...args: any[]): void {
    if (!this.validateMethod(methodName)) {
      console.error(`Method ${methodName} is not available in SocketService`);
      throw new Error(`Invalid method: ${methodName}`);
    }

    if (!this.socket?.connected) {
      console.warn(`Socket not connected while calling ${methodName}. Attempting to reconnect...`);
      this.connect();
    }
  }

  // Add connection state check method
  async ensureConnected(): Promise<boolean> {
    if (this.socket?.connected) {
      return true;
    }

    try {
      await this.connect();
      return this.socket?.connected || false;
    } catch (error) {
      console.error('Failed to ensure connection:', error);
      return false;
    }
  }

  // Add disconnect method back
  disconnect() {
    console.log('Disconnecting socket service...');
    
    if (this.serverHealthCheckTimer) {
      clearInterval(this.serverHealthCheckTimer);
      this.serverHealthCheckTimer = null;
    }

    // Clear all pending operations
    if (this.connectionPromise) {
      console.log('Cancelling pending connection');
      this.connectionPromise = null;
    }

    // Clear the event queue
    if (this.eventQueue.length > 0) {
      console.log(`Clearing ${this.eventQueue.length} queued events`);
      this.eventQueue = [];
    }

    // Reset connection state
    this.isConnecting = false;
    this.connectionStatus = 'disconnected';
    this.reconnectionAttempts = 0;

    // Clean up socket
    this.cleanupSocket();

    // Clear all handlers
    this.clearAllHandlers();

    console.log('Socket service disconnected');
  }

  private clearAllHandlers() {
    // Clear message handlers
    this.messageHandlers.clear();
    
    // Clear bid handlers
    Object.values(this.bidHandlers).forEach(handlerSet => handlerSet.clear());
    
    // Clear ride handlers
    Object.values(this.rideHandlers).forEach(handlerSet => handlerSet.clear());
    
    // Clear location handlers
    Object.values(this.locationHandlers).forEach(handlerSet => handlerSet.clear());
  }

  private cleanupSocket() {
    if (!this.socket) return;

    // Clear intervals and timers
    this.clearPingInterval();
    this.clearReconnectionTimer();
    
    // Remove all ride-specific listeners
    const currentRideId = this.socket.data?.currentRideId;
    if (currentRideId) {
      this.removeRideListeners(currentRideId);
    }

    try {
      // Remove all socket listeners
      this.socket.removeAllListeners();
      
      // Close the socket connection
      this.socket.close();
      
      // Explicitly disconnect
      if (this.socket.connected) {
        this.socket.disconnect();
      }
    } catch (error) {
      console.error('Error during socket cleanup:', error);
    } finally {
      this.socket = null;
    }
  }

  // Add server health check
  private async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`http://${IP_Address}:8002/health`);
      return response.ok;
    } catch (error) {
      console.log('Server health check failed:', error.message);
      return false;
    }
  }

  private startServerHealthCheck() {
    if (this.serverHealthCheckTimer) {
      clearInterval(this.serverHealthCheckTimer);
    }

    this.serverHealthCheckTimer = setInterval(async () => {
      if (!this.socket?.connected && !this.isConnecting) {
        const isHealthy = await this.checkServerHealth();
        if (isHealthy) {
          console.log('Server is healthy, attempting reconnection...');
          this.reconnectionAttempts = 0; // Reset attempts if server is healthy
          this.connect().catch(error => {
            console.error('Reconnection failed after health check:', error);
          });
        }
      }
    }, 30000); // Check every 30 seconds
  }
}

export default SocketService.getInstance(); 