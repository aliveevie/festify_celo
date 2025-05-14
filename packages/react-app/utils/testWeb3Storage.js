/**
 * Test script for Web3.Storage (Storacha) integration
 * Run this with: node testWeb3Storage.js
 */
const { create } = require("@web3-storage/w3up-client");

// Email used for authentication
const AUTH_EMAIL = "arbilearn.club@gmail.com";

async function testWeb3Storage() {
  console.log("Starting Web3.Storage test...");
  
  try {
    // Create the client
    console.log("Creating client...");
    const client = await create();
    console.log("Client created successfully");
    
    // Login with email
    console.log(`Logging in with email: ${AUTH_EMAIL}`);
    try {
      const account = await client.login(AUTH_EMAIL);
      console.log("Login successful, checking for payment plan");
      
      try {
        // Wait for a payment plan with timeout
        await account.plan.wait(1000, 60 * 1000); // 1 second polling, 1 minute timeout
        console.log("Payment plan confirmed");
      } catch (planError) {
        console.warn("Payment plan check timed out or failed:", planError);
        console.log("Continuing anyway as this might be a development environment");
      }
      
      // Create a space if we don't have one
      try {
        const spaces = await client.spaces();
        console.log("Available spaces:", spaces.length);
        
        let space;
        if (spaces.length > 0) {
          space = spaces[0];
          console.log("Using existing space:", space.did());
        } else {
          console.log("Creating new space...");
          space = await client.createSpace("test-space", { account });
          console.log("Created new space:", space.did());
        }
        
        // Set as current space
        await client.setCurrentSpace(space.did());
        console.log("Set as current space");
        
        // Test file upload
        console.log("Testing file upload...");
        
        // Create a test file
        const testContent = "Hello, Web3.Storage!";
        const testFile = new File([testContent], "test.txt", { type: "text/plain" });
        
        // Upload the file
        console.log("Uploading file...");
        const uploadResult = await client.uploadFile(testFile);
        console.log("File uploaded successfully with CID:", uploadResult.toString());
        
        // Create a gateway URL
        const gatewayUrl = `https://w3s.link/ipfs/${uploadResult.toString()}`;
        console.log("Gateway URL:", gatewayUrl);
        
        console.log("Test completed successfully!");
        return true;
      } catch (spaceError) {
        console.error("Error with space operations:", spaceError);
        return false;
      }
    } catch (loginError) {
      console.error("Login error:", loginError);
      return false;
    }
  } catch (error) {
    console.error("Error in Web3.Storage test:", error);
    return false;
  }
}

// Run the test
testWeb3Storage()
  .then(success => {
    console.log("Test result:", success ? "SUCCESS" : "FAILED");
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error("Unhandled error in test:", error);
    process.exit(1);
  }); 