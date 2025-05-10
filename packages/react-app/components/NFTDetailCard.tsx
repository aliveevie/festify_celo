import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { truncateAddress } from '@/utils/addressUtils';

interface NFTDetailCardProps {
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

const NFTDetailCard: React.FC<NFTDetailCardProps> = ({
  tokenId,
  tokenURI,
  festival,
  sender,
  recipient,
  metadata,
}) => {
  if (!metadata) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Token #{tokenId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Metadata not available</p>
        </CardContent>
      </Card>
    );
  }

  // Format date for better display
  const createdAttr = metadata.attributes.find(attr => attr.trait_type === 'Created');
  const formattedDate = createdAttr 
    ? new Date(createdAttr.value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown date';

  // Convert IPFS URL to HTTP URL for display
  const imageUrl = metadata.image.startsWith('ipfs://')
    ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
    : metadata.image;

  return (
    <Card className="w-full overflow-hidden">
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={metadata.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <CardHeader>
        <CardTitle>{metadata.name}</CardTitle>
        <p className="text-sm text-muted-foreground">Token ID: {tokenId}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium">Message</h3>
          <p className="mt-1 text-sm italic">&ldquo;{metadata.description}&rdquo;</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Festival:</div>
            <div className="font-medium">{festival}</div>
            
            <div className="text-muted-foreground">From:</div>
            <div className="font-medium">{truncateAddress(sender)}</div>
            
            <div className="text-muted-foreground">To:</div>
            <div className="font-medium">{truncateAddress(recipient)}</div>
            
            <div className="text-muted-foreground">Created:</div>
            <div className="font-medium">{formattedDate}</div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium">Token URI</h3>
          <p className="mt-1 break-all text-xs text-muted-foreground">{tokenURI}</p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <a
          href={`https://alfajores.celoscan.io/token/${tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          View on Explorer
        </a>
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          View Original Image
        </a>
      </CardFooter>
    </Card>
  );
};

export default NFTDetailCard;
