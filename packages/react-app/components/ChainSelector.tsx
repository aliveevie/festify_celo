"use client";

import React from 'react';
import { useFestifyContext } from '@/providers/FestifyProvider';
import { allChains } from '@/providers/chains';

const ChainSelector: React.FC = () => {
  const { isLoading, currentChainId, updateCurrentChain } = useFestifyContext();

  const handleChainChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChainId = parseInt(e.target.value);
    if (window.ethereum) {
      try {
        // Request chain switch
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${newChainId.toString(16)}` }],
        });
        // The chain change will trigger the chainChanged event which updates the context
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          const chain = allChains.find(c => c.id === newChainId);
          if (chain) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${newChainId.toString(16)}`,
                    chainName: chain.name,
                    nativeCurrency: chain.nativeCurrency,
                    rpcUrls: [chain.rpcUrls.default.http[0]],
                    blockExplorerUrls: chain.blockExplorers ? 
                      [chain.blockExplorers.default.url] : []
                  },
                ],
              });
              // After adding the chain, try to switch again
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${newChainId.toString(16)}` }],
              });
            } catch (addError) {
              console.error(`Error adding chain ${chain.name}:`, addError);
            }
          }
        }
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="chain-selector" className="text-sm font-medium text-gray-700">
        Network:
      </label>
      <div className="relative">
        <select
          id="chain-selector"
          value={currentChainId}
          onChange={handleChainChange}
          disabled={isLoading}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {allChains.map(chain => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </select>
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChainSelector;
