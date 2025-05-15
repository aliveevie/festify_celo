import { Disclosure } from "@headlessui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

export default function Header() {
  const [hideConnectBtn, setHideConnectBtn] = useState(false);
  const { connect } = useConnect();
  const { address } = useAccount();

  // Sync the wallet address with our context
  useEffect(() => {
    if (address) {
      window.localStorage.setItem('walletAddress', address);
    }
  }, [address]);

  useEffect(() => {
    if (window.ethereum && window.ethereum.isMiniPay) {
      setHideConnectBtn(true);
      connect({ connector: injected({ target: "metaMask" }) });
    }
  }, []);

  return (
    <Disclosure as="nav" className="bg-colors-primary border-b border-black">
      {() => (
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 justify-between items-center">
            {/* Festify Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold tracking-tight text-black select-none">Festify</span>
            </div>
            {/* Wallet Connect Buttons */}
            <div className="flex items-center space-x-4">
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
      )}
    </Disclosure>
  );
}
