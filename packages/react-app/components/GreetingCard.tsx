import React from 'react';

interface GreetingCardProps {
  tokenId: string;
  festival: string;
  message: string;
  sender: string;
  recipient: string;
  imageUrl: string;
}

const GreetingCard: React.FC<GreetingCardProps> = ({
  tokenId,
  festival,
  message,
  sender,
  recipient,
  imageUrl,
}) => {
  // Truncate address for display
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Capitalize festival name
  const capitalizedFestival = festival.charAt(0).toUpperCase() + festival.slice(1);

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="h-48 w-full relative bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
        <h3 className="text-2xl font-bold text-white">{capitalizedFestival}</h3>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-1">{capitalizedFestival} Greeting</h3>
        <p className="text-sm text-gray-500 mb-3">Token ID: {tokenId}</p>
        
        <p className="mb-4 text-sm italic">&ldquo;{message}&rdquo;</p>
        
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">From:</span>
            <span className="font-medium">{truncateAddress(sender)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">To:</span>
            <span className="font-medium">{truncateAddress(recipient)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreetingCard;
