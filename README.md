# 🎁 Gifty

Gifty is an agent-powered Telegram bot built on the **Circle Arc network** that facilitates seamless, automated group contributions using **USDC**. It leverages Account Abstraction (ERC-4337) and MetaMask's Advanced Permissions API (ERC-7715) to allow users to authorize a Telegram bot to pool and manage funds securely on their behalf.

## 🏗 Architecture

Gifty is a full-stack Web3 application designed as a monorepo with four distinct modules:

### 1. Smart Contracts (`/contracts`)
- Built with **Foundry**.
- Contains the `EphemeralNotes.sol` escrow contract which securely holds pooled USDC until claimed or reclaimed.
- Configured specifically for deployment on the Circle Arc Testnet.

### 2. Frontend Web App (`/frontend`)
- Built with **Next.js (App Router)** and **Tailwind CSS**.
- Serves as the Telegram Mini App (TMA) interface where users connect their wallets.
- Integrates **Wagmi/Viem** for connecting wallets and granting ERC-7715 permissions to the bot.

### 3. Telegram Bot (`/bot`)
- Built with **Grammy** (TypeScript).
- Handles user interactions (`/start`, `/pool`, `/reclaim`) directly within Telegram.
- Uses **Upstash Redis** for high-speed permission and state tracking.
- Uses Viem to format and execute ERC-4337 UserOperations via Circle Paymasters.

### 4. On-Chain Indexing (`/indexer`)
- Built with **Envio**.
- A hyper-fast indexer that listens for `NoteCreated` and `NoteRedeemed` events on the Circle Arc network.
- Provides a GraphQL endpoint for the bot to query a user's unredeemed pools instantly.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- Local execution requires API Keys for Telegram, Upstash Redis, and Pimlico (or Circle Native Paymaster).

### 1. Boot up the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. Start the Telegram Bot (Polling Mode)
Ensure you have created a `.env` file in the `/bot` directory with your `TELEGRAM_BOT_TOKEN`.
```bash
cd bot
npm install
npm run dev # Or 'npx ts-node src/index.ts'
```

### 3. Start the Indexer
```bash
cd indexer
npm install
npx envio start
```

## 🔒 Smart Contract Deployment
The `EphemeralNotes` contract is currently deployed on the **Circle Arc Testnet** at:
`0xd8D86eCc3d2EFb0939611926c80DC8917440d776`

To deploy your own version, use the provided script:
```bash
cd contracts
node deploy-direct.mjs
```

## 📜 License
MIT
