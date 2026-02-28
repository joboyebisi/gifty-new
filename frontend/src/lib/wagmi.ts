import { http, createConfig } from 'wagmi'
import { defineChain } from 'viem'

export const circleArcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
    public: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
})

export const config = createConfig({
  chains: [circleArcTestnet],
  transports: {
    [circleArcTestnet.id]: http(),
  },
})
