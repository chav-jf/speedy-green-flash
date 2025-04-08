
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

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
}

const ReactionContext = createContext<ReactionContextType | undefined>(undefined);

// This should be replaced with your actual WebSocket server URL
const SOCKET_SERVER_URL = 'http://localhost:3000';

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

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(SOCKET_SERVER_URL);
    
    socketInstance.on('connect', () => {
      setIsConnected(true);
      setConnectionStatus('Connected');
      console.log('Connected to WebSocket server');
    });
    
    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      setConnectionStatus('Disconnected');
      console.log('Disconnected from WebSocket server');
    });
    
    socketInstance.on('connect_error', (error) => {
      setIsConnected(false);
      setConnectionStatus(`Connection error: ${error.message}`);
      console.error('WebSocket connection error:', error);
    });
    
    // Listen for the signal to change to green
    socketInstance.on('changeToGreen', () => {
      if (currentState === 'ready') {
        setCurrentState('reacting');
        setStartTime(Date.now());
      }
    });
    
    setSocket(socketInstance);
    
    return () => {
      socketInstance.disconnect();
    };
  }, []);

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
    
    if (socket) {
      // Inform the server that we're ready for the green light
      socket.emit('readyForGreen');
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
      
      if (socket) {
        // Send the reaction time result to the server
        socket.emit('reactionResult', { reactionTime });
      }
    } else if (currentState === 'ready') {
      // User clicked too early
      setCurrentState('waiting');
      setLastReactionTime(null);
      
      if (socket) {
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
