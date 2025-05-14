// Contract addresses for different networks
export const CONTRACT_ADDRESSES: Record<number, string> = {
  // Hardhat Local
  // 31337: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_HARDHAT || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  // Celo Mainnet
  42220: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CELO || "",
  // Alfajores Testnet
  44787: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_ALFAJORES || "0x2d31AA6Cf9C41800d2A34E5aA94289377cc43d4B",
  // Optimism Mainnet
  10: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_OPTIMISM || "",
  // Optimism Goerli Testnet
  420: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_OPTIMISM_GOERLI || ""
};
