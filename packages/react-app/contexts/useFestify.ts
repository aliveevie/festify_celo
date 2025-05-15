import { useEffect, useState, useCallback } from "react";
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
import { useAccount, usePublicClient, useWalletClient, useChainId } from "wagmi";
import { allChains } from "../providers/chains";
import { generateGreetingCardSVG } from "../utils/cardGenerator";
import { utf8ToBase64, parseBase64Metadata } from "../utils/base64Utils";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import { initializeWeb3Storage, createAndUploadMetadata } from "../utils/web3Storage";

// Define supported networks
export const SUPPORTED_NETWORKS = {
  CELO_MAINNET: 42220,
  CELO_TESTNET: 44787,
  OPTIMISM_MAINNET: 10,
  OPTIMISM_TESTNET: 420,
} as const;

type SupportedChainId = typeof SUPPORTED_NETWORKS[keyof typeof SUPPORTED_NETWORKS];

// Type for our contract
type FestifyContract = GetContractReturnType<typeof FestifyABI.abi, PublicClient>;

export const useFestify = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [sentGreetings, setSentGreetings] = useState<any[]>([]);
  const [receivedGreetings, setReceivedGreetings] = useState<any[]>([]);
  const [web3StorageInitialized, setWeb3StorageInitialized] = useState(false);

  // Check if current network is supported
  const isNetworkSupported = useCallback((chainId: number): chainId is SupportedChainId => {
    return Object.values(SUPPORTED_NETWORKS).includes(chainId as SupportedChainId);
  }, []);

  // Get network name
  const getNetworkName = useCallback((chainId: number): string => {
    switch (chainId) {
      case SUPPORTED_NETWORKS.CELO_MAINNET:
        return 'Celo Mainnet';
      case SUPPORTED_NETWORKS.CELO_TESTNET:
        return 'Celo Alfajores Testnet';
      case SUPPORTED_NETWORKS.OPTIMISM_MAINNET:
        return 'Optimism';
      case SUPPORTED_NETWORKS.OPTIMISM_TESTNET:
        return 'Optimism Goerli Testnet';
      default:
        return 'Unsupported Network';
    }
  }, []);

  // Get the contract address for the current chain
  const getContractAddress = useCallback((): string => {
    if (!chainId || !isNetworkSupported(chainId)) return "";
    return CONTRACT_ADDRESSES[chainId] || "";
  }, [chainId, isNetworkSupported]);

  // Mint a new greeting card
  const mintGreetingCard = async (
    recipient: string,
    message: string,
    festival: string,
    imageUrl?: string
  ) => {
    try {
      if (!chainId) {
        throw new Error("Please connect your wallet to continue.");
      }

      if (!isNetworkSupported(chainId)) {
        throw new Error(`Please switch to a supported network (${Object.values(SUPPORTED_NETWORKS).map(id => getNetworkName(id)).join(', ')}).`);
      }

      const contractAddress = getContractAddress();
      if (!contractAddress) {
        throw new Error(`No contract deployed on ${getNetworkName(chainId)}. Please switch to a supported network.`);
      }

      if (!walletClient) {
        throw new Error("Wallet not connected. Please connect your wallet to continue.");
      }

      setIsLoading(true);
      
      // Generate SVG and metadata
      const svgDataUrl = generateGreetingCardSVG(festival, message, address || "", recipient);
      let metadataUri;
      try {
        if (!web3StorageInitialized) {
          await initializeWeb3Storage();
          setWeb3StorageInitialized(true);
        }
        metadataUri = await createAndUploadMetadata(
          message,
          festival,
          address || "",
          recipient,
          svgDataUrl
        );
      } catch (ipfsError) {
        const metadata = {
          name: `${festival.charAt(0).toUpperCase() + festival.slice(1)} Greeting`,
          description: message,
          image: svgDataUrl,
          attributes: [
            { trait_type: "Festival", value: festival },
            { trait_type: "Sender", value: address },
            { trait_type: "Recipient", value: recipient },
            { trait_type: "Created", value: new Date().toISOString() },
          ],
        };
        metadataUri = `data:application/json;base64,${utf8ToBase64(JSON.stringify(metadata))}`;
      }

      const mintFee = parseEther("0.01");
      const formattedAddress = address as `0x${string}`;
      const tx = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: FestifyABI.abi,
        functionName: "mintGreetingCard",
        account: formattedAddress,
        args: [recipient as `0x${string}`, metadataUri, festival],
        value: mintFee,
      });

      if (!publicClient) throw new Error("Failed to initialize public client");
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      await fetchGreetingCards();
      return receipt;
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch greeting cards (sent/received)
  const fetchGreetingCards = useCallback(async () => {
    if (!address || !chainId || !publicClient) return;
    setIsLoading(true);
    try {
      const contractAddress = getContractAddress();
      if (!contractAddress) {
        setSentGreetings([]);
        setReceivedGreetings([]);
        return;
      }

      const contract = getContract({
        address: contractAddress as `0x${string}`,
        abi: FestifyABI.abi,
        publicClient,
      }) as FestifyContract;

      // Sent
      let sentTokensResult: bigint[] = [];
      try {
        sentTokensResult = await contract.read.getSentGreetings([address as `0x${string}`]);
      } catch { sentTokensResult = []; }

      // Received
      let receivedTokensResult: bigint[] = [];
      try {
        receivedTokensResult = await contract.read.getReceivedGreetings([address as `0x${string}`]);
      } catch { receivedTokensResult = []; }

      // Sent details
      const sentTokenDetails = await Promise.all(
        sentTokensResult.map(async (tokenId) => {
          let tokenURI = "", festival = "", recipient = "";
          try { tokenURI = String(await contract.read.tokenURI([tokenId])); } catch {}
          try { festival = String(await contract.read.getGreetingFestival([tokenId])); } catch {}
          try { recipient = String(await contract.read.ownerOf([tokenId])); } catch {}
          const metadata = parseBase64Metadata(tokenURI);
          return { tokenId: tokenId.toString(), tokenURI, festival, recipient, metadata };
        })
      );

      // Received details
      const receivedTokenDetails = await Promise.all(
        receivedTokensResult.map(async (tokenId) => {
          let tokenURI = "", festival = "", sender = "";
          try { tokenURI = String(await contract.read.tokenURI([tokenId])); } catch {}
          try { festival = String(await contract.read.getGreetingFestival([tokenId])); } catch {}
          try { sender = String(await contract.read.getGreetingSender([tokenId])); } catch {}
          const metadata = parseBase64Metadata(tokenURI);
          return { tokenId: tokenId.toString(), tokenURI, festival, sender, metadata };
        })
      );

      setSentGreetings(sentTokenDetails.filter(Boolean));
      setReceivedGreetings(receivedTokenDetails.filter(Boolean));
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId, publicClient, getContractAddress]);

  // Fetch on mount and when address/chain changes
  useEffect(() => {
    fetchGreetingCards();
  }, [fetchGreetingCards]);

  return {
    address,
    isConnected,
    isLoading,
    sentGreetings,
    receivedGreetings,
    chainId,
    isNetworkSupported,
    getNetworkName,
    getContractAddress,
    mintGreetingCard,
    fetchGreetingCards,
  };
};
