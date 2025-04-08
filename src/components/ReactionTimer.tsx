
import React from 'react';
import { useReaction } from '@/contexts/ReactionContext';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Wifi, WifiOff, CloudOff, Cloud } from 'lucide-react';

const ReactionTimer: React.FC = () => {
  const { 
    currentState, 
    startTest, 
    recordReaction, 
    lastReactionTime,
    isConnected,
    connectionStatus,
    offlineMode,
    toggleOfflineMode
  } = useReaction();

  const handleScreenTap = () => {
    if (currentState === 'waiting' && lastReactionTime === null) {
      startTest();
    } else if (currentState !== 'waiting') {
      recordReaction();
    }
  };

  const getBackgroundColor = () => {
    switch (currentState) {
      case 'ready':
        return 'bg-[hsl(var(--red-stimulus))]';
      case 'reacting':
        return 'bg-[hsl(var(--green-stimulus))]';
      default:
        return 'bg-[hsl(var(--red-stimulus))]';
    }
  };

  const getInstructions = () => {
    switch (currentState) {
      case 'waiting':
        if (lastReactionTime !== null) {
          return `${lastReactionTime}ms`;
        }
        return 'Tap to start';
      case 'ready':
        return 'Wait for green...';
      case 'reacting':
        return 'Tap now!';
      default:
        return 'Tap to start';
    }
  };

  return (
    <div 
      className={`w-full h-full flex flex-col items-center justify-center ${getBackgroundColor()} transition-colors duration-100`}
      onClick={handleScreenTap}
    >
      {/* Connection status indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2 text-white/70 bg-black/20 p-2 rounded-full">
        {offlineMode ? 
          <CloudOff className="h-4 w-4" /> : 
          (isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />)
        }
        <span className="text-xs">{connectionStatus}</span>
      </div>
      
      {/* Offline mode toggle */}
      <Button
        size="sm"
        variant="ghost" 
        className="absolute top-4 left-16 flex items-center gap-1 text-white/70 bg-black/20 p-2 hover:bg-black/30"
        onClick={(e) => {
          e.stopPropagation();
          toggleOfflineMode();
        }}
      >
        {offlineMode ? 
          <><Cloud className="h-4 w-4" /> <span className="text-xs">Go Online</span></> : 
          <><CloudOff className="h-4 w-4" /> <span className="text-xs">Go Offline</span></>
        }
      </Button>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
        <p className={`font-bold whitespace-pre-line ${lastReactionTime !== null && currentState === 'waiting' ? 'text-5xl' : 'text-xl'}`}>
          {getInstructions()}
        </p>
        
        {lastReactionTime !== null && currentState === 'waiting' && (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              startTest();
            }} 
            className="mt-4 bg-white/20 hover:bg-white/30 text-white"
            size="sm"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Restart
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReactionTimer;
