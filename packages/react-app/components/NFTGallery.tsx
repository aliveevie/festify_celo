"use client";

import React, { useState } from 'react';
import { useFestifyContext } from '@/providers/FestifyProvider';
import NFTDetails from './NFTDetails';

interface NFTGalleryProps {
  type: 'sent' | 'received';
}

const NFTGallery: React.FC<NFTGalleryProps> = ({ type }) => {
  const { sentGreetings, receivedGreetings, isLoading, fetchGreetingCards } = useFestifyContext();
  const [refreshing, setRefreshing] = useState(false);
  
  const greetings = type === 'sent' ? sentGreetings : receivedGreetings;
  const title = type === 'sent' ? 'Sent Greetings' : 'Received Greetings';
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchGreetingCards();
    } finally {
      setRefreshing(false);
    }
  };
  
  if (isLoading || refreshing) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading {title.toLowerCase()}...</p>
      </div>
    );
  }
  
  if (greetings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">No {title.toLowerCase()} found.</p>
        <button 
          onClick={handleRefresh}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <button 
          onClick={handleRefresh}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="space-y-4">
        {greetings.map((greeting) => (
          <NFTDetails
            key={greeting.tokenId}
            tokenId={greeting.tokenId}
            tokenURI={greeting.tokenURI}
            festival={greeting.festival}
            recipient={type === 'sent' ? greeting.recipient : undefined}
            sender={type === 'received' ? greeting.sender : undefined}
            metadata={greeting.metadata}
          />
        ))}
      </div>
    </div>
  );
};

export default NFTGallery; 