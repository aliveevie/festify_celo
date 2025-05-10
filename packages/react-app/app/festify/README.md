# Festify - Festival Greeting Cards as NFTs

Festify is a decentralized application (dApp) that allows users to create and share personalized festival greeting cards as NFTs on the blockchain. This feature leverages the power of blockchain technology to create unique, permanent digital greetings for special occasions.

## Features

- **Create Festival Greeting Cards**: Mint personalized greeting cards for various festivals including Christmas, New Year, Eid, and Sallah.
- **Send to Anyone**: Send greeting cards to any blockchain address.
- **Permanent Storage**: All greeting card metadata and images are stored on IPFS using Web3.Storage.
- **View Sent & Received Cards**: Easily browse through greeting cards you've sent or received.
- **Detailed NFT View**: View detailed information about each greeting card NFT.
- **Share Greeting Cards**: Share your greeting cards with others via unique links.

## How It Works

1. **Connect Wallet**: Connect your wallet to the application.
2. **Choose a Festival**: Select the festival for which you want to create a greeting card.
3. **Customize Your Greeting**: Enter the recipient's address, write a personalized message, and optionally add a custom image URL.
4. **Mint the NFT**: Confirm the transaction to mint your greeting card as an NFT.
5. **Share Your Greeting**: Once minted, you can share your greeting card with others.

## Technical Implementation

- **Smart Contract**: The FestivalGreetings smart contract (ERC-721) handles the minting and management of greeting card NFTs.
- **IPFS Storage**: Greeting card metadata and images are stored on IPFS using Web3.Storage.
- **React UI**: A modern, responsive UI built with React, Next.js, and TailwindCSS.
- **Blockchain Integration**: Seamless integration with the Celo blockchain using viem.

## Getting Started

1. Navigate to the Festify page by clicking on the "Launch Festify" button on the main page.
2. Connect your wallet if not already connected.
3. Follow the step-by-step process to create your first greeting card.

## Development

The Festify feature is built on top of the Celo Composer template and follows the same architecture:

- `/app/festify`: Contains the main Festify pages
- `/components`: Contains reusable UI components
- `/contexts`: Contains the Festify context for blockchain interactions
- `/utils`: Contains utility functions for Web3.Storage and other helpers

## Future Enhancements

- Support for more festivals and occasions
- Custom card designs and templates
- Social sharing features
- Gift attachments (e.g., tokens, NFTs)
- Multi-language support
