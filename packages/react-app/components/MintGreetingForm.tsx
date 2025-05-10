import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { isValidAddress } from '@/utils/addressUtils';
import FestivalSelector from './FestivalSelector';
import Notification from './ui/notification';
import Spinner from './ui/spinner';

interface MintGreetingFormProps {
  onMint: (recipient: string, message: string, festival: string, sender: string, imageUrl?: string) => Promise<void>;
  isLoading: boolean;
  senderAddress: string;
}

const MintGreetingForm: React.FC<MintGreetingFormProps> = ({ onMint, isLoading, senderAddress }) => {
  // Form state
  const [step, setStep] = useState<'festival' | 'details' | 'preview' | 'success'>('festival');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [festival, setFestival] = useState('');
  const [customImage, setCustomImage] = useState('');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  // Handle festival selection
  const handleSelectFestival = (festivalId: string) => {
    setFestival(festivalId);
    setStep('details');
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    // Validate inputs
    if (!recipient || !message || !festival) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isValidAddress(recipient)) {
      setError('Please enter a valid recipient address');
      return;
    }

    try {
      const result = await onMint(recipient, message, festival, senderAddress, customImage || undefined);
      
      // If we have a transaction hash, store it
      if (result && result.transactionHash) {
        setTxHash(result.transactionHash);
      }
      
      // Move to success step
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to mint greeting card');
    }
  };

  // Handle form reset
  const resetForm = () => {
    setRecipient('');
    setMessage('');
    setFestival('');
    setCustomImage('');
    setError('');
    setTxHash('');
    setStep('festival');
  };

  // Render different steps
  const renderStep = () => {
    switch (step) {
      case 'festival':
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Create Festival Greeting</CardTitle>
            </CardHeader>
            <CardContent>
              <FestivalSelector onSelect={handleSelectFestival} />
            </CardContent>
          </>
        );

      case 'details':
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {festival.charAt(0).toUpperCase() + festival.slice(1)} Greeting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="recipient" className="text-sm font-medium">
                    Recipient Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="recipient"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Greeting Message <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Write your greeting message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="customImage" className="text-sm font-medium">
                    Custom Image URL (Optional)
                  </label>
                  <Input
                    id="customImage"
                    placeholder="https://..."
                    value={customImage}
                    onChange={(e) => setCustomImage(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use default festival image
                  </p>
                </div>

                {error && (
                  <Notification 
                    title="Error" 
                    description={error} 
                    type="error" 
                    onClose={() => setError('')} 
                  />
                )}
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep('festival')}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Minting...
                  </>
                ) : (
                  'Mint Greeting Card'
                )}
              </Button>
            </CardFooter>
          </>
        );

      case 'success':
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-green-600">
                Greeting Card Created!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <svg
                    className="h-10 w-10 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <p className="mb-4">
                Your {festival} greeting card has been successfully minted and sent to the recipient.
              </p>
              {txHash && (
                <div className="mb-4 text-sm">
                  <p className="text-muted-foreground">Transaction Hash:</p>
                  <a
                    href={`https://alfajores.celoscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-blue-600 hover:underline"
                  >
                    {txHash}
                  </a>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={resetForm} className="w-full">
                Create Another Greeting Card
              </Button>
            </CardFooter>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-xl shadow-lg">
      {renderStep()}
    </Card>
  );
};

export default MintGreetingForm;
