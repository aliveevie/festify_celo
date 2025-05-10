/**
 * Utility functions for handling Ethereum addresses
 */

/**
 * Truncates an Ethereum address for display purposes
 * @param address The full Ethereum address
 * @param startChars Number of characters to show at the start
 * @param endChars Number of characters to show at the end
 * @returns Truncated address string
 */
export const truncateAddress = (
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string => {
  if (!address) return '';
  
  // Check if address is already short
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  // Return truncated address
  return `${address.substring(0, startChars)}...${address.substring(
    address.length - endChars
  )}`;
};

/**
 * Validates if a string is a valid Ethereum address
 * @param address The address to validate
 * @returns Boolean indicating if address is valid
 */
export const isValidAddress = (address: string): boolean => {
  if (!address) return false;
  
  // Basic validation - checks if it's a 42 character hex string starting with 0x
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Formats an address with a ENS name if available
 * @param address The Ethereum address
 * @param ensName Optional ENS name
 * @returns Formatted address string
 */
export const formatAddress = (address: string, ensName?: string): string => {
  if (ensName) return ensName;
  return truncateAddress(address);
};
