import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-guard"
import { checkRateLimit } from "@/lib/rate-limit"
import { summarizeProject } from "@/lib/ai"

export async function POST(req: NextRequest) {
    const { res } = await requireAuth()
    if (res) return res

    try {
        const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || req.headers.get("x-real-ip") || "unknown"
        if (!checkRateLimit(ip)) {
            return NextResponse.json({ error: "Rate limit exceeded (10 req/min). Please try again later." }, { status: 429 })
        }

        const body = await req.json()
        const { title, description } = body
        if (!title || !description) {
            return NextResponse.json({ error: "Missing title or description" }, { status: 400 })
        }

        const summaryPoints = await summarizeProject(title, description)
        return NextResponse.json({ summary: summaryPoints })
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
