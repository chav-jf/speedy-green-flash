
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactionTimer from '@/components/ReactionTimer';
import Results from '@/components/Results';
import { ReactionProvider } from '@/contexts/ReactionContext';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

const Index = () => {
  const [showResults, setShowResults] = useState(false);

  return (
    <ReactionProvider>
      <div className="h-screen w-screen relative overflow-hidden">
        <ReactionTimer />
        
        {/* Trigger device link */}
        <Link 
          to="/trigger" 
          className="absolute top-4 left-4 flex items-center gap-1 text-white/70 bg-black/20 p-2 rounded-full hover:bg-black/30 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="text-xs">Trigger Device</span>
        </Link>
        
        {/* Results drawer */}
        <div 
          className={`absolute bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out ${
            showResults ? 'translate-y-0' : 'translate-y-[calc(100%-40px)]'
          }`}
        >
          <Button 
            variant="ghost" 
            className="w-full rounded-none bg-background/90 backdrop-blur h-10 flex items-center justify-center"
            onClick={() => setShowResults(!showResults)}
          >
            {showResults ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            <span className="ml-2">Results</span>
          </Button>
          <Results />
        </div>
      </div>
    </ReactionProvider>
  );
};

export default Index;
