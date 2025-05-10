import React from 'react';
import { Button } from '@/components/ui/button';

interface WelcomeBannerProps {
  onGetStarted: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onGetStarted }) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-700 via-blue-600 to-indigo-700 p-8 shadow-xl">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-10"></div>
      <div className="relative z-10 flex flex-col items-center text-center text-white">
        <h1 className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to Festify
        </h1>
        <p className="mb-6 max-w-2xl text-lg text-white/90">
          Create and share personalized festival greeting cards as NFTs on the blockchain.
          Send unique digital greetings for Christmas, New Year, Eid, Sallah, and more!
        </p>
        <Button
          onClick={onGetStarted}
          size="lg"
          className="bg-white px-8 text-lg font-semibold text-purple-700 hover:bg-white/90"
        >
          Get Started
        </Button>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl"></div>
      <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
    </div>
  );
};

export default WelcomeBanner;
