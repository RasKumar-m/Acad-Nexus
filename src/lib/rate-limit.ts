export const rateLimitConfig = {
    // Allows 30 requests per minute per IP to keep well within the free 15 req/min tier
    interval: 60 * 1000, 
    uniqueTokenPerInterval: 500,
}

// Simple in-memory rate limiting map for edge environments/serverless
// Note: In a true multi-instance serverless setup like Vercel, this is per-instance,
// but it's sufficient for basic protection against bursts from a single user.
const map = new Map<string, { count: number; lastReset: number }>()

export function checkRateLimit(ip: string, limit: number = 30): boolean {
    const now = Date.now()
    const windowStart = now - rateLimitConfig.interval

    let record = map.get(ip)

    if (!record || record.lastReset < windowStart) {
        // Reset or create new record
        record = { count: 1, lastReset: now }
        map.set(ip, record)
        return true
    }

    if (record.count >= limit) {
        return false // Rate limit exceeded
    }

    record.count += 1
    map.set(ip, record)
    return true
}
