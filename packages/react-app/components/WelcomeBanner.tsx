import React from 'react';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface WelcomeBannerProps {
  isConnected: boolean;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ isConnected }) => {
  if (isConnected) return null;

  return (
    <div className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 mb-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome to Festify!</h2>
        <p className="mb-6">
          Create and send personalized festival greeting cards as NFTs to your loved ones.
          Connect your wallet to get started.
        </p>
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            return (
              <div
                {...(!mounted && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
                className="flex justify-center"
              >
                {(() => {
                  if (!mounted || !account || !chain) {
                    return (
                      <Button 
                        onClick={openConnectModal} 
                        size="lg"
                        className="bg-white text-purple-600 hover:bg-gray-100"
                      >
                        Connect Wallet
                      </Button>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  );
};

export default WelcomeBanner;
