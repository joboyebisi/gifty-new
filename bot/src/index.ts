import { Bot } from 'grammy'
import { run } from '@grammyjs/runner'
import * as dotenv from 'dotenv'
import pino from 'pino'
import { executePoolOperation, executeReclaimOperation } from './lib/web3'
import { getUserPermissions, saveUserPermissions } from './lib/redis'

dotenv.config()

const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: { colorize: true }
    }
})

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) {
    logger.error('TELEGRAM_BOT_TOKEN is required in .env')
    process.exit(1)
}

const bot = new Bot(token)

// --- Command Handlers ---

bot.command('start', async (ctx) => {
    const webAppUrl = process.env.FRONTEND_APP_URL || 'http://localhost:3000'

    await ctx.reply(
        "🎁 *Welcome to Gifty!*\n\nI'm your agent-powered group pooling bot built on Circle Arc.\n\nTo get started, please connect your wallet and authorize me to securely route your USDC contributions.",
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔗 Connect Wallet & Authorize', web_app: { url: webAppUrl } }]
                ]
            }
        }
    )
})

bot.command('pool', async (ctx) => {
    const args = ctx.match.split(' ')
    if (args.length < 2) {
        return ctx.reply('Usage: `/pool [amount] [reason/recipient]`\nExample: `/pool 50 USDC for Alice`', { parse_mode: 'Markdown' })
    }

    const amount = parseFloat(args[0])
    if (isNaN(amount) || amount <= 0) {
        return ctx.reply('❌ Invalid amount. Please specify a valid number.')
    }

    const reason = args.slice(1).join(' ')

    // 1. Check Redis for user's ERC-7715 permissions
    const perms = await getUserPermissions(ctx.from?.id.toString() || 'unknown')
    if (!perms && process.env.NODE_ENV !== 'development') {
        return ctx.reply('⚠️ You have not authorized Gifty to use your USDC. Please click /start and connect your wallet first.')
    }

    await ctx.reply(`⏳ *Processing Pool Request...*\n\nAttempting to pool **${amount} USDC** for: _${reason}_\n\nExecuting cross-chain transaction via Circle Arc...`, { parse_mode: 'Markdown' })

    try {
        // 2. Execute Web3 Operation
        // In prod, amount needs decimal conversion. Mocking 6 decimals for USDC.
        const amountBigInt = BigInt(amount * 1_000_000)
        const mockEphemeralOwner = '0x1234567890123456789012345678901234567890' as `0x${string}`
        const mockUserAddress = '0xMockUserAddress0000000000000000000000000' as `0x${string}`

        const txHash = await executePoolOperation(mockUserAddress, amountBigInt, mockEphemeralOwner)

        const claimUrl = `${process.env.FRONTEND_APP_URL}/claim?key=mock_private_key_here`

        await ctx.reply(`✅ *Pool Successful!*\n\nSuccessfully pooled **${amount} USDC**.\nTransaction: \`${txHash}\`\n\nShare this secure, one-time link for the recipient to claim the funds:\n\n${claimUrl}`, { parse_mode: 'Markdown' })
    } catch (err) {
        logger.error(err)
        await ctx.reply('❌ Failed to execute transaction. Ensure you have granted sufficient USDC allowance.')
    }
})

bot.command('reclaim', async (ctx) => {
    await ctx.reply("🔍 Checking for unredeemed pools to reclaim...")

    // Mock reclaim flow
    try {
        const txHash = await executeReclaimOperation('0x1234567890123456789012345678901234567890' as `0x${string}`)
        await ctx.reply(`✅ *Reclaim Successful!*\n\nFunds have been returned to your wallet.\nTransaction: \`${txHash}\``, { parse_mode: 'Markdown' })
    } catch (err) {
        logger.error(err)
        await ctx.reply('❌ Reclaim failed or no eligible funds found.')
    }
})

// --- Start Bot ---
bot.catch((err) => {
    logger.error({ err }, 'Error in bot')
})

logger.info('Starting Gifty bot...')
run(bot)
