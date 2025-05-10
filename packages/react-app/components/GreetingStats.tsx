import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GreetingStatsProps {
  sentCount: number;
  receivedCount: number;
  festivalCounts: Record<string, number>;
}

const GreetingStats: React.FC<GreetingStatsProps> = ({
  sentCount,
  receivedCount,
  festivalCounts,
}) => {
  // Calculate total greetings
  const totalCount = sentCount + receivedCount;
  
  // Get the most popular festival
  let mostPopularFestival = 'None';
  let maxCount = 0;
  
  Object.entries(festivalCounts).forEach(([festival, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostPopularFestival = festival.charAt(0).toUpperCase() + festival.slice(1);
    }
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Greetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Sent Greetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sentCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Received Greetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{receivedCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Most Popular Festival
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mostPopularFestival}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GreetingStats;
