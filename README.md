<div align="center">
  <h1>🎁 Gifty</h1>
  <p><strong>The Agent-Powered Group Contribution Bot on Circle Arc</strong></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Network](https://img.shields.io/badge/Network-Circle%20Arc-blue.svg)](https://arc.network/)
  [![Framework](https://img.shields.io/badge/Framework-Next.js%2014-black.svg)](https://nextjs.org/)
</div>

---

## 📖 Inspiration
Gifty makes pooling money with friends on Telegram incredibly easy. Built natively for the **Circle Arc network**, Gifty utilizes **MetaMask's Advanced Permissions API (ERC-7715)** to allow users to securely delegate USDC spending power to a Telegram bot. 

No more switching between apps to send small contributions. Just tell the bot `/pool 50 USDC for Alice` and the transaction is handled instantly, securely, and gaslessly (via Account Abstraction/ERC-4337).

## 🏗 Architecture & Modules

Gifty is a full-stack Web3 application designed as a monorepo with three extremely focused modules:

### 1. 📜 Smart Contracts (`/contracts`)
- **Framework:** Foundry / Hardhat / solc
- **Core:** The `EphemeralNotes.sol` escrow contract safely holds pooled USDC until the designated recipient claims it using their ephemeral private key.
- **Network:** Deployed purely on the **Circle Arc Testnet**.

### 2. 📱 Frontend & Telegram Webhook (`/frontend`)
- **Framework:** Next.js (App Router), React, Tailwind CSS.
- **Frontend UI:** The beautiful Telegram Mini App (TMA) where users connect their MetaMask wallets via **Wagmi/Viem** to authorize the bot.
- **Serverless Backend:** Contains `/api/bot`, a Serverless API route running a **Grammy** instance to process Telegram webhooks instantly.
- **State:** Utilizes **Upstash Redis** for lightning-fast session state and permission tracking.

### 3. 🔍 On-Chain Indexing (`/indexer`)
- **Framework:** Envio
- **Purpose:** A hyper-fast Typescript indexer tracking all `NoteCreated` and `NoteRedeemed` events to power instant frontend queries.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- A [Telegram Bot Token](https://core.telegram.org/bots#how-do-i-create-a-bot) from BotFather
- An [Upstash Redis](https://upstash.com/) Database URL & Token

### 1. Clone & Install
```bash
git clone https://github.com/joboyebisi/gifty-new.git
cd gifty-new
```

### 2. Environment Variables
In the `frontend/` directory, create a `.env` file:
```env
TELEGRAM_BOT_TOKEN="your_bot_token"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CIRCLE_ARC_RPC_URL="https://rpc.testnet.arc.network"
UPSTASH_REDIS_REST_URL="your_upstash_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
```

### 3. Run the Next.js App (UI & Webhook)
```bash
cd frontend
npm install
npm run dev
```
*(To test the Webhook locally with Telegram, use `ngrok` to expose your `localhost:3000` to the internet and register it with `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<NGROK_URL>/api/bot`)*

---

## 🌐 Deploying to Vercel

Gifty is structurally optimized for an instant deployment on Vercel. Because the Telegram Bot is a Next.js Serverless API Route, you get zero-cost scaling out of the box.

1. Create a new Project on [Vercel](https://vercel.com/new).
2. Import this GitHub repository (`joboyebisi/gifty-new`).
3. Set the **Framework Preset** to `Next.js`.
4. Set the **Root Directory** to `frontend`.
5. Add all the Environment Variables listed above in the Vercel dashboard.
6. Click **Deploy**.
7. Once your URL is live (e.g., `https://gifty-new.vercel.app`), register it with Telegram:
   ```bash
   curl "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://<YOUR_VERCEL_DOMAIN>/api/bot"
   ```

---

## 🔒 Live Deployments
**Network:** Circle Arc Testnet
**USDC Contract:** `0x3600000000000000000000000000000000000000`
**EphemeralNotes Contract:** `0xd8D86eCc3d2EFb0939611926c80DC8917440d776`

## 📄 License
This project is licensed under the MIT License.
