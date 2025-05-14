"use client";

import React, { useState, useEffect } from 'react';
import MetaMaskHelper from './MetaMaskHelper';
import { useFestifyContext } from '@/providers/FestifyProvider';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { isIpfsUrl, ipfsToHttpUrl } from '../utils/ipfsUtils';

interface NFTDetailsProps {
  tokenId: string;
  tokenURI: string;
  festival: string;
  recipient?: string;
  sender?: string;
  metadata?: any;
}

const NFTDetails: React.FC<NFTDetailsProps> = ({ 
  tokenId, 
  tokenURI, 
  festival, 
  recipient, 
  sender, 
  metadata 
}) => {
  const [showMetaMaskHelper, setShowMetaMaskHelper] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { currentChainId } = useFestifyContext();
  const contractAddress = CONTRACT_ADDRESSES[currentChainId] || '';
  
  let imageUrl = metadata?.image || '';
  const name = metadata?.name || `${festival.charAt(0).toUpperCase() + festival.slice(1)} Greeting`;
  const description = metadata?.description || '';
  
  // Ensure image URL is properly formatted
  useEffect(() => {
    if (isIpfsUrl(imageUrl)) {
      imageUrl = ipfsToHttpUrl(imageUrl);
    }
  }, [imageUrl]);
  
  // Function to render the image based on its type
  const renderImage = () => {
    if (!imageUrl) {
      return (
        <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg">
          <p className="text-gray-500">No image available</p>
        </div>
      );
    }
    
    if (imageError) {
      return (
        <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg">
          <p className="text-gray-500">Image failed to load</p>
        </div>
      );
    }
    
    if (imageUrl.startsWith('data:image/svg')) {
      try {
        // Extract SVG content from data URI
        const svgContent = atob(imageUrl.split(',')[1]);
        return <div dangerouslySetInnerHTML={{ __html: svgContent }} />;
      } catch (e) {
        console.error("Error rendering SVG:", e);
        return (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-auto rounded-lg"
            onError={() => setImageError(true)}
          />
        );
      }
    }
    
    return (
      <img 
        src={imageUrl} 
        alt={name} 
        className="w-full h-auto rounded-lg"
        onError={() => setImageError(true)}
      />
    );
  };
  
  // Get the correct explorer URL based on the chain
  const getExplorerUrl = () => {
    const explorers = {
      31337: `http://localhost:8545/token/${contractAddress}?a=${tokenId}`,
      44787: `https://alfajores.celoscan.io/token/${contractAddress}?a=${tokenId}`,
      42220: `https://celoscan.io/token/${contractAddress}?a=${tokenId}`,
      10: `https://optimistic.etherscan.io/token/${contractAddress}?a=${tokenId}`,
      420: `https://goerli-optimism.etherscan.io/token/${contractAddress}?a=${tokenId}`,
    };
    
    return explorers[currentChainId] || `https://celoscan.io/token/${contractAddress}?a=${tokenId}`;
  };
  
  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 mb-4 md:mb-0 md:pr-4">
          <div className="rounded-lg overflow-hidden border">
            {renderImage()}
          </div>
        </div>
        
        <div className="w-full md:w-2/3">
          <h3 className="text-xl font-bold mb-2">{name}</h3>
          <p className="text-gray-700 mb-4">{description}</p>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div>
              <p className="text-sm text-gray-500">Token ID</p>
              <p className="font-medium">{tokenId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Festival</p>
              <p className="font-medium capitalize">{festival}</p>
            </div>
            {sender && (
              <div>
                <p className="text-sm text-gray-500">Sender</p>
                <p className="font-medium text-xs break-all">{sender}</p>
              </div>
            )}
            {recipient && (
              <div>
                <p className="text-sm text-gray-500">Recipient</p>
                <p className="font-medium text-xs break-all">{recipient}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowMetaMaskHelper(!showMetaMaskHelper)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
            >
              {showMetaMaskHelper ? 'Hide MetaMask Help' : 'Add to MetaMask'}
            </button>
            
            <a
              href={getExplorerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
            >
              View on Explorer
            </a>
          </div>
        </div>
      </div>
      
      {showMetaMaskHelper && (
        <MetaMaskHelper 
          tokenId={tokenId} 
          contractAddress={contractAddress}
        />
      )}
    </div>
  );
};

export default NFTDetails; 