"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useFestify } from "@/contexts/useFestify";
import { Container } from "@/components/ui/container";
import MintGreetingForm from "@/components/MintGreetingForm";
import GreetingStats from "@/components/GreetingStats";
import WelcomeBanner from "@/components/WelcomeBanner";

export default function Home() {
    const {
        address,
        getUserAddress,
        sentGreetings,
        receivedGreetings,
        fetchGreetingCards
    } = useFestify();


    useEffect(() => {
        getUserAddress();
    }, []);

    useEffect(() => {
        if (address) {
            fetchGreetingCards();
        }
    }, [address]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8">
            <Container>
                <WelcomeBanner isConnected={!!address} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <MintGreetingForm />
                    
                    <div className="flex flex-col space-y-8">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-2">Welcome to Festify!</h2>
                            <p>
                                Create and send personalized festival greeting cards as NFTs to your loved ones.
                                Choose from different festivals, add your message, and mint your unique greeting card.
                            </p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-6 border shadow-sm">
                            <h3 className="text-lg font-semibold mb-2">How It Works</h3>
                            <ol className="list-decimal list-inside space-y-2">
                                <li>Connect your wallet</li>
                                <li>Select a festival</li>
                                <li>Enter recipient's address</li>
                                <li>Write your personal message</li>
                                <li>Mint your greeting card as an NFT</li>
                            </ol>
                        </div>
                    </div>
                </div>
                
                {address && (
                    <GreetingStats 
                        sentGreetings={sentGreetings} 
                        receivedGreetings={receivedGreetings} 
                    />
                )}
            </Container>
        </main>
    );
}
