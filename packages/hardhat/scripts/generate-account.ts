import { ethers } from "ethers";

// Generate a random account
function generateRandomAccount() {
  const wallet = ethers.Wallet.createRandom();
  
  console.log("New account generated:");
  console.log(`Address: ${wallet.address}`);
  console.log(`Private Key: ${wallet.privateKey}`);
  console.log(`Mnemonic: ${wallet.mnemonic?.phrase}`);
  
  return wallet;
}

// Generate account from an existing private key
function generateAccountFromPrivateKey(privateKey: string) {
  try {
    const wallet = new ethers.Wallet(privateKey);
    
    console.log("Account from private key:");
    console.log(`Address: ${wallet.address}`);
    console.log(`Private Key: ${privateKey}`);
    
    return wallet;
  } catch (error) {
    console.error("Invalid private key:", error);
    return null;
  }
}

// Main function
async function main() {
  console.log("Generating a new random account...");
  const randomWallet = generateRandomAccount();
  
  console.log("\n-----------------------------------\n");
  
  // Check if a private key was provided as an argument
  const providedPrivateKey = process.argv[2];
  if (providedPrivateKey) {
    console.log("Generating account from provided private key...");
    generateAccountFromPrivateKey(providedPrivateKey);
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
