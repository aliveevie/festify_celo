import { useState, useEffect } from "react";
import FestifyABI from "./festify-abi.json";
import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  http,
  parseEther,
  PublicClient,
  GetContractReturnType,
} from "viem";
import { hardhat } from "../providers/hardhatChain";
import { generateGreetingCardSVG } from "../utils/cardGenerator";
import { utf8ToBase64, parseBase64Metadata } from "../utils/base64Utils";

// Contract address for the FestivalGreetings contract - deployed with Ignition
const FESTIFY_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Initialize public client for Hardhat
const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
}) as PublicClient;

// Type for our contract
type FestifyContract = GetContractReturnType<typeof FestifyABI.abi, PublicClient>;

export const useFestify = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sentGreetings, setSentGreetings] = useState<any[]>([]);
  const [receivedGreetings, setReceivedGreetings] = useState<any[]>([]);

  // Default festival images
  const getDefaultImageForFestival = (festival: string): string => {
    const festivalMap: Record<string, string> = {
      christmas: "https://ipfs.io/ipfs/QmNtxfy9Mk8qLsdGnraHGk5XDX4MzpQzNz6KWHBpNquGts",
      newyear: "https://ipfs.io/ipfs/QmYqA8GsxbXeWoJxH2RBuAyFRNqyBJCJb4kByuYBtVCRsf",
      eid: "https://ipfs.io/ipfs/QmTcM5VyR7SLcBZJ8Qrv8KbRfo2CyYZMXfM7Rz3XDmhG3H",
      sallah: "https://ipfs.io/ipfs/QmXfnZpQy4U4UgcVwDMgVCTQxCVKLXBgX5Ym4xLSk9wGK1",
    };
    return festivalMap[festival] || festivalMap.newyear;
  };

  // Get user's wallet address
  const getUserAddress = async () => {
    try {
      let walletAddress = null;
      
      // Try to get address from localStorage first
      if (typeof window !== "undefined") {
        const storedAddress = localStorage.getItem("walletAddress");
        if (storedAddress) {
          console.log("Found address in localStorage:", storedAddress);
          walletAddress = storedAddress;
        }
      }
      
      // If no address in localStorage, try to get from wagmi
      if (!walletAddress) {
        console.log("No address in localStorage, checking ethereum provider...");
        
        if (typeof window !== "undefined" && window.ethereum) {
          try {
            // Request accounts from the provider
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
              walletAddress = accounts[0];
              console.log("Got address from ethereum provider:", walletAddress);
            }
          } catch (error) {
            console.error("Error requesting accounts:", error);
          }
        }
      }
      
      // If we have an address, set it
      if (walletAddress) {
        setAddress(walletAddress);
        setIsConnected(true);
        
        // Store in localStorage for persistence
        if (typeof window !== "undefined") {
          localStorage.setItem("walletAddress", walletAddress);
        }
        
        // Set up event listener for account changes
        if (typeof window !== "undefined" && window.ethereum) {
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            console.log("Accounts changed:", accounts);
            if (accounts.length === 0) {
              // User disconnected wallet
              setAddress(null);
              setIsConnected(false);
              localStorage.removeItem("walletAddress");
            } else {
              // User switched accounts
              setAddress(accounts[0]);
              localStorage.setItem("walletAddress", accounts[0]);
            }
          });
        }
        
        return walletAddress;
      } else {
        console.log("No wallet address found");
        setAddress(null);
        setIsConnected(false);
        return null;
      }
    } catch (error) {
      console.error("Error getting user address:", error);
      setAddress(null);
      setIsConnected(false);
      return null;
    }
  };

  // Mint a new greeting card
  const mintGreetingCard = async (
    recipient: string,
    message: string,
    festival: string,
    imageUrl?: string
  ) => {
    try {
      console.log("Starting the minting process...");
      
      // Generate a beautiful SVG greeting card
      const svgDataUrl = generateGreetingCardSVG(festival, message, address || "", recipient);
      
      // Create metadata with the SVG image
      const metadata = {
        name: `${festival.charAt(0).toUpperCase() + festival.slice(1)} Greeting`,
        description: message,
        image: svgDataUrl, // Use the generated SVG instead of a static image
        attributes: [
          {
            trait_type: "Festival",
            value: festival
          },
          {
            trait_type: "Sender",
            value: address
          },
          {
            trait_type: "Recipient",
            value: recipient
          },
          {
            trait_type: "Created",
            value: new Date().toISOString()
          }
        ]
      };
      
      console.log("Generated SVG greeting card for recipient");
      
      // Convert metadata to URI format using UTF-8 safe encoding
      const metadataUri = `data:application/json;base64,${utf8ToBase64(JSON.stringify(metadata))}`;
      console.log("Metadata created:", metadata);

      // Check if we're on the correct network (Hardhat)
      if (typeof window !== "undefined" && window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainId = parseInt(chainId, 16);
        console.log("useFestify: Current chain ID before minting:", currentChainId);
        
        if (currentChainId !== 31337) {
          console.log("Not on Hardhat network, attempting to switch...");
          try {
            // Try to switch to Hardhat network
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x7A69' }], // 31337 in hex
            });
            console.log("Successfully switched to Hardhat network");
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0x7A69', // 31337 in hex
                      chainName: 'Hardhat Local',
                      nativeCurrency: {
                        name: 'Ethereum',
                        symbol: 'ETH',
                        decimals: 18
                      },
                      rpcUrls: ['http://127.0.0.1:8545'],
                      blockExplorerUrls: []
                    },
                  ],
                });
                console.log("Added Hardhat network to wallet");
              } catch (addError) {
                console.error("Error adding Hardhat network:", addError);
                throw new Error('Failed to add Hardhat network to your wallet. Please add it manually.');
              }
            } else {
              console.error("Error switching to Hardhat network:", switchError);
              throw new Error('Please switch to the Hardhat network (Chain ID: 31337) in your wallet to mint greeting cards.');
            }
          }
        }
      }
      
      // Get wallet client
      let walletClient = createWalletClient({
        transport: custom(window.ethereum),
        chain: hardhat,
      });

      // Calculate mint fee (0.01 ETH)
      const mintFee = parseEther("0.01");
      
      console.log("Calling smart contract to mint greeting card...");
      console.log("Contract address:", FESTIFY_CONTRACT_ADDRESS);
      console.log("Parameters:", { recipient, metadataUri, festival, mintFee: mintFee.toString() });

      // Call the contract to mint the greeting card
      // Convert senderAddress to the correct format (0x-prefixed string)
      const formattedAddress = address as `0x${string}`;
      
      const tx = await walletClient.writeContract({
        address: FESTIFY_CONTRACT_ADDRESS as `0x${string}`,
        abi: FestifyABI.abi,
        functionName: "mintGreetingCard",
        account: formattedAddress,
        args: [recipient as `0x${string}`, metadataUri, festival],
        value: mintFee,
      });
      
      console.log("Transaction hash:", tx);
      
      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("Transaction receipt:", receipt);
      
      // Add detailed debugging for the transaction
      console.log("Transaction successful to contract address:", FESTIFY_CONTRACT_ADDRESS);
      console.log("Recipient address that should receive the NFT:", recipient);
      
      try {
        // Check if the NFT was actually minted and transferred to the recipient
        const festifyContract = getContract({
          abi: FestifyABI.abi,
          address: FESTIFY_CONTRACT_ADDRESS as `0x${string}`,
          client: publicClient,
        }) as FestifyContract;
        
        // Get the latest token ID (should be the one just minted)
        // We can estimate this as the current nextTokenId - 1
        const latestTokenId = await festifyContract.read.balanceOf([recipient as `0x${string}`]);
        console.log(`Recipient ${recipient} now has ${latestTokenId} tokens`);
        
        // Try to get the owner of the latest token
        try {
          // We don't know the exact token ID, so let's check the recipient's received tokens
          const receivedTokens = await festifyContract.read.getReceivedGreetings([recipient as `0x${string}`]);
          console.log("Recipient's tokens:", receivedTokens);
          
          if (receivedTokens && receivedTokens.length > 0) {
            const latestToken = receivedTokens[receivedTokens.length - 1];
            console.log("Latest token ID:", latestToken.toString());
            
            // Get the owner of this token
            const owner = await festifyContract.read.ownerOf([latestToken]);
            console.log(`Token ${latestToken} is owned by: ${owner}`);
            
            // Verify it matches the recipient
            if (owner.toLowerCase() === recipient.toLowerCase()) {
              console.log("✅ NFT successfully transferred to recipient!");
            } else {
              console.log("❌ NFT owner doesn't match recipient!");
            }
          }
        } catch (err) {
          console.error("Error checking token ownership:", err);
        }
      } catch (err) {
        console.error("Error verifying NFT transfer:", err);
      }
      
      // Fetch updated greeting cards
      await fetchGreetingCards();
      
      return receipt;
    } catch (error) {
      console.error("Error minting greeting card:", error);
      throw error;
    }
  };

  // Get greeting cards sent by the user
  const getSentGreetings = async () => {
    try {
      if (!address) return [];

      // Create contract instance with proper typing
      const festifyContract = getContract({
        abi: FestifyABI.abi,
        address: FESTIFY_CONTRACT_ADDRESS as `0x${string}`,
        client: publicClient,
      }) as FestifyContract;

      // Get token IDs sent by the user
      const tokenIds = await festifyContract.read.getSentGreetings([address as `0x${string}`]) as bigint[];
      
      // Get details for each token
      const greetings = await Promise.all(
        tokenIds.map(async (tokenId: bigint) => {
          const tokenURI = await festifyContract.read.tokenURI([tokenId]);
          const festival = await festifyContract.read.getGreetingFestival([tokenId]);
          const recipient = await festifyContract.read.ownerOf([tokenId]);
          
          // Parse metadata from data URI
          let metadata = null;
          if (typeof tokenURI === 'string' && tokenURI.startsWith('data:application/json;base64,')) {
            metadata = parseBase64Metadata(tokenURI);
          }
          
          return {
            tokenId: tokenId.toString(),
            tokenURI,
            festival,
            recipient,
            metadata,
          };
        })
      );
      
      return greetings;
    } catch (error) {
      console.error("Error getting sent greetings:", error);
      return [];
    }
  };

  // Get greeting cards received by the user
  const getReceivedGreetings = async () => {
    try {
      if (!address) return [];

      // Create contract instance with proper typing
      const festifyContract = getContract({
        abi: FestifyABI.abi,
        address: FESTIFY_CONTRACT_ADDRESS as `0x${string}`,
        client: publicClient,
      }) as FestifyContract;

      // Get token IDs received by the user
      const tokenIds = await festifyContract.read.getReceivedGreetings([address as `0x${string}`]) as bigint[];
      
      // Get details for each token
      const greetings = await Promise.all(
        tokenIds.map(async (tokenId: bigint) => {
          const tokenURI = await festifyContract.read.tokenURI([tokenId]);
          const festival = await festifyContract.read.getGreetingFestival([tokenId]);
          const sender = await festifyContract.read.getGreetingSender([tokenId]);
          
          // Parse metadata from data URI
          let metadata = null;
          if (typeof tokenURI === 'string' && tokenURI.startsWith('data:application/json;base64,')) {
            metadata = parseBase64Metadata(tokenURI);
          }
          
          return {
            tokenId: tokenId.toString(),
            tokenURI,
            festival,
            sender,
            metadata,
          };
        })
      );
      
      return greetings;
    } catch (error) {
      console.error("Error getting received greetings:", error);
      return [];
    }
  };

  // Fetch both sent and received greeting cards
  const fetchGreetingCards = async () => {
    if (!address) return;
    
    try {
      setIsLoading(true);
      console.log("Fetching greeting cards for address:", address);
      
      // Create public client with proper typing
      const publicClient = createPublicClient({
        chain: hardhat,
        transport: http(),
      }) as PublicClient;
      
      // Create contract instance with proper typing
      const contract = getContract({
        address: FESTIFY_CONTRACT_ADDRESS as `0x${string}`,
        abi: FestifyABI.abi,
        client: publicClient,
      }) as FestifyContract;
      
      // Get sent tokens
      console.log('Contract address being used:', FESTIFY_CONTRACT_ADDRESS);
const sentTokensResult = await contract.read.getSentGreetings([address as `0x${string}`]);
      console.log("Sent tokens result:", sentTokensResult);
      
      // Get received tokens
      const receivedTokensResult = await contract.read.getReceivedGreetings([address as `0x${string}`]);
      console.log("Received tokens result:", receivedTokensResult);
      
      // Process sent tokens
      const sentTokens = Array.isArray(sentTokensResult) ? sentTokensResult : [];
      const sentTokenDetails = await Promise.all(
        sentTokens.map(async (tokenId) => {
          try {
            const tokenURI = await contract.read.tokenURI([tokenId]);
            const festival = await contract.read.getGreetingFestival([tokenId]);
            const recipient = await contract.read.ownerOf([tokenId]);
            
            // Parse metadata from tokenURI if it's a data URI using our safe decoder
            const metadata = parseBase64Metadata(tokenURI as string);
            
            return {
              tokenId: tokenId.toString(),
              tokenURI,
              festival,
              recipient,
              metadata,
            };
          } catch (error) {
            console.error(`Error fetching details for sent token ${tokenId}:`, error);
            return null;
          }
        })
      );
      
      // Process received tokens
      const receivedTokens = Array.isArray(receivedTokensResult) ? receivedTokensResult : [];
      const receivedTokenDetails = await Promise.all(
        receivedTokens.map(async (tokenId) => {
          try {
            const tokenURI = await contract.read.tokenURI([tokenId]);
            const festival = await contract.read.getGreetingFestival([tokenId]);
            const sender = await contract.read.getGreetingSender([tokenId]);
            
            // Parse metadata from tokenURI if it's a data URI using our safe decoder
            const metadata = parseBase64Metadata(tokenURI as string);
            
            return {
              tokenId: tokenId.toString(),
              tokenURI,
              festival,
              sender,
              metadata,
            };
          } catch (error) {
            console.error(`Error fetching details for received token ${tokenId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out null values and set state
      setSentGreetings(sentTokenDetails.filter(Boolean));
      setReceivedGreetings(receivedTokenDetails.filter(Boolean));
      
      console.log("Sent greetings:", sentTokenDetails.filter(Boolean));
      console.log("Received greetings:", receivedTokenDetails.filter(Boolean));
    } catch (error) {
      console.error("Error fetching greeting cards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize when component mounts
  useEffect(() => {
    getUserAddress();
  }, []);

  // Fetch greeting cards when address changes
  useEffect(() => {
    if (address) {
      fetchGreetingCards();
    }
  }, [address]);

  return {
    address,
    isConnected,
    isLoading,
    sentGreetings,
    receivedGreetings,
    getUserAddress,
    mintGreetingCard,
    fetchGreetingCards,
  };
};
