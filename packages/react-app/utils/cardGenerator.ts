/**
 * Utility for generating visually appealing greeting card images
 */

import { utf8ToBase64 } from './base64Utils';

// Festival-specific colors and themes
const festivalThemes = {
  christmas: {
    primaryColor: '#D42426', // Red
    secondaryColor: '#0F8A5F', // Green
    accentColor: '#FFFFFF', // White
    backgroundImage: 'https://ipfs.io/ipfs/QmNtxfy9Mk8qLsdGnraHGk5XDX4MzpQzNz6KWHBpNquGts',
    emoji: '🎄'
  },
  newyear: {
    primaryColor: '#FFD700', // Gold
    secondaryColor: '#000080', // Navy
    accentColor: '#FFFFFF', // White
    backgroundImage: 'https://ipfs.io/ipfs/QmYqA8GsxbXeWoJxH2RBuAyFRNqyBJCJb4kByuYBtVCRsf',
    emoji: '🎉'
  },
  eid: {
    primaryColor: '#50C878', // Emerald
    secondaryColor: '#800080', // Purple
    accentColor: '#FFFFFF', // White
    backgroundImage: 'https://ipfs.io/ipfs/QmTcM5VyR7SLcBZJ8Qrv8KbRfo2CyYZMXfM7Rz3XDmhG3H',
    emoji: '🌙'
  },
  sallah: {
    primaryColor: '#228B22', // Forest Green
    secondaryColor: '#FFD700', // Gold
    accentColor: '#FFFFFF', // White
    backgroundImage: 'https://ipfs.io/ipfs/QmXfnZpQy4U4UgcVwDMgVCTQxCVKLXBgX5Ym4xLSk9wGK1',
    emoji: '🕌'
  }
};

/**
 * Generate a data URL for a greeting card SVG
 */
export const generateGreetingCardSVG = (
  festival: string,
  message: string,
  sender: string,
  recipient: string
): string => {
  const theme = festivalThemes[festival as keyof typeof festivalThemes] || festivalThemes.newyear;
  const formattedMessage = message.replace(/"/g, '&quot;');
  const shortSender = shortenAddress(sender);
  const shortRecipient = shortenAddress(recipient);
  const festivalName = festival.charAt(0).toUpperCase() + festival.slice(1);
  
  // Create SVG for the greeting card
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <defs>
        <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${theme.primaryColor}" />
          <stop offset="100%" stop-color="${theme.secondaryColor}" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3" />
        </filter>
      </defs>
      
      <!-- Card Background -->
      <rect width="500" height="500" rx="15" fill="url(#cardGradient)" filter="shadow" />
      
      <!-- Festival Icon -->
      <text x="250" y="100" font-family="Arial, sans-serif" font-size="72" text-anchor="middle" fill="${theme.accentColor}">${theme.emoji}</text>
      
      <!-- Festival Title -->
      <text x="250" y="160" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="${theme.accentColor}">Happy ${festivalName}!</text>
      
      <!-- Message Box -->
      <rect x="50" y="180" width="400" height="160" rx="10" fill="${theme.accentColor}" opacity="0.9" />
      <foreignObject x="70" y="190" width="360" height="140">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 18px; color: #333; overflow-wrap: break-word; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; text-align: center;">
          ${formattedMessage}
        </div>
      </foreignObject>
      
      <!-- From/To Information -->
      <text x="70" y="380" font-family="Arial, sans-serif" font-size="18" fill="${theme.accentColor}">From: ${shortSender}</text>
      <text x="70" y="410" font-family="Arial, sans-serif" font-size="18" fill="${theme.accentColor}">To: ${shortRecipient}</text>
      
      <!-- NFT Info -->
      <text x="250" y="460" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="${theme.accentColor}">Festify Greeting Card NFT</text>
      <text x="250" y="480" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="${theme.accentColor}">Created on ${new Date().toLocaleDateString()}</text>
    </svg>
  `;
  
  // Convert SVG to data URL using UTF-8 safe encoding
  return `data:image/svg+xml;base64,${utf8ToBase64(svg)}`;
};

/**
 * Shorten an Ethereum address for display
 */
const shortenAddress = (address: string): string => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Get a default image URL for a festival
 */
export const getDefaultImageForFestival = (festival: string): string => {
  const theme = festivalThemes[festival as keyof typeof festivalThemes] || festivalThemes.newyear;
  return theme.backgroundImage;
};
