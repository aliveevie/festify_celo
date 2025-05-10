import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { truncateAddress } from '@/utils/addressUtils';

interface GreetingCardProps {
  tokenId: string;
  festival: string;
  message: string;
  sender: string;
  recipient: string;
  imageUrl: string;
  timestamp: string;
}

const GreetingCard: React.FC<GreetingCardProps> = ({
  tokenId,
  festival,
  message,
  sender,
  recipient,
  imageUrl,
  timestamp,
}) => {
  // Format date for better display
  const formattedDate = new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Capitalize festival name
  const capitalizedFestival = festival.charAt(0).toUpperCase() + festival.slice(1);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={`${capitalizedFestival} Greeting Card`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-2 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white">
          {capitalizedFestival}
        </div>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xl">{capitalizedFestival} Greeting</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Token ID: {tokenId}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <p className="mb-4 text-sm italic">&ldquo;{message}&rdquo;</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">From:</span>
            <span className="font-medium">{truncateAddress(sender)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">To:</span>
            <span className="font-medium">{truncateAddress(recipient)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-4 text-xs text-muted-foreground">
        Created on {formattedDate}
      </CardFooter>
    </Card>
  );
};

export default GreetingCard;
