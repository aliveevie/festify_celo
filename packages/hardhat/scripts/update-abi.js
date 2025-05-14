// Script to update the ABI file in the react-app context after contract deployment
const fs = require('fs');
const path = require('path');

// Possible paths to the contract artifacts
const possibleArtifactPaths = [
  path.join(__dirname, '../artifacts/contracts'),
  path.join(__dirname, '../artifacts'),
  path.join(__dirname, '../build/contracts')
];
// Path to the react-app ABI file
const abiFilePath = path.join(__dirname, '../../react-app/contexts/festify-abi.json');

async function updateABI() {
  try {
    console.log('Updating ABI file...');
    
    let contractArtifact = null;
    
    // Try each possible artifact path
    for (const artifactPath of possibleArtifactPaths) {
      if (!fs.existsSync(artifactPath)) {
        console.log(`Path ${artifactPath} does not exist, trying next...`);
        continue;
      }
      
      console.log(`Searching for contract artifacts in ${artifactPath}...`);
      
      // Check if this is a directory with contract folders or direct artifacts
      const stats = fs.statSync(artifactPath);
      
      if (stats.isDirectory()) {
        const items = fs.readdirSync(artifactPath);
        
        // First, try to find FestivalGreetings.json directly
        if (items.includes('FestivalGreetings.json')) {
          console.log('Found FestivalGreetings.json directly');
          contractArtifact = JSON.parse(
            fs.readFileSync(path.join(artifactPath, 'FestivalGreetings.json'), 'utf8')
          );
          break;
        }
        
        // Otherwise, search through subdirectories
        for (const item of items) {
          const itemPath = path.join(artifactPath, item);
          
          if (fs.statSync(itemPath).isDirectory()) {
            // Check if this directory contains our contract
            if (item.includes('FestivalGreetings') || item.includes('FestivalGreetings.sol') || item.includes('Festify.sol')) {
              const files = fs.readdirSync(itemPath);
              for (const file of files) {
                if (file.endsWith('.json') && !file.includes('.dbg.')) {
                  console.log(`Found contract artifact at ${path.join(itemPath, file)}`);
                  contractArtifact = JSON.parse(
                    fs.readFileSync(path.join(itemPath, file), 'utf8')
                  );
                  break;
                }
              }
            }
          } else if (itemPath.endsWith('.json') && 
                    (item.includes('FestivalGreetings') || item.includes('FestivalGreetings.sol') || item.includes('Festify.sol')) && 
                    !item.includes('.dbg.')) {
            console.log(`Found contract artifact at ${itemPath}`);
            contractArtifact = JSON.parse(fs.readFileSync(itemPath, 'utf8'));
            break;
          }
          
          if (contractArtifact) break;
        }
      }
      
      if (contractArtifact) break;
    }
    
    if (!contractArtifact) {
      console.error('Contract artifact not found');
      return;
    }
    
    // Extract the ABI
    const { abi } = contractArtifact;
    
    // Create the ABI file content
    const abiFileContent = {
      abi
    };
    
    // Write the ABI file
    fs.writeFileSync(abiFilePath, JSON.stringify(abiFileContent, null, 2));
    
    console.log('ABI file updated successfully!');
  } catch (error) {
    console.error('Error updating ABI file:', error);
  }
}

// Export the function to be used in other scripts
module.exports = { updateABI };

// If this script is run directly
if (require.main === module) {
  updateABI()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
