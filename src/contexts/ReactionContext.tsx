
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export interface ReactionResult {
  timestamp: number;
  reactionTime: number;
}

interface ReactionContextType {
  currentState: 'waiting' | 'ready' | 'reacting';
  reactionResults: ReactionResult[];
  startTest: () => void;
  recordReaction: () => void;
  lastReactionTime: number | null;
  resetTest: () => void;
  averageReactionTime: number | null;
  bestReactionTime: number | null;
  isConnected: boolean;
  connectionStatus: string;
  socket: Socket | null;
  reconnectSocket: () => void;
}

const ReactionContext = createContext<ReactionContextType | undefined>(undefined);

// Get WebSocket URL from environment or fallback to safe defaults
const getSocketServerUrl = () => {
  // If we're running on a custom domain, use that domain with the WebSocket port
  const currentDomain = window.location.hostname;
  
  if (currentDomain === 'localhost') {
    return 'http://localhost:3000';
  } else {
    // For production deployment - use the same domain but on port 3000
    return `https://${currentDomain}:3000`;
  }
};

// Initialize with the dynamically determined URL
const SOCKET_SERVER_URL = getSocketServerUrl();

export const ReactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentState, setCurrentState] = useState<'waiting' | 'ready' | 'reacting'>('waiting');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);
  const [reactionResults, setReactionResults] = useState<ReactionResult[]>([]);
  const [averageReactionTime, setAverageReactionTime] = useState<number | null>(null);
  const [bestReactionTime, setBestReactionTime] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [connectionAttempts, setConnectionAttempts] = useState<number>(0);

  // Initialize socket connection with better error handling
  const initializeSocket = () => {
    try {
      const socketOptions = {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        transports: ['websocket', 'polling'] // Try WebSocket first, then fall back to polling
      };
      
      console.log('Connecting to WebSocket server at:', SOCKET_SERVER_URL);
      const socketInstance = io(SOCKET_SERVER_URL, socketOptions);
      
      socketInstance.on('connect', () => {
        setIsConnected(true);
        setConnectionStatus('Connected');
        console.log('Connected to WebSocket server');
        toast.success('Connected to reaction timer server');
      });
      
      socketInstance.on('disconnect', () => {
        setIsConnected(false);
        setConnectionStatus('Disconnected');
        console.log('Disconnected from WebSocket server');
        toast.error('Disconnected from server');
      });
      
      socketInstance.on('connect_error', (error) => {
        setIsConnected(false);
        setConnectionStatus(`Connection error: ${error.message}`);
        console.error('WebSocket connection error:', error);
        
        // Only show toast on first few attempts to avoid spam
        if (connectionAttempts < 2) {
          toast.error(`Connection error: ${error.message}. Try using the offline mode.`);
        }
        setConnectionAttempts(prev => prev + 1);
      });
      
      socketInstance.on('changeToGreen', () => {
        if (currentState === 'ready') {
          setCurrentState('reacting');
          setStartTime(Date.now());
        }
      });
      
      setSocket(socketInstance);
      return socketInstance;
    } catch (error) {
      console.error('Error initializing socket:', error);
      setConnectionStatus(`Socket initialization error`);
      return null;
    }
  };

  // Connect to socket on component mount
  useEffect(() => {
    const socketInstance = initializeSocket();
    
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  // Reconnect socket manually
  const reconnectSocket = () => {
    if (socket) {
      socket.disconnect();
    }
    setConnectionAttempts(0);
    const newSocket = initializeSocket();
    setSocket(newSocket);
  };

  // Update average and best times when results change
  useEffect(() => {
    if (reactionResults.length > 0) {
      // Calculate average
      const totalTime = reactionResults.reduce((sum, result) => sum + result.reactionTime, 0);
      setAverageReactionTime(totalTime / reactionResults.length);
      
      // Find best time
      const best = Math.min(...reactionResults.map(r => r.reactionTime));
      setBestReactionTime(best);
    } else {
      setAverageReactionTime(null);
      setBestReactionTime(null);
    }
  }, [reactionResults]);

  const startTest = () => {
    setLastReactionTime(null);
    setCurrentState('ready');
    
    if (socket && socket.connected) {
      // Inform the server that we're ready for the green light
      socket.emit('readyForGreen');
    } else {
      // Fallback for offline mode: change to green after random delay
      const randomDelay = 2000 + Math.random() * 3000;
      setTimeout(() => {
        if (currentState === 'ready') {
          setCurrentState('reacting');
          setStartTime(Date.now());
        }
      }, randomDelay);
    }
  };

  const recordReaction = () => {
    if (currentState === 'reacting' && startTime) {
      const now = Date.now();
      const reactionTime = now - startTime;
      
      const newResult = {
        timestamp: now,
        reactionTime
      };
      
      setLastReactionTime(reactionTime);
      setReactionResults(prev => [...prev, newResult]);
      setCurrentState('waiting');
      setStartTime(null);
      
      if (socket && socket.connected) {
        // Send the reaction time result to the server
        socket.emit('reactionResult', { reactionTime });
      }
    } else if (currentState === 'ready') {
      // User clicked too early
      setCurrentState('waiting');
      setLastReactionTime(null);
      
      if (socket && socket.connected) {
        // Inform the server that the user clicked too early
        socket.emit('earlyClick');
      }
    }
  };

  const resetTest = () => {
    setReactionResults([]);
    setLastReactionTime(null);
    setCurrentState('waiting');
    setAverageReactionTime(null);
    setBestReactionTime(null);
  };

  return (
    <ReactionContext.Provider
      value={{
        currentState,
        reactionResults,
        startTest,
        recordReaction,
        lastReactionTime,
        resetTest,
        averageReactionTime,
        bestReactionTime,
        isConnected,
        connectionStatus,
        socket,
        reconnectSocket,
      }}
    >
      {children}
    </ReactionContext.Provider>
  );
};

export const useReaction = (): ReactionContextType => {
  const context = useContext(ReactionContext);
  if (context === undefined) {
    throw new Error('useReaction must be used within a ReactionProvider');
  }
  return context;
};
