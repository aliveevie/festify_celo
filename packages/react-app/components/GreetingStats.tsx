import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GreetingCard from './GreetingCard';

interface GreetingStatsProps {
  sentGreetings: any[];
  receivedGreetings: any[];
}

const GreetingStats: React.FC<GreetingStatsProps> = ({ sentGreetings, receivedGreetings }) => {
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Your Festify Greetings</CardTitle>
          <CardDescription>
            View all your sent and received festival greeting cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sent" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sent">
                Sent ({sentGreetings.length})
              </TabsTrigger>
              <TabsTrigger value="received">
                Received ({receivedGreetings.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sent" className="mt-4">
              {sentGreetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  You haven't sent any greeting cards yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sentGreetings.map((greeting) => (
                    <GreetingCard
                      key={greeting.tokenId}
                      tokenId={greeting.tokenId}
                      festival={greeting.festival}
                      message={greeting.metadata?.description || 'No message'}
                      sender={greeting.metadata?.attributes?.[1]?.value || ''}
                      recipient={greeting.recipient}
                      imageUrl={greeting.metadata?.image || ''}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="received" className="mt-4">
              {receivedGreetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  You haven't received any greeting cards yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {receivedGreetings.map((greeting) => (
                    <GreetingCard
                      key={greeting.tokenId}
                      tokenId={greeting.tokenId}
                      festival={greeting.festival}
                      message={greeting.metadata?.description || 'No message'}
                      sender={greeting.sender}
                      recipient={greeting.metadata?.attributes?.[2]?.value || ''}
                      imageUrl={greeting.metadata?.image || ''}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GreetingStats;
