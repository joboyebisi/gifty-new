# 🎁 Gifty

Gifty is an agent-powered Telegram bot built on the **Circle Arc network** that facilitates seamless, automated group contributions using **USDC**. It leverages Account Abstraction (ERC-4337) and MetaMask's Advanced Permissions API (ERC-7715) to allow users to authorize a Telegram bot to pool and manage funds securely on their behalf.

## 🏗 Architecture

Gifty is a full-stack Web3 application designed as a monorepo with four distinct modules:

### 1. Smart Contracts (`/contracts`)
- Built with **Foundry**.
- Contains the `EphemeralNotes.sol` escrow contract which securely holds pooled USDC until claimed or reclaimed.
- Configured specifically for deployment on the Circle Arc Testnet.

### 2. Frontend & Telegram Bot Webhook (`/frontend`)
- Built with **Next.js (App Router)** and **Tailwind CSS**.
- **Frontend UI:** Serves as the Telegram Mini App (TMA) interface where users connect their MetaMask wallets via Wagmi/Viem.
- **Serverless Backend (`/api/bot`):** A Grammy bot runs inside a Next.js API Route, listening to Telegram Webhooks for `/start`, `/pool`, and `/reclaim` commands.
- **State & Transactions:** Uses **Upstash Redis** for high-speed session tracking and Viem to execute ERC-4337 UserOperations via Circle Paymasters.

### 3. On-Chain Indexing (`/indexer`)
- Built with **Envio**.
- A hyper-fast indexer that listens for `NoteCreated` and `NoteRedeemed` events on the Circle Arc network.
- Provides a GraphQL endpoint for the bot to query a user's unredeemed pools instantly.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- API Keys required in `frontend/.env`:
  - `TELEGRAM_BOT_TOKEN`
  - `UPSTASH_REDIS_REST_URL` & `TOKEN`
  - `PRIVATE_KEY` (deployer wallet for local testing)
  - `CIRCLE_ARC_RPC_URL` (Defaults to Testnet)

### 1. Boot up the Telegram Mini App & Webhook
```bash
cd frontend
npm install
npm run dev
```
*Note: For local Telegram Bot testing, use `ngrok` to tunnel your localhost:3000 to the public web, and register that URL with Telegram.*
`curl "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://<YOUR_NGROK_DOMAIN>/api/bot"`

### 2. Start the Indexer
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
