import { NextRequest, NextResponse } from "next/server"
import { requireAuth, requireRole } from "@/lib/auth-guard"
import { suggestProjects } from "@/lib/ai"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
    const { res } = await requireRole("student")
    if (res) return res

    try {
        const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || req.headers.get("x-real-ip") || "unknown"
        if (!checkRateLimit(ip)) {
            return NextResponse.json({ error: "Rate limit exceeded (10 req/min). Please try again later." }, { status: 429 })
        }

        const body = await req.json()
        const { context } = body
        
        if (!context || typeof context !== "string" || context.trim().length < 5) {
            return NextResponse.json({ error: "Please provide more context about your interests." }, { status: 400 })
        }

        const suggestions = await suggestProjects(context)
        return NextResponse.json({ suggestions })
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
