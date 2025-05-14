// Script to deploy contracts and update ABI files
const hre = require("hardhat");
const { updateABI } = require("./update-abi");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("Starting deployment process...");

  // Get the contract factory
  const FestivalGreetings = await hre.ethers.getContractFactory("FestivalGreetings");
  
  // Deploy the contract
  console.log("Deploying FestivalGreetings contract...");
  const festivalGreetings = await FestivalGreetings.deploy();
  await festivalGreetings.waitForDeployment();
  
  // Get the contract address
  const contractAddress = await festivalGreetings.getAddress();
  console.log(`FestivalGreetings deployed to: ${contractAddress}`);
  
  // Update the contract address in the react-app context
  const useFestifyPath = path.join(__dirname, "../../react-app/contexts/useFestify.ts");
  
  if (fs.existsSync(useFestifyPath)) {
    let useFestifyContent = fs.readFileSync(useFestifyPath, "utf8");
    
    // Get the current network information
    const networkName = hre.network.name;
    let chainId = hre.network.config.chainId;
    
    // For localhost, hardcode the chainId to 31337 (Hardhat's default)
    if (networkName === "localhost" || networkName === "hardhat") {
      chainId = 31337;
    }
    
    console.log(`Deployed to network: ${networkName} (Chain ID: ${chainId})`);
    
    // Look for the CONTRACT_ADDRESSES mapping in the file
    const contractAddressesRegex = /const CONTRACT_ADDRESSES: Record<number, string> = {([^}]*)}/s;
    const contractAddressesMatch = useFestifyContent.match(contractAddressesRegex);
    
    if (contractAddressesMatch) {
      // The mapping exists, update the specific chain ID entry
      const currentMapping = contractAddressesMatch[1];
      
      // Check if the chain ID already exists in the mapping
      const chainIdRegex = new RegExp(`(\\s*${chainId}:\\s*)"([^"]*)"`, 'g');
      const chainIdExists = chainIdRegex.test(currentMapping);
      
      if (chainIdExists) {
        // Update the existing chain ID entry
        const updatedMapping = currentMapping.replace(
          new RegExp(`(\\s*${chainId}:\\s*)"([^"]*)"`, 'g'),
          `$1"${contractAddress}"`
        );
        
        // Replace the entire mapping
        useFestifyContent = useFestifyContent.replace(
          contractAddressesRegex,
          `const CONTRACT_ADDRESSES: Record<number, string> = {${updatedMapping}}`
        );
        
        console.log(`Updated contract address for chain ID ${chainId} to ${contractAddress}`);
      } else {
        // Add a new entry for this chain ID
        const updatedMapping = currentMapping + `\n  ${chainId}: "${contractAddress}",`;
        
        // Replace the entire mapping
        useFestifyContent = useFestifyContent.replace(
          contractAddressesRegex,
          `const CONTRACT_ADDRESSES: Record<number, string> = {${updatedMapping}}`
        );
        
        console.log(`Added new contract address for chain ID ${chainId}: ${contractAddress}`);
      }
      
      fs.writeFileSync(useFestifyPath, useFestifyContent);
      console.log("Updated contract addresses in useFestify.ts");
    } else {
      console.log("CONTRACT_ADDRESSES mapping not found in useFestify.ts, skipping contract address update");
    }
  } else {
    console.log("useFestify.ts not found, skipping contract address update");
  }
  
  // Update the ABI file
  await updateABI();
  
  console.log("Deployment and ABI update completed successfully!");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });