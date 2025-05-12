import { useState, useEffect } from "react";
import FestifyABI from "./festify-abi.json";
import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  http,
  parseEther,
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
});

export const useFestify = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [sentGreetings, setSentGreetings] = useState<any[]>([]);
  const [receivedGreetings, setReceivedGreetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get user's wallet address
  const getUserAddress = async () => {
    // First check localStorage for the address (set by Header component)
    if (typeof window !== "undefined") {
      const savedAddress = window.localStorage.getItem('walletAddress');
      if (savedAddress) {
        console.log("Using wallet address from localStorage:", savedAddress);
        setAddress(savedAddress);
        return savedAddress;
      }
    }
    
    // Fallback to getting address from ethereum provider
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // First try the simpler method
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          console.log("Detected wallet address from eth_accounts:", accounts[0]);
          setAddress(accounts[0]);
          // Save to localStorage for future use
          window.localStorage.setItem('walletAddress', accounts[0]);
          return accounts[0];
        }
        
        // Fallback to viem method
        let walletClient = createWalletClient({
          transport: custom(window.ethereum),
          chain: hardhat,
        });

        let [address] = await walletClient.getAddresses();
        console.log("Detected wallet address from viem:", address);
        setAddress(address);
        // Save to localStorage for future use
        if (address) {
          window.localStorage.setItem('walletAddress', address);
        }
        return address;
      } catch (error) {
        console.error("Error getting user address:", error);
        return null;
      }
    }
    return null;
  };
  
  // Check if wallet is connected (for immediate UI updates)
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            console.log("Wallet already connected:", accounts[0]);
            setAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };
    
    checkWalletConnection();
    
    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log("Account changed to:", accounts[0]);
        setAddress(accounts[0] || null);
      });
    }
    
    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  // Create and mint a new greeting card NFT
  const mintGreetingCard = async (
    recipient: string,
    message: string,
    festival: string,
    imageUrl?: string
  ) => {
    // Check if wallet is connected and get the address if needed
    let senderAddress = address;
    if (!senderAddress && typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          senderAddress = accounts[0];
          setAddress(senderAddress); // Update the state
          console.log("Using detected wallet address:", senderAddress);
        }
      } catch (error) {
        console.error("Error getting accounts:", error);
      }
    }
    
    if (!senderAddress) {
      throw new Error("Please connect your wallet first");
    }
    
    setIsLoading(true);
    try {
      console.log("Starting the minting process...");
      
      // Generate a beautiful SVG greeting card
      const svgDataUrl = generateGreetingCardSVG(festival, message, senderAddress, recipient);
      
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
            value: senderAddress
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
      const formattedAddress = senderAddress as `0x${string}`;
      
      const tx = await walletClient.writeContract({
        address: FESTIFY_CONTRACT_ADDRESS as `0x${string}`,
        abi: FestifyABI.abi,
        functionName: "mintGreetingCard",
        account: formattedAddress,
        args: [recipient as `0x${string}`, metadataUri, festival],
        value: mintFee,
      });
      
      console.log("Transaction submitted:", tx);

      // Wait for transaction receipt
      console.log("Waiting for transaction confirmation...");
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });
      
      console.log("Transaction confirmed:", receipt);

      // Refresh the greeting cards list
      await fetchGreetingCards();
      
      setIsLoading(false);
      return receipt;
    } catch (error) {
      console.error("Error minting greeting card:", error);
      setIsLoading(false);
      throw error;
    }
  };
  
  // Helper function to get default image for a festival
  const getDefaultImageForFestival = (festival: string) => {
    const festivalImages = {
      christmas: 'https://ipfs.io/ipfs/QmNtxfy9Mk8qLsdGnraHGk5XDX4MzpQzNz6KWHBpNquGts',
      newyear: 'https://ipfs.io/ipfs/QmYqA8GsxbXeWoJxH2RBuAyFRNqyBJCJb4kByuYBtVCRsf',
      eid: 'https://ipfs.io/ipfs/QmTcM5VyR7SLcBZJ8Qrv8KbRfo2CyYZMXfM7Rz3XDmhG3H',
      sallah: 'https://ipfs.io/ipfs/QmXfnZpQy4U4UgcVwDMgVCTQxCVKLXBgX5Ym4xLSk9wGK1'
    };
    
    return festivalImages[festival as keyof typeof festivalImages] || 
           'https://ipfs.io/ipfs/QmVgAZjazqRrETC9TZzQVNYA25RAEKoMLrEGvNSCxYcEgZ';
  };

  // Fetch greeting cards sent by the user
  const getSentGreetings = async () => {
    try {
      if (!address) return [];

      const festifyContract = getContract({
        abi: FestifyABI.abi,
        address: FESTIFY_CONTRACT_ADDRESS,
        client: publicClient,
      });

      // Get token IDs sent by the user
      const tokenIds = await festifyContract.read.getSentGreetings([address]) as bigint[];
      
      // Get details for each token
      const greetings = await Promise.all(
        tokenIds.map(async (tokenId: bigint) => {
          const tokenURI = await festifyContract.read.tokenURI([tokenId]);
          const festival = await festifyContract.read.getGreetingFestival([tokenId]);
          const recipient = await festifyContract.read.ownerOf([tokenId]);
          
          // Parse metadata from data URI
          let metadata = null;
          try {
            if (typeof tokenURI === 'string' && tokenURI.startsWith('data:application/json;base64,')) {
              const base64Data = tokenURI.replace('data:application/json;base64,', '');
              const jsonString = atob(base64Data);
              metadata = JSON.parse(jsonString);
            }
          } catch (error) {
            console.error("Error parsing metadata:", error);
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

  // Fetch greeting cards received by the user
  const getReceivedGreetings = async () => {
    try {
      if (!address) return [];

      const festifyContract = getContract({
        abi: FestifyABI.abi,
        address: FESTIFY_CONTRACT_ADDRESS,
        client: publicClient,
      });

      // Get token IDs received by the user
      const tokenIds = await festifyContract.read.getReceivedGreetings([address]) as bigint[];
      
      // Get details for each token
      const greetings = await Promise.all(
        tokenIds.map(async (tokenId: bigint) => {
          const tokenURI = await festifyContract.read.tokenURI([tokenId]);
          const festival = await festifyContract.read.getGreetingFestival([tokenId]);
          const sender = await festifyContract.read.getGreetingSender([tokenId]);
          
          // Parse metadata from data URI
          let metadata = null;
          try {
            if (typeof tokenURI === 'string' && tokenURI.startsWith('data:application/json;base64,')) {
              const base64Data = tokenURI.replace('data:application/json;base64,', '');
              const jsonString = atob(base64Data);
              metadata = JSON.parse(jsonString);
            }
          } catch (error) {
            console.error("Error parsing metadata:", error);
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
      
      // Create public client
      const publicClient = createPublicClient({
        chain: hardhat,
        transport: http(),
      });
      
      // Create contract instance
      const contract = getContract({
        address: FESTIFY_CONTRACT_ADDRESS,
        abi: FestifyABI.abi,
        publicClient,
      });
      
      // Get sent tokens
      const sentTokensResult = await contract.read.getSentTokens([address]);
      console.log("Sent tokens result:", sentTokensResult);
      
      // Get received tokens
      const receivedTokensResult = await contract.read.getReceivedTokens([address]);
      console.log("Received tokens result:", receivedTokensResult);
      
      // Process sent tokens
      const sentTokens = Array.isArray(sentTokensResult) ? sentTokensResult : [];
      const sentTokenDetails = await Promise.all(
        sentTokens.map(async (tokenId) => {
          try {
            const tokenURI = await contract.read.tokenURI([tokenId]);
            const festival = await contract.read.getTokenFestival([tokenId]);
            const recipient = await contract.read.getTokenRecipient([tokenId]);
            
            // Parse metadata from tokenURI if it's a data URI using our safe decoder
            const metadata = parseBase64Metadata(tokenURI);
            
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
            const festival = await contract.read.getTokenFestival([tokenId]);
            const sender = await contract.read.getTokenSender([tokenId]);
            
            // Parse metadata from tokenURI if it's a data URI using our safe decoder
            const metadata = parseBase64Metadata(tokenURI);
            
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
    isLoading,
    sentGreetings,
    receivedGreetings,
    getUserAddress,
    mintGreetingCard,
    getSentGreetings,
    getReceivedGreetings,
    fetchGreetingCards,
  };
};
