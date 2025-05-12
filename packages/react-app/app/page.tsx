"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useFestify } from "@/contexts/useFestify";
import { Container } from "@/components/ui/container";
import MintGreetingForm from "@/components/MintGreetingForm";
import GreetingStats from "@/components/GreetingStats";
import WelcomeBanner from "@/components/WelcomeBanner";
import GreetingCardGallery from "@/components/GreetingCardGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

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
                
                {address && (
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-lg mb-6 shadow-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">View Your NFT Greeting Cards</h3>
                                <p>Check all greeting cards you've sent and received</p>
                            </div>
                            <Link href="/cards" className="bg-white text-purple-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                                View Cards
                            </Link>
                        </div>
                    </div>
                )}
                
                <Tabs defaultValue="create" className="w-full mb-8">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="create">Create Greeting Card</TabsTrigger>
                        <TabsTrigger value="view">View Your Cards</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="create">
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
                    </TabsContent>
                    
                    <TabsContent value="view">
                        <GreetingCardGallery />
                    </TabsContent>
                </Tabs>
            </Container>
        </main>
    );
}
