require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Register ts-node to handle TypeScript files
require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
        module: 'commonjs'
    }
});

// Import the web3Storage module
const { createAndUploadMetadata } = require('./packages/react-app/utils/web3Storage.ts');

// Load ABI
const abiPath = path.join(__dirname, 'packages', 'react-app', 'contexts', 'festify-abi.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi;

// Celo mainnet configuration
const CELO_RPC_URL = 'https://forno.celo.org';
const CONTRACT_ADDRESS = '0xEbc79539af49e1Ee8fE7Ee8721bcA293441ED058'

// Use the same private key from hardhat config
const PRIVATE_KEY = 'f0747689048074f89b33a29733b4b1d36906dca2d4303ea1907c7bb2f5ee0e9b';

// Festival types and message templates
const festivalTypes = [
    "Christmas", "Eid", "NewYear", "Sallah", "Diwali", "Holi", 
    "Thanksgiving", "Halloween", "Easter", "Ramadan", "Hanukkah", 
    "Valentines", "Birthday", "Anniversary", "Graduation"
];

// Word banks for generating random messages
const greetings = [
    "Wishing", "Sending", "May", "Hope", "Praying", "Celebrating",
    "Sharing", "Extending", "Bringing", "Offering", "Conveying",
    "Expressing", "Bestowing", "Granting", "Blessing"
];

const adjectives = [
    "wonderful", "joyful", "peaceful", "blessed", "happy", "magical",
    "special", "memorable", "beautiful", "amazing", "fantastic",
    "glorious", "magnificent", "splendid", "excellent", "brilliant",
    "delightful", "charming", "lovely", "perfect"
];

const nouns = [
    "wishes", "blessings", "joy", "happiness", "peace", "love",
    "cheer", "warmth", "light", "hope", "grace", "harmony",
    "prosperity", "success", "fortune", "goodwill", "kindness",
    "laughter", "smiles", "memories"
];

const wishes = [
    "be with you", "fill your day", "surround you", "guide you",
    "bring you joy", "light your path", "warm your heart",
    "lift your spirit", "brighten your day", "touch your soul",
    "enrich your life", "bless your journey", "inspire you",
    "comfort you", "strengthen you"
];

// Generate random message template
function generateRandomMessageTemplate(festival) {
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const wish = wishes[Math.floor(Math.random() * wishes.length)];
    
    // Randomly choose one of several message structures
    const structures = [
        `${greeting} you a ${adjective} ${festival}! May ${noun} ${wish}.`,
        `${greeting} you ${adjective} ${noun} on this ${festival}! May it ${wish}.`,
        `On this ${festival}, ${greeting.toLowerCase()} you ${adjective} ${noun}. May they ${wish}.`,
        `${greeting} you a ${festival} filled with ${adjective} ${noun}! May they ${wish}.`,
        `May this ${festival} bring you ${adjective} ${noun} that ${wish}.`,
        `${greeting} you a ${adjective} ${festival} celebration! May ${noun} ${wish}.`,
        `On your ${festival}, ${greeting.toLowerCase()} you ${adjective} moments of ${noun}. May they ${wish}.`,
        `${greeting} you a ${festival} as ${adjective} as the ${noun} that ${wish}.`
    ];
    
    return structures[Math.floor(Math.random() * structures.length)];
}

// Generate SVG content for the greeting card with enhanced design
function generateGreetingCardSvg(festival, message) {
    // Define festival-specific colors and patterns
    const festivalStyles = {
        Christmas: { background: "#1a472a", accent: "#c41e3a", icon: "🎄" },
        Eid: { background: "#2c5282", accent: "#f6ad55", icon: "🌙" },
        NewYear: { background: "#2d3748", accent: "#f6e05e", icon: "✨" },
        Diwali: { background: "#702459", accent: "#f6ad55", icon: "🪔" },
        Holi: { background: "#805ad5", accent: "#f687b3", icon: "🎨" },
        Thanksgiving: { background: "#744210", accent: "#e53e3e", icon: "🦃" },
        Halloween: { background: "#1a202c", accent: "#f6ad55", icon: "🎃" },
        Easter: { background: "#4299e1", accent: "#f6e05e", icon: "🥚" },
        Ramadan: { background: "#2c5282", accent: "#f6ad55", icon: "🌙" },
        Hanukkah: { background: "#2b6cb0", accent: "#f6e05e", icon: "🕎" },
        Valentines: { background: "#702459", accent: "#f687b3", icon: "❤️" },
        Birthday: { background: "#805ad5", accent: "#f6e05e", icon: "🎂" },
        Anniversary: { background: "#702459", accent: "#f687b3", icon: "💍" },
        Graduation: { background: "#2d3748", accent: "#f6e05e", icon: "🎓" },
        Sallah: { background: "#2c5282", accent: "#f6ad55", icon: "🕌" }
    };

    // Get festival-specific style or use default
    const style = festivalStyles[festival] || {
        background: "#2d3748",
        accent: "#f6e05e",
        icon: "🎉"
    };

    // Generate unique IDs for this card
    const cardId = `card-${Math.random().toString(36).substring(2, 15)}`;
    const gradientId = `gradient-${cardId}`;
    const shadowId = `shadow-${cardId}`;

    return `
    <svg width="350" height="350" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${style.background};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${style.background};stop-opacity:0.8" />
            </linearGradient>
            <filter id="${shadowId}">
                <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
            </filter>
        </defs>
        
        <!-- Background with gradient -->
        <rect width="100%" height="100%" fill="url(#${gradientId})"/>
        
        <!-- Decorative border -->
        <rect x="10" y="10" width="330" height="330" 
              fill="none" stroke="${style.accent}" 
              stroke-width="3" rx="20" ry="20"
              filter="url(#${shadowId})"/>
        
        <!-- Festival icon -->
        <text x="50%" y="35%" 
              font-family="Arial" font-size="48" 
              text-anchor="middle" fill="${style.accent}"
              filter="url(#${shadowId})">
            ${style.icon}
        </text>
        
        <!-- Festival name -->
        <text x="50%" y="50%" 
              font-family="Arial" font-size="28" 
              font-weight="bold" text-anchor="middle" 
              fill="white" filter="url(#${shadowId})">
            ${festival}
        </text>
        
        <!-- Message box -->
        <rect x="25" y="55%" width="300" height="120" 
              fill="rgba(255,255,255,0.1)" 
              rx="10" ry="10"
              stroke="${style.accent}"
              stroke-width="1"/>
        
        <!-- Message -->
        <foreignObject x="35" y="58%" width="280" height="110">
            <div xmlns="http://www.w3.org/1999/xhtml" 
                 style="color: white; 
                        font-family: Arial; 
                        font-size: 16px; 
                        text-align: center; 
                        line-height: 1.4;
                        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                        padding: 10px;">
                ${message}
            </div>
        </foreignObject>
        
        <!-- Decorative corner elements -->
        <path d="M20,20 L40,20 L20,40 Z" fill="${style.accent}" opacity="0.5"/>
        <path d="M310,20 L330,20 L330,40 Z" fill="${style.accent}" opacity="0.5"/>
        <path d="M20,310 L20,330 L40,330 Z" fill="${style.accent}" opacity="0.5"/>
        <path d="M310,310 L330,310 L330,330 Z" fill="${style.accent}" opacity="0.5"/>
    </svg>`;
}

// Generate random festival message with proper metadata
async function generateRandomFestivalMessage(sender, recipient) {
    const festival = festivalTypes[Math.floor(Math.random() * festivalTypes.length)];
    const message = generateRandomMessageTemplate(festival);
    
    // Generate SVG content
    const svgContent = generateGreetingCardSvg(festival, message);
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    
    // Create and upload metadata using Web3.Storage
    const metadataURI = await createAndUploadMetadata(
        message,
        festival,
        sender,
        recipient,
        svgDataUrl
    );
    
    return {
        festival,
        message,
        metadataURI
    };
}

// Generate multiple random festival messages
function generateRandomFestivalMessages(count) {
    const messages = [];
    for (let i = 0; i < count; i++) {
        messages.push(generateRandomFestivalMessage());
    }
    return messages;
}

// Check if wallet has enough balance for transactions
async function checkWalletBalance(provider, walletAddress, mintFee, numTransactions) {
    const balance = await provider.getBalance(walletAddress);
    const requiredBalance = mintFee * BigInt(numTransactions);
    const estimatedGasCost = ethers.parseEther("0.01") * BigInt(numTransactions); // Rough estimate for gas
    const totalRequired = requiredBalance + estimatedGasCost;

    if (balance < totalRequired) {
        const missingAmount = totalRequired - balance;
        console.error('\n❌ Insufficient balance!');
        console.error(`Current balance: ${ethers.formatEther(balance)} CELO`);
        console.error(`Required balance: ${ethers.formatEther(totalRequired)} CELO`);
        console.error(`Missing amount: ${ethers.formatEther(missingAmount)} CELO`);
        console.error(`\nPlease add more CELO to this address: ${walletAddress}`);
        return false;
    }
    return true;
}

// Generate 10 random wallets
function generateRandomWallets(count) {
    const wallets = [];
    for (let i = 0; i < count; i++) {
        const wallet = ethers.Wallet.createRandom();
        wallets.push(wallet);
    }
    return wallets;
}

// Calculate how many wallets we can send to based on balance
async function calculateAffordableWallets(provider, walletAddress, mintFee) {
    const balance = await provider.getBalance(walletAddress);
    const estimatedGasCost = ethers.parseEther("0.01"); // Estimated gas per transaction
    const costPerWallet = mintFee + estimatedGasCost;
    
    // If we can't even afford one wallet, return 0
    if (balance < costPerWallet) {
        return 0;
    }
    
    // Calculate how many wallets we can afford
    const affordableWallets = Math.floor(Number(balance) / Number(costPerWallet));
    return affordableWallets;
}

async function main() {
    try {
        console.log('Starting contract interaction on Celo mainnet...');
        
        // Setup provider
        const provider = new ethers.JsonRpcProvider(CELO_RPC_URL);
        console.log('Connected to Celo mainnet');

        // Create wallet instance
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        console.log('Wallet address:', wallet.address);

        // Create contract instance
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
        console.log('\nContract instance created at:', CONTRACT_ADDRESS);

        // Get mint fee
        const mintFee = await contract.mintFee();
        console.log('Current mint fee:', ethers.formatEther(mintFee), 'CELO');

        // Calculate how many wallets we can afford
        const affordableWallets = await calculateAffordableWallets(provider, wallet.address, mintFee);
        
        if (affordableWallets === 0) {
            const balance = await provider.getBalance(wallet.address);
            const estimatedGasCost = ethers.parseEther("0.01");
            const costPerWallet = mintFee + estimatedGasCost;
            const missingAmount = costPerWallet - balance;
            
            console.error('\n❌ Insufficient balance!');
            console.error(`Current balance: ${ethers.formatEther(balance)} CELO`);
            console.error(`Required for one wallet: ${ethers.formatEther(costPerWallet)} CELO`);
            console.error(`Missing amount: ${ethers.formatEther(missingAmount)} CELO`);
            console.error(`\nPlease add more CELO to this address: ${wallet.address}`);
            process.exit(1);
        }

        console.log(`\nCan afford to send to ${affordableWallets} wallet(s)`);

        // Generate only the number of wallets we can afford
        const recipientWallets = generateRandomWallets(affordableWallets);
        console.log('\nGenerated recipient wallets:');
        recipientWallets.forEach((w, index) => {
            console.log(`Wallet ${index + 1}: ${w.address}`);
        });

        // Send one unique greeting to each wallet
        for (const recipientWallet of recipientWallets) {
            try {
                // Generate one random festival message for this wallet with proper metadata
                const greeting = await generateRandomFestivalMessage(
                    wallet.address,
                    recipientWallet.address
                );
                
                console.log(`\nSending greeting to wallet: ${recipientWallet.address}`);
                console.log('Festival:', greeting.festival);
                console.log('Message:', greeting.message);
                console.log('Metadata URI:', greeting.metadataURI);
                
                const tx = await contract.mintGreetingCard(
                    recipientWallet.address,
                    greeting.metadataURI,
                    greeting.festival,
                    { value: mintFee }
                );
                console.log(`Transaction sent! Hash: ${tx.hash}`);
                console.log('Waiting for confirmation...');
                
                const receipt = await tx.wait();
                console.log(`${greeting.festival} greeting sent successfully!`);
                console.log('Block number:', receipt.blockNumber);
                console.log('Gas used:', receipt.gasUsed.toString());
            } catch (error) {
                console.error(`Error sending greeting:`, error.message);
                if (error.data) {
                    console.error('Error data:', error.data);
                }
                // Continue with next wallet even if one fails
                continue;
            }
        }

        // Get sent greetings
        console.log('\nFetching sent greetings...');
        const sentGreetings = await contract.getSentGreetings(wallet.address);
        console.log('Sent greetings:', sentGreetings);

    } catch (error) {
        console.error('Error in main function:', error);
        if (error.data) {
            console.error('Error data:', error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 