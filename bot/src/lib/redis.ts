import Redis from 'ioredis'
import * as dotenv from 'dotenv'

dotenv.config()

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("⚠️ Redis configuration missing. Bot will run with mocked state.")
}

// Mocking Redis locally if credentials aren't provided for rapid development
const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.startsWith('rediss://')
    ? process.env.UPSTASH_REDIS_REST_URL
    : undefined;

// In a real app we would strictly use the remote Upstash via rest, but ioredis connects directly
// For this demo, we'll setup a simple mock interface if no url is provided
class MockRedis {
    private store = new Map<string, string>();
    async get(key: string) { return this.store.get(key) || null; }
    async set(key: string, value: string) { this.store.set(key, value); return 'OK'; }
    async del(key: string) { return this.store.delete(key) ? 1 : 0; }
}

export const redis = redisUrl ? new Redis(redisUrl) : new MockRedis()

const PREFIX = 'gifty:perms:'

export async function saveUserPermissions(telegramUserId: string, permissionData: any) {
    await redis.set(`${PREFIX}${telegramUserId}`, JSON.stringify(permissionData))
}

export async function getUserPermissions(telegramUserId: string) {
    const data = await redis.get(`${PREFIX}${telegramUserId}`)
    return data ? JSON.parse(data) : null
}
