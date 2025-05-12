"use client";

import React, { useEffect, useState } from 'react';
import { useFestify } from '@/contexts/useFestify';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

type GreetingCard = {
  tokenId: string;
  tokenURI: string;
  festival: string;
  sender?: string;
  recipient?: string;
  metadata?: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
};

const GreetingCardGallery: React.FC = () => {
  const { address, sentGreetings, receivedGreetings, fetchGreetingCards, isLoading } = useFestify();
  const [activeTab, setActiveTab] = useState('received');
  
  useEffect(() => {
    if (address) {
      console.log('GreetingCardGallery: Fetching cards for address:', address);
      fetchGreetingCards();
    }
  }, [address, fetchGreetingCards]);
  
  // Debug information
  useEffect(() => {
    console.log('GreetingCardGallery: Sent greetings count:', sentGreetings.length);
    console.log('GreetingCardGallery: Received greetings count:', receivedGreetings.length);
    
    if (sentGreetings.length > 0) {
      console.log('GreetingCardGallery: Sample sent greeting:', sentGreetings[0]);
    }
    
    if (receivedGreetings.length > 0) {
      console.log('GreetingCardGallery: Sample received greeting:', receivedGreetings[0]);
    }
  }, [sentGreetings, receivedGreetings]);
  
  const renderGreetingCard = (card: GreetingCard) => {
    // Extract message from metadata description
    const message = card.metadata?.description || 'No message';
    // Determine if this is a received or sent card
    const isReceived = activeTab === 'received';
    
    // Get sender/recipient info for display
    const fromAddress = card.sender || '';
    const toAddress = card.recipient || '';
    
    // Festival name with first letter capitalized
    const festivalName = card.festival.charAt(0).toUpperCase() + card.festival.slice(1);
    
    return (
      <Card key={card.tokenId} className="w-full md:w-80 m-2 overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardTitle className="text-xl">{card.metadata?.name || `${festivalName} Greeting`}</CardTitle>
          <CardDescription className="text-gray-100">
            {isReceived ? 'Received from' : 'Sent to'}: {shortenAddress(isReceived ? fromAddress : toAddress)}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {card.metadata?.image ? (
            <div className="w-full h-64 overflow-hidden">
              <img 
                src={card.metadata.image} 
                alt={card.metadata.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src = 'https://ipfs.io/ipfs/QmVgAZjazqRrETC9TZzQVNYA25RAEKoMLrEGvNSCxYcEgZ';
                }}
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
          <div className="p-4">
            <div className="bg-gray-100 p-3 rounded-lg mb-3 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-500 mb-1">Message:</h4>
              <p className="text-gray-700">{message}</p>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              <div className="flex justify-between">
                <span>From: {shortenAddress(fromAddress)}</span>
                <span>To: {shortenAddress(toAddress)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Festival: {festivalName}</span>
                <span>Token ID: {card.tokenId}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-gray-50 border-t">
          <Button variant="outline" className="w-full" onClick={() => window.open(`https://testnets.opensea.io/assets/hardhat/${card.tokenId}`, '_blank')}>
            View on OpenSea
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  const shortenAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  if (!address) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Please connect your wallet to view your greeting cards</p>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Greeting Cards</h2>
      
      <Tabs defaultValue="received" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="received">Received ({receivedGreetings.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sentGreetings.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="received">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading your received cards...</span>
            </div>
          ) : receivedGreetings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {receivedGreetings.map((card, index) => (
                <div key={`received-${card.tokenId || index}`}>
                  {renderGreetingCard(card)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">You haven't received any greeting cards yet</p>
              <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">How to Receive Cards</h3>
                <p className="text-gray-600 text-sm mb-2">To receive greeting cards:</p>
                <ol className="list-decimal list-inside text-sm text-gray-600">
                  <li>Someone must mint a card with your wallet address as the recipient</li>
                  <li>The card will automatically appear in your "Received" tab</li>
                  <li>You can view the card details and message here</li>
                </ol>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="sent">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading your sent cards...</span>
            </div>
          ) : sentGreetings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sentGreetings.map((card, index) => (
                <div key={`sent-${card.tokenId || index}`}>
                  {renderGreetingCard(card)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">You haven't sent any greeting cards yet</p>
              <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg mb-4">
                <h3 className="font-medium text-gray-700 mb-2">How to Send Cards</h3>
                <p className="text-gray-600 text-sm mb-2">To send greeting cards:</p>
                <ol className="list-decimal list-inside text-sm text-gray-600">
                  <li>Go to the home page and fill out the greeting card form</li>
                  <li>Enter the recipient's wallet address</li>
                  <li>Write a personal message and select a festival</li>
                  <li>Click "Mint Greeting Card" to send it</li>
                </ol>
              </div>
              <Button className="mt-2" onClick={() => window.location.href = '/'}>
                Create a Greeting Card
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 text-center">
        <Button onClick={() => fetchGreetingCards()}>
          Refresh Cards
        </Button>
      </div>
    </div>
  );
};

export default GreetingCardGallery;
