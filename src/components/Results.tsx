
import React from 'react';
import { useReaction } from '@/contexts/ReactionContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

const Results: React.FC = () => {
  const { reactionResults, resetTest, averageReactionTime, bestReactionTime } = useReaction();

  return (
    <div className="bg-background p-4 rounded-t-3xl shadow-lg max-h-[70vh] overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Results</h2>
        <Button variant="outline" size="sm" onClick={resetTest}>
          Reset
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Average</div>
          <div className="text-2xl font-bold">
            {averageReactionTime ? `${Math.round(averageReactionTime)}ms` : '-'}
          </div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Best</div>
          <div className="text-2xl font-bold">
            {bestReactionTime ? `${bestReactionTime}ms` : '-'}
          </div>
        </Card>
      </div>
      
      <h3 className="text-sm font-medium mb-2">History</h3>
      {reactionResults.length > 0 ? (
        <ScrollArea className="h-[30vh]">
          <div className="space-y-2">
            {[...reactionResults].reverse().map((result, index) => (
              <div 
                key={result.timestamp} 
                className="flex justify-between bg-secondary/50 p-2 rounded"
              >
                <span>#{reactionResults.length - index}</span>
                <span className="font-medium">{result.reactionTime}ms</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          No results yet
        </div>
      )}
    </div>
  );
};

export default Results;
