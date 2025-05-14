'use client';

import '@rainbow-me/rainbowkit/styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RainbowKitProvider,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { hardhat, celo, alfajores, optimism, optimismGoerli, allChains } from '../providers/chains';

import Layout from '../components/Layout';
import { injectedWallet } from '@rainbow-me/rainbowkit/wallets';
import { FestifyProvider } from './FestifyProvider';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [injectedWallet],
    },
  ],
  {
    appName: 'Celo Composer',
    projectId: process.env.WC_PROJECT_ID ?? '044601f65212332475a09bc14ceb3c34',
  }
);

// Fix the type issue by explicitly casting allChains to the required tuple type
const config = createConfig({
  connectors,
  chains: [hardhat, ...allChains.slice(1)] as const,
  transports: {
    [hardhat.id]: http(),
    [celo.id]: http(),
    [alfajores.id]: http(),
    [optimism.id]: http(),
    [optimismGoerli.id]: http(),
  },
});

const queryClient = new QueryClient();

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <FestifyProvider>
            <Layout>{children}</Layout>
          </FestifyProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
