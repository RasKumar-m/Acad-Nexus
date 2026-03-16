import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-guard"
import { suggestMilestones } from "@/lib/ai"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
    const { res } = await requireRole("guide", "admin")
    if (res) return res

    try {
        const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || req.headers.get("x-real-ip") || "unknown"
        if (!checkRateLimit(ip)) {
            return NextResponse.json({ error: "Rate limit exceeded (10 req/min). Please try again later." }, { status: 429 })
        }

        const body = await req.json()
        const { title, description, deadlineInfo } = body
        
        if (!title || !description) {
            return NextResponse.json({ error: "Missing title or description" }, { status: 400 })
        }

        const milestones = await suggestMilestones(title, description, deadlineInfo || "Standard semester timeframe")
        return NextResponse.json({ milestones })
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
