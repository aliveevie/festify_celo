import React from 'react';
import Link from 'next/link';

const FestifyLogo: React.FC = () => {
  return (
    <Link href="/" className="flex items-center">
      <div className="flex items-center">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          Festify
        </div>
        <div className="ml-1 px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold rounded-full">
          NFT
        </div>
      </div>
    </Link>
  );
};

export default FestifyLogo;
