import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FestivalOption {
  id: string;
  name: string;
  description: string;
  image: string;
  bgClass: string;
}

interface FestivalSelectorProps {
  onSelect: (festivalId: string) => void;
}

const FestivalSelector: React.FC<FestivalSelectorProps> = ({ onSelect }) => {
  // Festival options with descriptions and images
  const festivals: FestivalOption[] = [
    {
      id: 'christmas',
      name: 'Christmas',
      description: 'Celebrate the joy and warmth of Christmas with a personalized greeting card.',
      image: 'https://ipfs.io/ipfs/QmNtxfy9Mk8qLsdGnraHGk5XDX4MzpQzNz6KWHBpNquGts',
      bgClass: 'bg-gradient-to-r from-green-700 to-red-700',
    },
    {
      id: 'newyear',
      name: 'New Year',
      description: 'Ring in the new year with wishes of prosperity and happiness.',
      image: 'https://ipfs.io/ipfs/QmYqA8GsxbXeWoJxH2RBuAyFRNqyBJCJb4kByuYBtVCRsf',
      bgClass: 'bg-gradient-to-r from-blue-700 to-purple-700',
    },
    {
      id: 'eid',
      name: 'Eid',
      description: 'Share the blessings and joy of Eid with loved ones near and far.',
      image: 'https://ipfs.io/ipfs/QmTcM5VyR7SLcBZJ8Qrv8KbRfo2CyYZMXfM7Rz3XDmhG3H',
      bgClass: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    },
    {
      id: 'sallah',
      name: 'Sallah',
      description: 'Send warm wishes and blessings for a joyous Sallah celebration.',
      image: 'https://ipfs.io/ipfs/QmXfnZpQy4U4UgcVwDMgVCTQxCVKLXBgX5Ym4xLSk9wGK1',
      bgClass: 'bg-gradient-to-r from-amber-600 to-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Choose a Festival</h2>
        <p className="text-muted-foreground">
          Select the festival for your greeting card
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {festivals.map((festival) => (
          <Card 
            key={festival.id}
            className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
            onClick={() => onSelect(festival.id)}
          >
            <div className={`relative h-32 w-full ${festival.bgClass}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-2xl font-bold text-white">{festival.name}</h3>
              </div>
            </div>
            
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{festival.description}</p>
            </CardContent>
            
            <CardFooter className="border-t p-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(festival.id);
                }}
              >
                Select {festival.name}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FestivalSelector;
