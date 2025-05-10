import React from 'react';
import GreetingCard from './GreetingCard';

interface GreetingCardData {
  tokenId: string;
  tokenURI: string;
  festival: string;
  sender: string;
  recipient: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: {
      trait_type: string;
      value: string;
    }[];
  } | null;
}

interface GreetingCardGridProps {
  greetings: GreetingCardData[];
  title: string;
  emptyMessage: string;
}

const GreetingCardGrid: React.FC<GreetingCardGridProps> = ({ 
  greetings, 
  title,
  emptyMessage
}) => {
  // Find created date from metadata attributes
  const getCreatedDate = (metadata: GreetingCardData['metadata']) => {
    if (!metadata || !metadata.attributes) return new Date().toISOString();
    
    const createdAttr = metadata.attributes.find(attr => attr.trait_type === 'Created');
    return createdAttr ? createdAttr.value : new Date().toISOString();
  };

  return (
    <div className="w-full">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      
      {greetings.length === 0 ? (
        <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed">
          <p className="text-center text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {greetings.map((greeting) => (
            <GreetingCard
              key={greeting.tokenId}
              tokenId={greeting.tokenId}
              festival={greeting.festival as string}
              message={greeting.metadata?.description || 'No message available'}
              sender={greeting.sender}
              recipient={greeting.recipient}
              imageUrl={greeting.metadata?.image || '/placeholder-image.jpg'}
              timestamp={getCreatedDate(greeting.metadata)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GreetingCardGrid;
