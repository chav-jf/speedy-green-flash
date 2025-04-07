
import React from 'react';
import TriggerDevice from '@/components/TriggerDevice';
import { ReactionProvider } from '@/contexts/ReactionContext';

const TriggerPage = () => {
  return (
    <ReactionProvider>
      <div className="h-screen w-screen">
        <TriggerDevice />
      </div>
    </ReactionProvider>
  );
};

export default TriggerPage;
