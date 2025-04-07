
import React from 'react';
import { useReaction } from '@/contexts/ReactionContext';
import { Button } from '@/components/ui/button';

const ReactionTimer: React.FC = () => {
  const { currentState, startTest, recordReaction, lastReactionTime } = useReaction();

  const handleScreenTap = () => {
    if (currentState === 'waiting') {
      startTest();
    } else {
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
        return lastReactionTime !== null 
          ? `Your reaction time: ${lastReactionTime}ms\nTap to start again`
          : 'Tap to start';
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
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
        <p className="text-xl font-bold whitespace-pre-line">
          {getInstructions()}
        </p>
      </div>
    </div>
  );
};

export default ReactionTimer;
