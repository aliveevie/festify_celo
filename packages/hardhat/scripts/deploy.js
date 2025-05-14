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
    
    // Update the contract address in the CONTRACT_ADDRESSES mapping
    const regex = new RegExp(`(${chainId}:)\s*"([^"]*)"`, 'g'); // Match the chain ID entry
    
    // Test if the chain ID exists in the mapping
    if (useFestifyContent.includes(`${chainId}:`)) {
      // If the chain ID exists in the mapping, update its address
      useFestifyContent = useFestifyContent.replace(
        new RegExp(`(${chainId}:)\s*"([^"]*)"`, 'g'), 
        `$1 "${contractAddress}"`
      );
      console.log(`Updated contract address for chain ID ${chainId} to ${contractAddress}`);
    } else {
      console.log(`Chain ID ${chainId} not found in CONTRACT_ADDRESSES mapping. Please add it manually.`);
    }
    
    fs.writeFileSync(useFestifyPath, useFestifyContent);
    console.log("Updated contract addresses in useFestify.ts");
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