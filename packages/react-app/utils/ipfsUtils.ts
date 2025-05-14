/**
 * Fallback IPFS utility functions when Web3.Storage/Storacha is not available
 */
import { utf8ToBase64 } from './base64Utils';

/**
 * Generate a fake CID for development/fallback purposes
 * This simulates an IPFS CID but is not a real one
 */
export const generateFakeCid = (): string => {
  // Generate a random string that looks like a CID
  return `bafybeih${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Convert a data URI to an IPFS-compatible URL using a public IPFS gateway
 * This is a fallback method when direct IPFS upload fails
 */
export const dataUriToIpfsUrl = async (dataUri: string): Promise<string> => {
  try {
    // For SVG data URIs, we can use a public IPFS gateway service
    // This is just a simulation - in production you'd actually upload to IPFS
    const fakeCid = generateFakeCid();
    return `https://ipfs.io/ipfs/${fakeCid}`;
  } catch (error) {
    console.error("Error converting data URI to IPFS URL:", error);
    return dataUri; // Return the original data URI if conversion fails
  }
};

/**
 * Create NFT metadata with proper structure for MetaMask compatibility
 */
export const createNftMetadata = (
  name: string,
  description: string,
  imageUrl: string,
  attributes: any[]
): string => {
  // Create metadata object following OpenSea standards
  const metadata = {
    name,
    description,
    image: imageUrl,
    external_url: "https://festify.xyz",
    attributes
  };
  
  // Convert to base64 encoded JSON
  return `data:application/json;base64,${utf8ToBase64(JSON.stringify(metadata))}`;
};

/**
 * Check if a URL is a valid IPFS URL
 */
export const isIpfsUrl = (url: string): boolean => {
  return url.startsWith('ipfs://') || 
         url.includes('ipfs.io/ipfs/') || 
         url.includes('gateway.pinata.cloud/ipfs/') ||
         url.includes('cloudflare-ipfs.com/ipfs/');
};

/**
 * Convert any IPFS URL to an HTTP gateway URL
 */
export const ipfsToHttpUrl = (ipfsUrl: string): string => {
  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return ipfsUrl;
};

/**
 * Ensure an image URL is compatible with MetaMask
 */
export const ensureMetaMaskCompatibleUrl = (imageUrl: string): string => {
  // If it's a data URI, we need to convert it to an HTTP URL for MetaMask
  if (imageUrl.startsWith('data:')) {
    // For development, we'll just return a placeholder image
    return 'https://via.placeholder.com/350x350?text=Festify+NFT';
  }
  
  // If it's an IPFS URL, convert to HTTP gateway URL
  if (isIpfsUrl(imageUrl)) {
    return ipfsToHttpUrl(imageUrl);
  }
  
  return imageUrl;
}; 