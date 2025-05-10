"use client";

import React, { useEffect, useState } from 'react';
import { useFestify } from '@/contexts/useFestify';
import MintGreetingForm from '@/components/MintGreetingForm';
import GreetingCardGrid from '@/components/GreetingCardGrid';
import GreetingStats from '@/components/GreetingStats';
import WelcomeBanner from '@/components/WelcomeBanner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Spinner from '@/components/ui/spinner';
import { truncateAddress } from '@/utils/addressUtils';

export default function FestifyPage() {
  const {
    address,
    isLoading,
    sentGreetings,
    receivedGreetings,
    getUserAddress,
    mintGreetingCard,
    fetchGreetingCards,
  } = useFestify();

  const [activeTab, setActiveTab] = useState('mint');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        await getUserAddress();
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setIsInitializing(false);
      }
    };

    initialize();
  }, [getUserAddress]);

  useEffect(() => {
    if (address) {
      fetchGreetingCards();
    }
  }, [address, fetchGreetingCards]);

  const handleMint = async (
    recipient: string,
    message: string,
    festival: string,
    sender: string,
    imageUrl?: string
  ) => {
    try {
      await mintGreetingCard(recipient, message, festival, sender, imageUrl);
      setActiveTab('sent'); // Switch to sent tab after successful mint
    } catch (error) {
      console.error('Error minting greeting card:', error);
      throw error;
    }
  };

  if (isInitializing) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Initializing Festify...</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <WelcomeBanner onGetStarted={getUserAddress} />
        
        <div className="mt-12 space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center rounded-lg border p-6 text-center">
              <div className="mb-4 rounded-full bg-purple-100 p-3">
                <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Create</h3>
              <p className="text-muted-foreground">
                Design personalized greeting cards for various festivals and special occasions.
              </p>
            </div>
            
            <div className="flex flex-col items-center rounded-lg border p-6 text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-3">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Send</h3>
              <p className="text-muted-foreground">
                Send your greeting cards to anyone with a blockchain wallet address.
              </p>
            </div>
            
            <div className="flex flex-col items-center rounded-lg border p-6 text-center">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Collect</h3>
              <p className="text-muted-foreground">
                Build a collection of unique greeting cards stored permanently on the blockchain.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={getUserAddress} size="lg" className="px-8 py-6 text-lg">
              Connect Wallet to Start
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate festival counts for stats
  const calculateFestivalCounts = () => {
    const counts: Record<string, number> = {};
    
    // Count festivals from sent greetings
    sentGreetings.forEach(greeting => {
      const festival = greeting.festival as string;
      counts[festival] = (counts[festival] || 0) + 1;
    });
    
    // Count festivals from received greetings
    receivedGreetings.forEach(greeting => {
      const festival = greeting.festival as string;
      counts[festival] = (counts[festival] || 0) + 1;
    });
    
    return counts;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Festify</h1>
        <p className="text-xl text-muted-foreground">
          Create and share festival greeting cards as NFTs
        </p>
        <div className="mt-2 text-sm">
          Connected: <span className="font-medium">{truncateAddress(address)}</span>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="mb-8">
        <GreetingStats
          sentCount={sentGreetings.length}
          receivedCount={receivedGreetings.length}
          festivalCounts={calculateFestivalCounts()}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-8 flex justify-center">
          <TabsList>
            <TabsTrigger value="mint">Create Greeting</TabsTrigger>
            <TabsTrigger value="sent">Sent Greetings</TabsTrigger>
            <TabsTrigger value="received">Received Greetings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="mint" className="flex justify-center">
          <MintGreetingForm
            onMint={handleMint}
            isLoading={isLoading}
            senderAddress={address}
          />
        </TabsContent>

        <TabsContent value="sent">
          <GreetingCardGrid
            greetings={sentGreetings}
            title="Sent Greetings"
            emptyMessage="You haven't sent any greeting cards yet"
          />
        </TabsContent>

        <TabsContent value="received">
          <GreetingCardGrid
            greetings={receivedGreetings}
            title="Received Greetings"
            emptyMessage="You haven't received any greeting cards yet"
          />
        </TabsContent>
      </Tabs>

      <div className="mt-12 rounded-lg bg-muted p-6">
        <h2 className="mb-4 text-xl font-semibold">About Festify</h2>
        <p className="mb-4">
          Festify allows you to create and share personalized festival greeting cards as NFTs on the blockchain.
          Each greeting card is a unique digital asset that can be sent to friends and family to celebrate
          special occasions like Christmas, New Year, Eid, and Sallah.
        </p>
        <p>
          The greeting cards are stored on IPFS using Web3.Storage, ensuring that your messages and images
          will be preserved permanently on the decentralized web.
        </p>
      </div>
    </div>
  );
}
