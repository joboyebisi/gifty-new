import { Bot, webhookCallback } from 'grammy';
import { executePoolOperation, executeReclaimOperation } from '../../../lib/web3';
import { getUserPermissions } from '../../../lib/redis';
import { getProperties, getPropertyByNameOrLocation, getOrCreateUser } from '../../../lib/supabase';
import OpenAI from 'openai';

const token = process.env.TELEGRAM_BOT_TOKEN;
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
});

// Initialize bot lazily inside the route
let bot: Bot | null = null;
if (token) {
    bot = new Bot(token);

    bot.command('start', async (ctx) => {
        const webAppUrl = process.env.FRONTEND_APP_URL || 'http://localhost:3000';
        await getOrCreateUser(ctx.from?.id || 0);

        await ctx.reply(
            "🏢 *Welcome to Agentic Real Estate!*\n\nI'm your AI Real Estate Agent powered by DeepSeek & Circle Arc.\n\nYou can chat with me naturally to explore fractional real estate investments. For example:\n_\"Show me properties in Miami\"_\n_\"I want to pool 500 USDC to buy shares of the NY Apartment\"_\n\nBut first, connect your wallet to authorize me to handle your USDC.",
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔗 Connect Wallet & Authorize', web_app: { url: webAppUrl } }]
                    ]
                }
            }
        );
    });

    bot.command('help', async (ctx) => {
        await ctx.reply(
            "🤖 *Agentic Real Estate Help Center*\n\n" +
            "Here is what I can do for you:\n\n" +
            "🔹 `/start` - Connect your wallet and initialize the AI Agent.\n" +
            "🔹 `/properties` - Browse all available real-world assets to invest in.\n" +
            "🔹 `/portfolio` - View your active fractional real estate investments.\n" +
            "🔹 `/pool` - Start a recurring savings pool with friends for a property.\n" +
            "🔹 `/help` - Show this message again.\n\n" +
            "💡 *Pro Tip:* You don't need to use commands! You can just chat with me naturally (e.g., _\"Show me properties in New York\"_ or _\"Invest 500 USDC into the Miami Condo\"_).",
            { parse_mode: 'Markdown' }
        );
    });

    bot.command('portfolio', async (ctx) => {
        await ctx.reply("📈 *Your Fractional Real Estate Portfolio*\n\n_(Coming soon! Will fetch your active USDC investments from the Arc blockchain)_", { parse_mode: 'Markdown' });
    });

    // Natural Language Agent Handler
    bot.on('message:text', async (ctx) => {
        const userMessage = ctx.message.text;
        if (userMessage.startsWith('/')) return; // Ignore standard commands

        // Ensure user exists in Supabase
        await getOrCreateUser(ctx.from?.id || 0);

        await ctx.reply("🧠 _Agent is thinking..._", { parse_mode: 'Markdown' });

        try {
            const completion = await openai.chat.completions.create({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional Real Estate Investment AI Agent on the Circle Arc blockchain. 
                        Your goal is to parse user intents to either 'query_properties' or 'invest_pool'. 
                        You MUST respond with a JSON array wrapped in a markdown code block. 
                        Valid actions: 
                        [{"action": "query_properties", "location": "Miami"}]
                        [{"action": "invest_pool", "property": "New York", "amount": 500}]`
                    },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.1
            });

            const aiResponse = completion.choices[0].message.content || '[]';

            // Extract JSON from markdown
            const jsonStr = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const actions = JSON.parse(jsonStr);

            for (const action of actions) {
                if (action.action === 'query_properties') {
                    const props = action.location ? await getPropertyByNameOrLocation(action.location) : await getProperties();

                    if (!props || props.length === 0) {
                        await ctx.reply(`❌ I couldn't find any properties matching "${action.location || 'your query'}".`);
                        continue;
                    }

                    let response = `🏢 *Found ${props.length} Properties:*\n\n`;
                    props.forEach(p => {
                        response += `*${p.name}* (${p.location})\n`;
                        response += `💰 Share Price: **${p.fractional_share_price_usdc} USDC**\n`;
                        response += `📈 Projected APY: **${p.projected_apy}%**\n\n`;
                    });

                    await ctx.reply(response, { parse_mode: 'Markdown' });
                }
                else if (action.action === 'invest_pool') {
                    const amount = Number(action.amount);
                    if (isNaN(amount) || amount <= 0) {
                        await ctx.reply("❌ Invalid investment amount specified by the AI.");
                        continue;
                    }

                    // 1. Check Redis for user's ERC-7715 permissions
                    const perms = await getUserPermissions(ctx.from?.id.toString() || 'unknown');
                    if (!perms && process.env.NODE_ENV !== 'development') {
                        await ctx.reply('⚠️ You have not authorized the Agent to spend your USDC yet. Please type /start and connect your wallet.');
                        continue;
                    }

                    await ctx.reply(`⏳ *Executing RWA Investment...*\n\nPooling **${amount} USDC** into the fractional smart contract for: _${action.property}_\n\nUsing Circle Native Paymaster on Arc Testnet for gasless execution...`, { parse_mode: 'Markdown' });

                    try {
                        // 2. Execute Web3 Operation using Circle
                        const mockEphemeralOwner = '0x1A2B3C4D...'; // Would be generating ephemeral key or transferring 1155 tokens
                        const mockUserAddress = '0xMockUserAddress0000000000000000000000000' as `0x${string}`;
                        const txHash = await executePoolOperation(mockUserAddress, BigInt(amount * 1_000_000), mockEphemeralOwner as `0x${string}`);

                        await ctx.reply(`✅ *Investment Successful!*\n\nYou now own fractional shares in **${action.property}**.\nTransaction: \`${txHash}\`\n\nYour portfolio is yielding USDC automatically!`, { parse_mode: 'Markdown' });
                    } catch (err) {
                        console.error(err);
                        await ctx.reply('❌ Failed to execute Circle Arc transaction. Ensure you have granted sufficient USDC allowance.');
                    }
                }
            }

        } catch (error) {
            console.error("DeepSeek Error:", error);
            await ctx.reply("❌ Sorry, my AI systems are currently unavailable. Please try again later.");
        }
    });
}

// Next.js API Route Handlers
export async function POST(req: Request) {
    if (!bot) {
        return new Response("Bot token not configured", { status: 500 });
    }
    try {
        const update = await req.json();
        await bot.handleUpdate(update);
        return new Response("OK", { status: 200 });
    } catch (err) {
        console.error("Error handling update:", err);
        return new Response("Error", { status: 500 });
    }
}

export async function GET() {
    return new Response("Gifty Telegram webhook is alive.", { status: 200 });
}
