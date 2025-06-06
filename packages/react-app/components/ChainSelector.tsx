"use client";

import React, { useState, useEffect } from 'react';
import { useFestifyContext } from '@/providers/FestifyProvider';
import { allChains } from '@/providers/chains';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

const ChainSelector: React.FC = () => {
  const { isLoading, currentChainId, updateCurrentChain } = useFestifyContext();
  const [noContractWarning, setNoContractWarning] = useState<boolean>(false);

  // Check if the current chain has a contract deployed
  useEffect(() => {
    if (!currentChainId) {
      setNoContractWarning(false);
      return;
    }
    const contractAddress = CONTRACT_ADDRESSES[currentChainId];
    setNoContractWarning(!contractAddress || contractAddress === "");
  }, [currentChainId]);

  const handleChainChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "") {
      updateCurrentChain(null);
      return;
    }
    const newChainId = parseInt(value);
    const selectedChain = allChains.find(chain => chain.id === newChainId);
    if (selectedChain) {
      updateCurrentChain(selectedChain);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-2">
        <label htmlFor="chain-selector" className="text-sm font-medium text-gray-700">
          Network:
        </label>
        <div className="relative">
          <select
            id="chain-selector"
            value={currentChainId || ""}
            onChange={handleChainChange}
            disabled={isLoading}
            className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${noContractWarning ? 'border-yellow-500' : ''}`}
          >
            <option value="">Select Network</option>
            {allChains.map(chain => {
              const hasContract = CONTRACT_ADDRESSES[chain.id] && CONTRACT_ADDRESSES[chain.id] !== "";
              return (
                <option 
                  key={chain.id} 
                  value={chain.id}
                  className={!hasContract ? 'text-yellow-500' : ''}
                >
                  {chain.name}{!hasContract ? ' (No Contract)' : ''}
                </option>
              );
            })}
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
      {noContractWarning && (
        <div className="mt-1 text-xs text-yellow-600">
          No contract deployed on this network. Please deploy a contract or select another network.
        </div>
      )}
      {!currentChainId && (
        <div className="mt-1 text-xs text-blue-600">
          Please select a network to continue.
        </div>
      )}
    </div>
  );
};

export default ChainSelector;
