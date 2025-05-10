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
import { celoAlfajores } from "viem/chains";
import { initializeWeb3Storage, createAndUploadMetadata } from "../utils/web3Storage";

// Contract address for the FestivalGreetings contract
const FESTIFY_CONTRACT_ADDRESS = "0xE8F4699baba6C86DA9729b1B0a1DA1Bd4136eFeF"; // Replace with actual address

// Initialize public client
const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http(),
});

export const useFestify = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isStorageInitialized, setIsStorageInitialized] = useState(false);
  const [sentGreetings, setSentGreetings] = useState<any[]>([]);
  const [receivedGreetings, setReceivedGreetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Web3.Storage on component mount
  useEffect(() => {
    const initStorage = async () => {
      try {
        const initialized = await initializeWeb3Storage();
        setIsStorageInitialized(initialized);
      } catch (error) {
        console.error("Failed to initialize Web3.Storage:", error);
      }
    };
    
    initStorage();
  }, []);

  // Get user's wallet address
  const getUserAddress = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        let walletClient = createWalletClient({
          transport: custom(window.ethereum),
          chain: celoAlfajores,
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
    sender: string,
    imageUrl?: string
  ) => {
    setIsLoading(true);
    try {
      // Ensure Web3.Storage is initialized
      if (!isStorageInitialized) {
        await initializeWeb3Storage();
      }

      // Create and upload metadata to IPFS
      const metadataUrl = await createAndUploadMetadata(
        message,
        festival,
        sender,
        recipient,
        imageUrl
      );

      // Get wallet client
      let walletClient = createWalletClient({
        transport: custom(window.ethereum),
        chain: celoAlfajores,
      });

      let [senderAddress] = await walletClient.getAddresses();

      // Calculate mint fee (0.01 ETH)
      const mintFee = parseEther("0.01");

      // Call the contract to mint the greeting card
      const tx = await walletClient.writeContract({
        address: FESTIFY_CONTRACT_ADDRESS,
        abi: FestifyABI.abi,
        functionName: "mintGreetingCard",
        account: senderAddress,
        args: [recipient, metadataUrl, festival],
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
  const getSentGreetings = async (userAddress?: string) => {
    try {
      const addr = userAddress || address;
      if (!addr) return [];

      const festifyContract = getContract({
        abi: FestifyABI.abi,
        address: FESTIFY_CONTRACT_ADDRESS,
        client: publicClient,
      });

      // Get token IDs sent by the user
      const tokenIds = await festifyContract.read.getSentGreetings([addr]);
      
      // Get details for each token
      const greetings = await Promise.all(
        tokenIds.map(async (tokenId: bigint) => {
          const tokenURI = await festifyContract.read.tokenURI([tokenId]);
          const festival = await festifyContract.read.getGreetingFestival([tokenId]);
          const recipient = await festifyContract.read.ownerOf([tokenId]);
          
          // Fetch metadata from IPFS
          let metadata = null;
          try {
            // Convert IPFS URI to HTTP URL for fetching
            const ipfsUrl = (tokenURI as string).replace("ipfs://", "https://ipfs.io/ipfs/");
            const response = await fetch(ipfsUrl);
            metadata = await response.json();
          } catch (error) {
            console.error("Error fetching metadata:", error);
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
  const getReceivedGreetings = async (userAddress?: string) => {
    try {
      const addr = userAddress || address;
      if (!addr) return [];

      const festifyContract = getContract({
        abi: FestifyABI.abi,
        address: FESTIFY_CONTRACT_ADDRESS,
        client: publicClient,
      });

      // Get token IDs received by the user
      const tokenIds = await festifyContract.read.getReceivedGreetings([addr]);
      
      // Get details for each token
      const greetings = await Promise.all(
        tokenIds.map(async (tokenId: bigint) => {
          const tokenURI = await festifyContract.read.tokenURI([tokenId]);
          const festival = await festifyContract.read.getGreetingFestival([tokenId]);
          const sender = await festifyContract.read.getGreetingSender([tokenId]);
          
          // Fetch metadata from IPFS
          let metadata = null;
          try {
            // Convert IPFS URI to HTTP URL for fetching
            const ipfsUrl = (tokenURI as string).replace("ipfs://", "https://ipfs.io/ipfs/");
            const response = await fetch(ipfsUrl);
            metadata = await response.json();
          } catch (error) {
            console.error("Error fetching metadata:", error);
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
