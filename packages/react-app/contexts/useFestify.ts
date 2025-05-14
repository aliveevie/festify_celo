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
  Chain,
} from "viem";
import { hardhat } from "../providers/hardhatChain";
import { allChains, getChainById } from "../providers/chains";
import { generateGreetingCardSVG } from "../utils/cardGenerator";
import { utf8ToBase64, parseBase64Metadata } from "../utils/base64Utils";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import { initializeWeb3Storage, createAndUploadMetadata } from "../utils/web3Storage";

// Type for our contract
type FestifyContract = GetContractReturnType<typeof FestifyABI.abi, PublicClient>;

export const useFestify = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sentGreetings, setSentGreetings] = useState<any[]>([]);
  const [receivedGreetings, setReceivedGreetings] = useState<any[]>([]);
  const [currentChainId, setCurrentChainId] = useState<number>(31337); // Default to Hardhat
  const [currentChain, setCurrentChain] = useState<Chain>(hardhat);
  const [web3StorageInitialized, setWeb3StorageInitialized] = useState(false);

  // Initialize Web3.Storage when component mounts
  useEffect(() => {
    const initStorage = async () => {
      try {
        const initialized = await initializeWeb3Storage();
        setWeb3StorageInitialized(initialized);
        console.log("Web3.Storage initialized:", initialized);
      } catch (error) {
        console.error("Failed to initialize Web3.Storage:", error);
      }
    };
    
    initStorage();
  }, []);

  // Get the contract address for the current chain
  const getContractAddress = (): string => {
    return CONTRACT_ADDRESSES[currentChainId] || "";
  };

  // Initialize public client for the current chain
  const getPublicClient = (): PublicClient => {
    return createPublicClient({
      chain: currentChain,
      transport: http(),
    }) as PublicClient;
  };

  // Update the current chain based on the wallet's chain ID
  const updateCurrentChain = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const chainId = parseInt(chainIdHex, 16);
        console.log("Current chain ID from wallet:", chainId);
        
        const chain = getChainById(chainId);
        if (chain) {
          setCurrentChainId(chainId);
          setCurrentChain(chain);
          console.log("Updated current chain to:", chain.name);
        } else {
          console.warn("Unknown chain ID:", chainId);
          // Default to Hardhat if chain is not supported
          setCurrentChainId(31337);
          setCurrentChain(hardhat);
        }
      } catch (error) {
        console.error("Error getting chain ID:", error);
      }
    }
  };

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
          
          // Set up event listener for chain changes
          window.ethereum.on('chainChanged', (chainIdHex: string) => {
            console.log("Chain changed:", chainIdHex);
            const chainId = parseInt(chainIdHex, 16);
            updateCurrentChain();
          });
          
          // Update current chain
          await updateCurrentChain();
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
      setIsLoading(true);
      
      // Generate a beautiful SVG greeting card
      const svgDataUrl = generateGreetingCardSVG(festival, message, address || "", recipient);
      console.log("Generated SVG greeting card for recipient");
      
      // Try to use Web3.Storage to upload metadata to IPFS
      let metadataUri;
      try {
        if (!web3StorageInitialized) {
          await initializeWeb3Storage();
          setWeb3StorageInitialized(true);
        }
        
        // Create and upload metadata to IPFS
        metadataUri = await createAndUploadMetadata(
          message,
          festival,
          address || "",
          recipient,
          svgDataUrl
        );
        console.log("Metadata uploaded to IPFS:", metadataUri);
      } catch (ipfsError) {
        console.error("Failed to upload to IPFS, falling back to data URI:", ipfsError);
        
        // Fallback to data URI method if IPFS upload fails
        const metadata = {
          name: `${festival.charAt(0).toUpperCase() + festival.slice(1)} Greeting`,
          description: message,
          image: svgDataUrl,
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
        
        // Convert metadata to URI format using UTF-8 safe encoding
        metadataUri = `data:application/json;base64,${utf8ToBase64(JSON.stringify(metadata))}`;
      }
      
      console.log("Final metadata URI:", metadataUri);

      // Get the contract address for the current chain
      const contractAddress = getContractAddress();
      if (!contractAddress) {
        throw new Error(`No contract deployed on the current network (Chain ID: ${currentChainId})`);
      }

      // Check if we're on the correct network
      if (typeof window !== "undefined" && window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const walletChainId = parseInt(chainId, 16);
        console.log("useFestify: Current chain ID before minting:", walletChainId);
        
        if (walletChainId !== currentChainId) {
          console.log(`Not on ${currentChain.name} network, attempting to switch...`);
          try {
            // Try to switch to the current network
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${currentChainId.toString(16)}` }],
            });
            console.log(`Successfully switched to ${currentChain.name} network`);
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: `0x${currentChainId.toString(16)}`,
                      chainName: currentChain.name,
                      nativeCurrency: currentChain.nativeCurrency,
                      rpcUrls: [currentChain.rpcUrls.default.http[0]],
                      blockExplorerUrls: currentChain.blockExplorers ? 
                        [currentChain.blockExplorers.default.url] : []
                    },
                  ],
                });
                console.log(`Added ${currentChain.name} network to wallet`);
              } catch (addError) {
                console.error(`Error adding ${currentChain.name} network:`, addError);
                throw new Error(`Failed to add ${currentChain.name} network to your wallet. Please add it manually.`);
              }
            } else {
              console.error(`Error switching to ${currentChain.name} network:`, switchError);
              throw new Error(`Please switch to the ${currentChain.name} network (Chain ID: ${currentChainId}) in your wallet to mint greeting cards.`);
            }
          }
        }
      }
      
      // Get wallet client for the current chain
      let walletClient = createWalletClient({
        transport: custom(window.ethereum),
        chain: currentChain,
      });

      // Calculate mint fee (0.01 ETH)
      const mintFee = parseEther("0.01");
      
      console.log("Calling smart contract to mint greeting card...");
      console.log("Contract address:", contractAddress);
      console.log("Parameters:", { recipient, metadataUri, festival, mintFee: mintFee.toString() });

      // Call the contract to mint the greeting card
      // Convert senderAddress to the correct format (0x-prefixed string)
      const formattedAddress = address as `0x${string}`;
      
      const tx = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: FestifyABI.abi,
        functionName: "mintGreetingCard",
        account: formattedAddress,
        args: [recipient as `0x${string}`, metadataUri, festival],
        value: mintFee,
      });
      
      console.log("Transaction hash:", tx);
      
      // Wait for transaction to be mined
      const publicClient = getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("Transaction receipt:", receipt);
      
      // Add detailed debugging for the transaction
      console.log("Transaction successful to contract address:", contractAddress);
      console.log("Recipient address that should receive the NFT:", recipient);
      
      try {
        // Check if the NFT was actually minted and transferred to the recipient
        const festifyContract = getContract({
          abi: FestifyABI.abi,
          address: contractAddress as `0x${string}`,
          client: publicClient,
        }) as FestifyContract;
        
        // Get the latest token ID (should be the one just minted)
        // We can estimate this as the current nextTokenId - 1
        const latestTokenId = await festifyContract.read.balanceOf([recipient as `0x${string}`]);
        console.log(`Recipient ${recipient} now has ${latestTokenId} tokens`);
        
        // Try to get the owner of the latest token
        try {
          // We don't know the exact token ID, so let's check the recipient's received tokens
          const receivedTokens = await festifyContract.read.getReceivedGreetings([recipient as `0x${string}`]) as bigint[];
          console.log("Recipient's tokens:", receivedTokens);
          
          if (receivedTokens && receivedTokens.length > 0) {
            const latestToken = receivedTokens[receivedTokens.length - 1];
            console.log("Latest token ID:", latestToken.toString());
            
            // Get the owner of this token
            const owner = await festifyContract.read.ownerOf([latestToken]) as `0x${string}`;
            console.log(`Token ${latestToken} is owned by: ${owner}`);
            
            // Verify it matches the recipient
            if (owner.toLowerCase() === (recipient as string).toLowerCase()) {
              console.log("✅ NFT successfully transferred to recipient!");
              
              // Show instructions for adding to MetaMask
              console.log("To view this NFT in MetaMask:");
              console.log(`1. Open MetaMask and go to NFTs tab`);
              console.log(`2. Click "Import NFT"`);
              console.log(`3. Enter Contract Address: ${contractAddress}`);
              console.log(`4. Enter Token ID: ${latestToken.toString()}`);
              console.log(`5. Click "Import"`);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Get greeting cards sent by the user
  const getSentGreetings = async () => {
    try {
      if (!address) return [];

      const contractAddress = getContractAddress();
      if (!contractAddress) {
        console.error(`No contract deployed on the current network (Chain ID: ${currentChainId})`);
        return [];
      }

      // Create contract instance with proper typing
      const publicClient = getPublicClient();
      const festifyContract = getContract({
        abi: FestifyABI.abi,
        address: contractAddress as `0x${string}`,
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

      const contractAddress = getContractAddress();
      if (!contractAddress) {
        console.error(`No contract deployed on the current network (Chain ID: ${currentChainId})`);
        return [];
      }

      // Create contract instance with proper typing
      const publicClient = getPublicClient();
      const festifyContract = getContract({
        abi: FestifyABI.abi,
        address: contractAddress as `0x${string}`,
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
      
      const contractAddress = getContractAddress();
      if (!contractAddress) {
        console.error(`No contract deployed on the current network (Chain ID: ${currentChainId})`);
        setSentGreetings([]);
        setReceivedGreetings([]);
        setIsLoading(false);
        return;
      }
      
      // Create public client with proper typing
      const publicClient = getPublicClient();
      
      // Create contract instance with proper typing
      const contract = getContract({
        address: contractAddress as `0x${string}`,
        abi: FestifyABI.abi,
        client: publicClient,
      }) as FestifyContract;
      
      // Get sent tokens
      console.log('Contract address being used:', contractAddress);
      let sentTokensResult: bigint[] = [];
      try {
        sentTokensResult = await contract.read.getSentGreetings([address as `0x${string}`]) as bigint[];
        console.log("Sent tokens result:", sentTokensResult);
      } catch (error) {
        console.error("Error fetching sent greetings:", error);
        sentTokensResult = [];
      }
      
      // Get received tokens
      let receivedTokensResult: bigint[] = [];
      try {
        receivedTokensResult = await contract.read.getReceivedGreetings([address as `0x${string}`]) as bigint[];
        console.log("Received tokens result:", receivedTokensResult);
      } catch (error) {
        console.error("Error fetching received greetings:", error);
        receivedTokensResult = [];
      }
      
      // Process sent tokens
      const sentTokens = Array.isArray(sentTokensResult) ? sentTokensResult : [];
      const sentTokenDetails = await Promise.all(
        sentTokens.map(async (tokenId) => {
          try {
            // Wrap each contract call in try/catch to handle potential errors
            let tokenURI, festival, recipient;
            try {
              tokenURI = await contract.read.tokenURI([tokenId]);
            } catch (error) {
              console.error(`Error fetching tokenURI for token ${tokenId}:`, error);
              tokenURI = "";
            }
            
            try {
              festival = await contract.read.getGreetingFestival([tokenId]);
            } catch (error) {
              console.error(`Error fetching festival for token ${tokenId}:`, error);
              festival = "";
            }
            
            try {
              recipient = await contract.read.ownerOf([tokenId]);
            } catch (error) {
              console.error(`Error fetching owner for token ${tokenId}:`, error);
              recipient = "0x0000000000000000000000000000000000000000";
            }
            
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
            // Wrap each contract call in try/catch to handle potential errors
            let tokenURI, festival, sender;
            try {
              tokenURI = await contract.read.tokenURI([tokenId]);
            } catch (error) {
              console.error(`Error fetching tokenURI for token ${tokenId}:`, error);
              tokenURI = "";
            }
            
            try {
              festival = await contract.read.getGreetingFestival([tokenId]);
            } catch (error) {
              console.error(`Error fetching festival for token ${tokenId}:`, error);
              festival = "";
            }
            
            try {
              sender = await contract.read.getGreetingSender([tokenId]);
            } catch (error) {
              console.error(`Error fetching sender for token ${tokenId}:`, error);
              sender = "0x0000000000000000000000000000000000000000";
            }
            
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

  // Fetch greeting cards when chain changes
  useEffect(() => {
    if (address && currentChainId) {
      fetchGreetingCards();
    }
  }, [currentChainId]);

  return {
    address,
    isConnected,
    isLoading,
    sentGreetings,
    receivedGreetings,
    currentChainId,
    currentChain,
    getUserAddress,
    mintGreetingCard,
    fetchGreetingCards,
    updateCurrentChain,
    getContractAddress,
  };
};
