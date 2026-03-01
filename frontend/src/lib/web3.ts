import { createPublicClient, http, parseAbi } from 'viem'

const circleArcTestnet = {
    id: 5042002,
    name: 'Arc Testnet',
    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc.testnet.arc.network'] },
        public: { http: ['https://rpc.testnet.arc.network'] },
    }
}

export const publicClient = createPublicClient({
    chain: circleArcTestnet,
    transport: http(process.env.CIRCLE_ARC_RPC_URL || 'https://rpc.testnet.arc.network')
})

const ephemeralNotesAbi = parseAbi([
    'function createNote(address _ephemeralOwner, address _sender, uint256 _amount) external',
    'function returnNoteToSender(address _ephemeralOwner) external'
])

export async function executePoolOperation(
    userAddress: `0x${string}`,
    amount: bigint,
    ephemeralOwner: `0x${string}`
) {
    console.log(`[Web3] Executing UserOp for ${userAddress} to pool ${amount} USDC`)
    console.log(`[Web3] Creating EphemeralNote owned by ${ephemeralOwner}`)

    // 1. Build UserOperation: usdc.approve(notes, amount) -> notes.createNote()
    // 2. Sign UserOp with Bot's Session Key using user's ERC-7715 permission
    // 3. Send UserOp to Pimlico Bundler configured for Circle Arc Paymaster

    // Mocking delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    return "0xMOCK_TRANSACTION_HASH"
}

export async function executeReclaimOperation(ephemeralOwner: `0x${string}`) {
    console.log(`[Web3] Reclaiming Note ${ephemeralOwner}`)
    // Bot directly calls returnNoteToSender since it's the owner of the contract
    return "0xMOCK_RECLAIM_HASH"
}
