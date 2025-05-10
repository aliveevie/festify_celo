"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFestify } from '@/contexts/useFestify';
import NFTDetailCard from '@/components/NFTDetailCard';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';

export default function NFTDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tokenId = params?.id as string;
  
  const { address, getUserAddress, sentGreetings, receivedGreetings, fetchGreetingCards } = useFestify();
  const [nftData, setNftData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        if (!address) {
          await getUserAddress();
        }
        
        await fetchGreetingCards();
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setError('Failed to connect to your wallet. Please try again.');
        setIsLoading(false);
      }
    };

    initialize();
  }, [address, getUserAddress, fetchGreetingCards]);

  useEffect(() => {
    // Find the NFT in either sent or received greetings
    if (tokenId && (sentGreetings.length > 0 || receivedGreetings.length > 0)) {
      const nft = 
        sentGreetings.find(greeting => greeting.tokenId === tokenId) || 
        receivedGreetings.find(greeting => greeting.tokenId === tokenId);
      
      if (nft) {
        setNftData(nft);
      } else {
        setError('NFT not found or you do not have access to view it.');
      }
    }
  }, [tokenId, sentGreetings, receivedGreetings]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading NFT details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-500">Error</h1>
        <p className="mb-8 max-w-md text-muted-foreground">{error}</p>
        <Button onClick={() => router.push('/festify')}>
          Return to Festify
        </Button>
      </div>
    );
  }

  if (!nftData) {
    return (
      <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">NFT Not Found</h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          The greeting card you're looking for could not be found or you don't have permission to view it.
        </p>
        <Button onClick={() => router.push('/festify')}>
          Return to Festify
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => router.push('/festify')}
          className="mb-4"
        >
          ← Back to Festify
        </Button>
        <h1 className="text-3xl font-bold">Greeting Card Details</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <NFTDetailCard
          tokenId={nftData.tokenId}
          tokenURI={nftData.tokenURI}
          festival={nftData.festival}
          sender={nftData.sender}
          recipient={nftData.recipient}
          metadata={nftData.metadata}
        />

        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">About This Greeting Card</h2>
            <p className="mb-4 text-muted-foreground">
              This greeting card is a unique NFT (Non-Fungible Token) created on the blockchain.
              It represents a personal message sent for a special occasion.
            </p>
            <p className="text-muted-foreground">
              The card's metadata and image are stored on IPFS using Web3.Storage, ensuring that your messages and images
              will be preserved permanently on the decentralized web.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Share This Greeting</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Share this unique greeting card with others by copying the link below:
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/festify/nft/${tokenId}`}
                className="w-full rounded-md border bg-muted px-3 py-2 text-sm"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/festify/nft/${tokenId}`);
                  alert('Link copied to clipboard!');
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
