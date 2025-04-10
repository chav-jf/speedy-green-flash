import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

const ReactionContext = createContext<ReactionContextType | undefined>(undefined);

export const ReactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentState, setCurrentState] = useState<'waiting' | 'ready' | 'reacting'>('waiting');
  const [changeTimer, setChangeTimer] = useState<NodeJS.Timeout | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);
  const [reactionResults, setReactionResults] = useState<ReactionResult[]>([]);
  const [averageReactionTime, setAverageReactionTime] = useState<number | null>(null);
  const [bestReactionTime, setBestReactionTime] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (changeTimer) clearTimeout(changeTimer);
    };
  }, [changeTimer]);

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
    // Clear any existing timers
    if (changeTimer) clearTimeout(changeTimer);
    
    // Immediately change to 'ready' state without the first 1-second delay
    setCurrentState('ready');
      
    // Keep the fixed 1 second delay before showing green
    const timer = setTimeout(() => {
      setCurrentState('reacting');
      setStartTime(Date.now());
    }, 1000); // Fixed 1 second delay
      
    setChangeTimer(timer);
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
    } else if (currentState === 'ready') {
      // User clicked too early
      if (changeTimer) clearTimeout(changeTimer);
      setCurrentState('waiting');
      setLastReactionTime(null);
    }
  };

  const resetTest = () => {
    if (changeTimer) clearTimeout(changeTimer);
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
