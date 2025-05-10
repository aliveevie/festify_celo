import React from 'react';
import Image from 'next/image';

interface FestivalBannerProps {
  festival: string;
}

const FestivalBanner: React.FC<FestivalBannerProps> = ({ festival }) => {
  // Festival-specific configurations
  const festivalConfig = {
    christmas: {
      title: 'Christmas Greetings',
      description: 'Spread joy and cheer with personalized Christmas greeting cards',
      bgClass: 'bg-gradient-to-r from-green-800 to-red-700',
      textClass: 'text-white',
      image: '/images/christmas.jpg',
    },
    newyear: {
      title: 'New Year Greetings',
      description: 'Celebrate new beginnings with personalized New Year greeting cards',
      bgClass: 'bg-gradient-to-r from-blue-800 to-purple-700',
      textClass: 'text-white',
      image: '/images/newyear.jpg',
    },
    eid: {
      title: 'Eid Greetings',
      description: 'Share blessings and joy with personalized Eid greeting cards',
      bgClass: 'bg-gradient-to-r from-emerald-700 to-teal-600',
      textClass: 'text-white',
      image: '/images/eid.jpg',
    },
    sallah: {
      title: 'Sallah Greetings',
      description: 'Send warm wishes with personalized Sallah greeting cards',
      bgClass: 'bg-gradient-to-r from-amber-600 to-orange-500',
      textClass: 'text-white',
      image: '/images/sallah.jpg',
    },
    default: {
      title: 'Festival Greetings',
      description: 'Create and share personalized greeting cards for any occasion',
      bgClass: 'bg-gradient-to-r from-blue-600 to-purple-600',
      textClass: 'text-white',
      image: '/images/default.jpg',
    },
  };

  // Get config for the selected festival or use default
  const config = festivalConfig[festival as keyof typeof festivalConfig] || festivalConfig.default;

  return (
    <div className={`relative overflow-hidden rounded-lg ${config.bgClass} p-6 shadow-lg`}>
      <div className="relative z-10 flex flex-col items-center justify-center space-y-4 text-center">
        <h2 className={`text-3xl font-bold ${config.textClass}`}>{config.title}</h2>
        <p className={`max-w-md ${config.textClass}`}>{config.description}</p>
      </div>
      <div className="absolute inset-0 z-0 opacity-20">
        {/* This would display if the images exist */}
        {/* <Image src={config.image} alt={festival} fill className="object-cover" /> */}
      </div>
    </div>
  );
};

export default FestivalBanner;
