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

// Contract address for the FestivalGreetings contract - replace with your deployed contract address
const FESTIFY_CONTRACT_ADDRESS = "0xE8F4699baba6C86DA9729b1B0a1DA1Bd4136eFeF";

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
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        let walletClient = createWalletClient({
          transport: custom(window.ethereum),
          chain: hardhat,
        });

        let [address] = await walletClient.getAddresses();
        setAddress(address);
        return address;
      } catch (error) {
        console.error("Error getting user address:", error);
        return null;
      }
    }
    return null;
  };

  // Create and mint a new greeting card NFT
  const mintGreetingCard = async (
    recipient: string,
    message: string,
    festival: string,
    imageUrl?: string
  ) => {
    if (!address) {
      throw new Error("Please connect your wallet first");
    }
    
    setIsLoading(true);
    try {
      // Create metadata for the greeting card
      const metadata = {
        name: `${festival.charAt(0).toUpperCase() + festival.slice(1)} Greeting`,
        description: message,
        image: imageUrl || getDefaultImageForFestival(festival),
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

      // Convert metadata to URI format (in a real app, this would be uploaded to IPFS)
      const metadataUri = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

      // Get wallet client
      let walletClient = createWalletClient({
        transport: custom(window.ethereum),
        chain: hardhat,
      });

      // Calculate mint fee (0.01 ETH)
      const mintFee = parseEther("0.01");

      // Call the contract to mint the greeting card
      const tx = await walletClient.writeContract({
        address: FESTIFY_CONTRACT_ADDRESS,
        abi: FestifyABI.abi,
        functionName: "mintGreetingCard",
        account: address,
        args: [recipient, metadataUri, festival],
        value: mintFee,
      });

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

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
    if (!address) {
      await getUserAddress();
      return;
    }
    
    const sent = await getSentGreetings();
    const received = await getReceivedGreetings();
    
    setSentGreetings(sent);
    setReceivedGreetings(received);
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
