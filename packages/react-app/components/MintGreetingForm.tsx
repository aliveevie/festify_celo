"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFestify } from '@/contexts/useFestify';
import FestivalSelector from './FestivalSelector';
import { Loader2 } from 'lucide-react';

const MintGreetingForm: React.FC = () => {
  const { address, mintGreetingCard, isLoading } = useFestify();
  
  // Form state
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [festival, setFestival] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!recipient) {
      setError('Recipient address is required');
      return;
    }
    
    if (!message) {
      setError('Message is required');
      return;
    }
    
    if (!festival) {
      setError('Please select a festival');
      return;
    }
    
    try {
      // Call the mintGreetingCard function from the useFestify context
      await mintGreetingCard(recipient, message, festival, imageUrl);
      
      // Reset form and show success message
      setSuccess(true);
      setStep(1);
      setRecipient('');
      setMessage('');
      setFestival('');
      setImageUrl('');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error: any) {
      setError(error.message || 'Failed to mint greeting card');
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (step === 1 && !festival) {
      setError('Please select a festival');
      return;
    }
    
    if (step === 2 && !recipient) {
      setError('Recipient address is required');
      return;
    }
    
    setError('');
    setStep(step + 1);
  };

  // Handle previous step
  const handlePrevStep = () => {
    setError('');
    setStep(step - 1);
  };

  // Check if the user is connected
  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create a Festival Greeting</CardTitle>
          <CardDescription>
            Connect your wallet to create and send festival greeting cards as NFTs
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Please connect your wallet to continue</p>
        </CardContent>
      </Card>
    );
  }
  
  // Show success message
  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Success!</CardTitle>
          <CardDescription>
            Your festival greeting card has been minted and sent
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-green-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium">Your greeting card has been sent successfully!</p>
          <p className="text-gray-500 mt-2">The recipient will be able to view it in their wallet.</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setSuccess(false)}>
            Create Another Greeting
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Festival Greeting</CardTitle>
        <CardDescription>
          Send a personalized festival greeting card as an NFT
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {/* Step 1: Select Festival */}
          {step === 1 && (
            <div className="space-y-4">
              <FestivalSelector
                selectedFestival={festival}
                onSelectFestival={setFestival}
              />
              
              <div className="pt-4">
                <p className="text-sm text-gray-500">
                  Select the festival for which you want to create a greeting card
                </p>
              </div>
            </div>
          )}
          
          {/* Step 2: Enter Recipient */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="recipient" className="text-sm font-medium">
                  Recipient Address
                </label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Enter the Ethereum address of the recipient
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="image-url" className="text-sm font-medium">
                  Image URL (Optional)
                </label>
                <Input
                  id="image-url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Optionally provide a custom image URL for your greeting card
                </p>
              </div>
            </div>
          )}
          
          {/* Step 3: Enter Message */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Your Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Write your festival greeting message here..."
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-gray-500">
                  Write a personal message to be included in your greeting card
                </p>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mt-4 p-2 bg-red-50 text-red-500 text-sm rounded">
              {error}
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handlePrevStep}>
                Back
              </Button>
            ) : (
              <div></div>
            )}
            
            {step < 3 ? (
              <Button type="button" onClick={handleNextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Minting...
                  </>
                ) : (
                  'Mint Greeting Card'
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MintGreetingForm;
