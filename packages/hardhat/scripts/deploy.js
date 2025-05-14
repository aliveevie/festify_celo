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
  
    // Get the current network information
    const networkName = hre.network.name;
    let chainId = hre.network.config.chainId;
    
    // For localhost, hardcode the chainId to 31337 (Hardhat's default)
    if (networkName === "localhost" || networkName === "hardhat") {
      chainId = 31337;
    }
    
    console.log(`Deployed to network: ${networkName} (Chain ID: ${chainId})`);
    
  // Update the contract address in the config file
  const contractsConfigPath = path.join(__dirname, "../../react-app/config/contracts.ts");
  
  // Create the config directory if it doesn't exist
  const configDir = path.dirname(contractsConfigPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Check if the contracts config file exists
  let contractsConfig = "";
  if (fs.existsSync(contractsConfigPath)) {
    contractsConfig = fs.readFileSync(contractsConfigPath, "utf8");
    
    // Look for the CONTRACT_ADDRESSES mapping in the file
    const contractAddressesRegex = /export const CONTRACT_ADDRESSES: Record<number, string> = {([^}]*)}/s;
    const contractAddressesMatch = contractsConfig.match(contractAddressesRegex);
    
    if (contractAddressesMatch) {
      // The mapping exists, update the specific chain ID entry
      const currentMapping = contractAddressesMatch[1];
      
      // Check if the chain ID already exists in the mapping
      const chainIdRegex = new RegExp(`(\\s*${chainId}:\\s*)[^,]*`, 'g');
      const chainIdExists = chainIdRegex.test(currentMapping);
      
      if (chainIdExists) {
        // Update the existing chain ID entry
        const updatedMapping = currentMapping.replace(
          new RegExp(`(\\s*${chainId}:\\s*)[^,]*`, 'g'),
          `$1process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_${getNetworkEnvName(networkName)} || "${contractAddress}"`
        );
        
        // Replace the entire mapping
        contractsConfig = contractsConfig.replace(
          contractAddressesRegex,
          `export const CONTRACT_ADDRESSES: Record<number, string> = {${updatedMapping}}`
        );
        
        console.log(`Updated contract address for chain ID ${chainId} to ${contractAddress} in contracts.ts`);
      } else {
        // Add a new entry for this chain ID
        const updatedMapping = currentMapping + `\n  ${chainId}: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_${getNetworkEnvName(networkName)} || "${contractAddress}",`;
        
        // Replace the entire mapping
        contractsConfig = contractsConfig.replace(
          contractAddressesRegex,
          `export const CONTRACT_ADDRESSES: Record<number, string> = {${updatedMapping}}`
        );
        
        console.log(`Added new contract address for chain ID ${chainId}: ${contractAddress} in contracts.ts`);
      }
    } else {
      // Create the mapping from scratch
      contractsConfig = `// Contract addresses for different networks
export const CONTRACT_ADDRESSES: Record<number, string> = {
  // ${networkName.charAt(0).toUpperCase() + networkName.slice(1)}
  ${chainId}: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_${getNetworkEnvName(networkName)} || "${contractAddress}"
};
`;
      console.log(`Created new CONTRACT_ADDRESSES mapping in contracts.ts with chain ID ${chainId}: ${contractAddress}`);
    }
  } else {
    // Create the file from scratch
    contractsConfig = `// Contract addresses for different networks
export const CONTRACT_ADDRESSES: Record<number, string> = {
  // ${networkName.charAt(0).toUpperCase() + networkName.slice(1)}
  ${chainId}: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_${getNetworkEnvName(networkName)} || "${contractAddress}"
};
`;
    console.log(`Created new contracts.ts file with chain ID ${chainId}: ${contractAddress}`);
  }
  
  // Write the updated config
  fs.writeFileSync(contractsConfigPath, contractsConfig);
  
  // Also update the .env.local file with the new contract address
  const envLocalPath = path.join(__dirname, "../../react-app/.env.local");
  
  try {
    let envContent = "";
    if (fs.existsSync(envLocalPath)) {
      envContent = fs.readFileSync(envLocalPath, "utf8");
    }
    
    const envVarName = `NEXT_PUBLIC_CONTRACT_ADDRESS_${getNetworkEnvName(networkName)}`;
    const envVarRegex = new RegExp(`^${envVarName}=.*$`, 'm');
    
    if (envVarRegex.test(envContent)) {
      // Update existing entry
      envContent = envContent.replace(
        envVarRegex,
        `${envVarName}="${contractAddress}"`
      );
    } else {
      // Add new entry
      envContent += `\n${envVarName}="${contractAddress}"`;
    }
    
    fs.writeFileSync(envLocalPath, envContent);
    console.log(`Updated ${envVarName} in .env.local to ${contractAddress}`);
  } catch (error) {
    console.log(`Could not update .env.local file: ${error.message}`);
    console.log("Please manually add the following line to your .env.local file:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS_${getNetworkEnvName(networkName)}="${contractAddress}"`);
  }
  
  // Update the ABI file
  await updateABI();
  
  console.log("Deployment and updates completed successfully!");
  console.log("==============================================");
  console.log(`Network: ${networkName} (Chain ID: ${chainId})`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log("==============================================");
}

// Helper function to get the environment variable name for a network
function getNetworkEnvName(networkName) {
  const networkMap = {
    hardhat: "HARDHAT",
    localhost: "HARDHAT",
    celo: "CELO",
    alfajores: "ALFAJORES",
    optimism: "OPTIMISM",
    "optimism-goerli": "OPTIMISM_GOERLI"
  };
  
  return networkMap[networkName] || networkName.toUpperCase();
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });