"use client";

import React, { useState } from 'react';
import { useFestifyContext } from '@/providers/FestifyProvider';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

interface MetaMaskHelperProps {
  tokenId: string;
  contractAddress: string;
}

const MetaMaskHelper: React.FC<MetaMaskHelperProps> = ({ tokenId, contractAddress }) => {
  const { currentChain } = useFestifyContext();
  const [isAdding, setIsAdding] = useState(false);
  const [addResult, setAddResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const handleAddToMetaMask = async () => {
    try {
      setIsAdding(true);
      setAddResult(null);
      
      if (typeof window === 'undefined' || !window.ethereum) {
        setAddResult({
          success: false,
          message: 'MetaMask is not installed. Please install MetaMask to use this feature.'
        });
        return;
      }
      
      // Make sure we're on the right network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainIdHex = `0x${currentChain.id.toString(16)}`;
      
      if (chainId !== currentChainIdHex) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: currentChainIdHex }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: currentChainIdHex,
                    chainName: currentChain.name,
                    nativeCurrency: currentChain.nativeCurrency,
                    rpcUrls: [currentChain.rpcUrls.default.http[0]],
                    blockExplorerUrls: currentChain.blockExplorers ? 
                      [currentChain.blockExplorers.default.url] : []
                  },
                ],
              });
            } catch (addError) {
              setAddResult({
                success: false,
                message: `Failed to add ${currentChain.name} network to MetaMask.`
              });
              return;
            }
          } else {
            setAddResult({
              success: false,
              message: `Please switch to the ${currentChain.name} network in MetaMask.`
            });
            return;
          }
        }
      }
      
      // Request to watch the asset
      const success = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: contractAddress,
            tokenId: tokenId,
          },
        },
      });
      
      if (success) {
        setAddResult({
          success: true,
          message: 'NFT successfully added to MetaMask!'
        });
      } else {
        setAddResult({
          success: false,
          message: 'Failed to add NFT to MetaMask. User may have rejected the request.'
        });
      }
    } catch (error: any) {
      console.error('Error adding NFT to MetaMask:', error);
      setAddResult({
        success: false,
        message: `Failed to add NFT to MetaMask: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4">
      <h3 className="font-bold text-lg mb-2">View this NFT in MetaMask</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-1">
          Your NFT has been minted successfully, but it may not appear automatically in MetaMask.
        </p>
        <p className="text-sm text-gray-600">
          Follow these steps to view it:
        </p>
      </div>
      
      <ol className="list-decimal pl-5 mb-4 text-sm">
        <li className="mb-1">Open MetaMask and go to the <strong>NFTs</strong> tab</li>
        <li className="mb-1">Click <strong>Import NFT</strong></li>
        <li className="mb-1">
          Enter Contract Address: 
          <code className="bg-gray-100 px-1 mx-1 rounded text-xs break-all">
            {contractAddress}
          </code>
        </li>
        <li className="mb-1">
          Enter Token ID: 
          <code className="bg-gray-100 px-1 mx-1 rounded text-xs">
            {tokenId}
          </code>
        </li>
        <li>Click <strong>Import</strong></li>
      </ol>
      
      <button
        onClick={handleAddToMetaMask}
        disabled={isAdding}
        className={`w-full font-bold py-2 px-4 rounded ${
          isAdding 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isAdding ? 'Adding to MetaMask...' : 'Add to MetaMask Automatically'}
      </button>
      
      {addResult && (
        <div className={`mt-2 p-2 rounded text-sm ${
          addResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {addResult.message}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Network: {currentChain.name} (Chain ID: {currentChain.id})</p>
        <p>Make sure MetaMask is connected to the {currentChain.name} network.</p>
      </div>
    </div>
  );
};

export default MetaMaskHelper; 