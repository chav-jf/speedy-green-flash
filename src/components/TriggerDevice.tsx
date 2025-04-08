
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useReaction } from '@/contexts/ReactionContext';
import { Zap, WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const TriggerDevice: React.FC = () => {
  const { isConnected, connectionStatus, socket, reconnectSocket } = useReaction();
  const [isSending, setIsSending] = useState(false);

  const handleTrigger = () => {
    if (socket && isConnected) {
      setIsSending(true);
      socket.emit('triggerGreenLight');
      toast.success("Green light triggered!");
      
      // Reset the sending state after a short delay
      setTimeout(() => {
        setIsSending(false);
      }, 500);
    } else {
      toast.error("Not connected to server. Cannot trigger green light.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-4">
      {/* Connection status indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2 text-white/70 bg-black/20 p-2 rounded-full">
        {isConnected ? 
          <Wifi className="h-4 w-4" /> : 
          <WifiOff className="h-4 w-4" />
        }
        <span className="text-xs">{connectionStatus}</span>
      </div>
      
      {/* Reconnect button */}
      <Button 
        size="sm"
        onClick={() => {
          reconnectSocket();
          toast.info("Attempting to reconnect...");
        }}
        className="absolute top-4 left-4 flex items-center gap-1 bg-black/20 hover:bg-black/30"
      >
        <RefreshCw className="h-4 w-4" />
        <span className="text-xs">Reconnect</span>
      </Button>
      
      <h1 className="text-2xl font-bold mb-6 text-white">Reaction Timer Trigger</h1>
      
      <Button 
        size="lg"
        onClick={handleTrigger}
        disabled={!isConnected || isSending}
        className={`h-32 w-32 rounded-full text-lg transition-all ${
          isSending 
            ? 'bg-green-500 scale-95'
            : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        <Zap className={`mr-2 h-6 w-6 ${isSending ? 'animate-pulse' : ''}`} />
        {isSending ? 'Sent!' : 'Trigger'}
      </Button>
      
      <p className="mt-8 text-white/70 text-center max-w-sm">
        Press the button to trigger the color change in the reaction timer.
        {!isConnected && (
          <span className="block mt-2 text-red-400">
            Not connected to the server. Please check your connection or click the Reconnect button.
          </span>
        )}
      </p>
    </div>
  );
};

export default TriggerDevice;
