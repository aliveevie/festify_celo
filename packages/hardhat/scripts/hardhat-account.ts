import { ethers } from "ethers";

async function main() {
  // Generate a random account using Hardhat's ethers
  const randomWallet = ethers.Wallet.createRandom();
  console.log("New random account generated with Hardhat:");
  console.log(`Address: ${randomWallet.address}`);
  console.log(`Private Key: ${randomWallet.privateKey}`);
  console.log(`Mnemonic: ${randomWallet.mnemonic?.phrase}`);
  
  // Show how to import this account into Hardhat config
  console.log("\n-----------------------------------\n");
  console.log("To use this account in your Hardhat config:");
  console.log(`
1. Add the private key to your .env file:
PRIVATE_KEY=${randomWallet.privateKey}

2. Make sure your hardhat.config.ts loads it:
networks: {
  networkName: {
    accounts: [process.env.PRIVATE_KEY ?? '0x0'],
    url: 'YOUR_RPC_URL',
  },
},
`);

  // Show how to update your .env file
  console.log("\n-----------------------------------\n");
  console.log("Important: Make sure to keep your private key secure and never commit it to version control!");
  console.log("Add the following line to your .env file:");
  console.log(`PRIVATE_KEY=${randomWallet.privateKey}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
