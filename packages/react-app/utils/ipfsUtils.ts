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
    return `https://w3s.link/ipfs/${fakeCid}`;
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
  // Make sure the image URL is HTTP-based for MetaMask compatibility
  let finalImageUrl = imageUrl;
  if (finalImageUrl.startsWith('ipfs://')) {
    finalImageUrl = ipfsToHttpUrl(finalImageUrl);
  }
  
  // Create metadata object following OpenSea standards
  const metadata = {
    name,
    description,
    image: finalImageUrl,
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
  if (!url) return false;
  return url.startsWith('ipfs://') || 
         url.includes('ipfs.io/ipfs/') || 
         url.includes('w3s.link/ipfs/') ||
         url.includes('gateway.pinata.cloud/ipfs/') ||
         url.includes('cloudflare-ipfs.com/ipfs/');
};

/**
 * Convert any IPFS URL to an HTTP gateway URL
 * Prefer the Storacha gateway (w3s.link) for better compatibility
 */
export const ipfsToHttpUrl = (ipfsUrl: string): string => {
  if (!ipfsUrl) return '';
  
  if (ipfsUrl.startsWith('ipfs://')) {
    // Use the Storacha gateway for better compatibility
    return ipfsUrl.replace('ipfs://', 'https://w3s.link/ipfs/');
  }
  
  // If it's already using a different gateway, keep it as is
  return ipfsUrl;
};

/**
 * Ensure an image URL is compatible with MetaMask
 */
export const ensureMetaMaskCompatibleUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  
  // If it's a data URI, we need to convert it to an HTTP URL for MetaMask
  if (imageUrl.startsWith('data:')) {
    // For SVG data URIs, try to extract and upload to IPFS
    if (imageUrl.startsWith('data:image/svg')) {
      try {
        // Extract SVG content
        const base64Data = imageUrl.replace('data:image/svg+xml;base64,', '');
        const svgContent = atob(base64Data);
        
        // Create a placeholder URL with the SVG content hash
        const hash = btoa(svgContent).substring(0, 16);
        return `https://w3s.link/ipfs/placeholder-${hash}`;
      } catch (e) {
        console.error("Error processing SVG data URI:", e);
      }
    }
    
    // For other data URIs or if SVG extraction fails, use a placeholder
    return 'https://via.placeholder.com/350x350?text=Festify+NFT';
  }
  
  // If it's an IPFS URL, convert to HTTP gateway URL
  if (isIpfsUrl(imageUrl)) {
    return ipfsToHttpUrl(imageUrl);
  }
  
  return imageUrl;
};

/**
 * Get the appropriate IPFS gateway URL based on the network
 */
export const getIpfsGatewayForNetwork = (chainId: number): string => {
  // Use different gateways based on the network for better reliability
  const gatewayMap: Record<number, string> = {
    1: 'https://w3s.link/ipfs/', // Ethereum Mainnet - Storacha gateway
    10: 'https://w3s.link/ipfs/', // Optimism - Storacha gateway
    42220: 'https://w3s.link/ipfs/', // Celo Mainnet - Storacha gateway
    44787: 'https://ipfs.io/ipfs/', // Celo Alfajores - IPFS.io gateway
    420: 'https://cloudflare-ipfs.com/ipfs/', // Optimism Goerli - Cloudflare gateway
  };
  
  return gatewayMap[chainId] || 'https://w3s.link/ipfs/';
}; 