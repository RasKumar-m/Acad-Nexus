import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-guard"
import { analyzePerformance } from "@/lib/ai"
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
        const { projectTitle, milestones } = body
        
        if (!projectTitle || !milestones || !Array.isArray(milestones)) {
            // Because the frontend is only sending: { milestones: [], proposalId, deadline, status },
            // we need to make sure projectTitle is at least an empty string if not provided locally,
            // or we extract the title if it's sent. Actually, let's update this to be more flexible.
            if (req.body) {
                console.log("Analytics Request:", body)
            }
        }
        
        const title = projectTitle || "Unknown Project"
        const mstones = Array.isArray(milestones) ? milestones : []

        const analysis = await analyzePerformance(title, mstones)
        return NextResponse.json(analysis)
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
