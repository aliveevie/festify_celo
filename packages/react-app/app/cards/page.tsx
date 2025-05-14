"use client";

import { useEffect, useState } from "react";
import { useFestify } from "@/contexts/useFestify";
import { Container } from "@/components/ui/container";
import GreetingCardGallery from "@/components/GreetingCardGallery";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CardsPage() {
  const { address, getUserAddress, fetchGreetingCards, isLoading } = useFestify();

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    getUserAddress();
  }, []);

  useEffect(() => {
    if (address && !hasLoaded) {
      console.log("Fetching greeting cards for address:", address);
      fetchGreetingCards();
      setHasLoaded(true);
    }
  }, [address, fetchGreetingCards, hasLoaded]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8">
      <Container>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Greeting Cards</h1>
          <Link href="/">
            <Button variant="outline" title="Back to Home" onClick={() => {}}>Back to Home</Button>
          </Link>
        </div>

        {!address ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-2 text-yellow-800">Connect Your Wallet</h2>
            <p className="text-yellow-700 mb-4">
              Please connect your wallet to view your greeting cards.
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your greeting cards...</p>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-700">
                <strong>Connected Address:</strong> {address}
              </p>
              <p className="text-blue-700 mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => fetchGreetingCards()}
                  className="text-xs"
                  title="Refresh Cards"
                >
                  Refresh Cards
                </Button>
              </p>
            </div>
            
            <GreetingCardGallery />
          </>
        )}
      </Container>
    </main>
  );
}
