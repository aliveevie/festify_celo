import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useFestify } from "@/contexts/useFestify";

export default function Header() {
  const [hideConnectBtn, setHideConnectBtn] = useState(false);
  const { connect } = useConnect();
  const { address } = useAccount();
  const { getUserAddress } = useFestify();

  // Sync the wallet address with our context and ensure correct network
  useEffect(() => {
    if (address) {
      console.log("Header: Wallet connected with address:", address);
      // Force update the address in our context
      window.localStorage.setItem('walletAddress', address);
      getUserAddress();
      
      // Check if we're on the correct network (Hardhat)
      const checkAndSwitchNetwork = async () => {
        if (typeof window !== "undefined" && window.ethereum) {
          try {
            // Get current chain ID
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            console.log("Current chain ID:", parseInt(chainId, 16));
            
            // If not on Hardhat network (31337), prompt to switch
            if (parseInt(chainId, 16) !== 31337) {
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
                  }
                } else {
                  console.error("Error switching to Hardhat network:", switchError);
                }
              }
            }
          } catch (error) {
            console.error("Error checking network:", error);
          }
        }
      };
      
      checkAndSwitchNetwork();
    }
  }, [address, getUserAddress]);

  useEffect(() => {
    if (window.ethereum && window.ethereum.isMiniPay) {
      setHideConnectBtn(true);
      connect({ connector: injected({ target: "metaMask" }) });
    }
  }, []);

  return (
    <Disclosure as="nav" className="bg-colors-primary border-b border-black">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-black focus:outline-none focus:ring-1 focus:ring-inset focus:rounded-none focus:ring-black">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Image
                    className="block h-8 w-auto sm:block lg:block"
                    src="/logo.svg"
                    width="24"
                    height="24"
                    alt="Celo Logo"
                  />
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <a
                    href="#"
                    className="inline-flex items-center border-b-2 border-black px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    Home
                  </a>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {!hideConnectBtn && (
                  <ConnectButton
                    showBalance={{
                      smallScreen: true,
                      largeScreen: false,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pt-2 pb-4">
              <Disclosure.Button
                as="a"
                href="#"
                className="block border-l-4 border-black py-2 pl-3 pr-4 text-base font-medium text-black"
              >
                Home
              </Disclosure.Button>
              {/* Add here your custom menu elements */}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
