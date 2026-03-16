import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-guard"
import { checkDuplicates } from "@/lib/ai"
import { checkRateLimit } from "@/lib/rate-limit"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"

export async function POST(req: NextRequest) {
    const { res } = await requireAuth()
    if (res) return res

    try {
        const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || req.headers.get("x-real-ip") || "unknown"
        if (!checkRateLimit(ip)) {
            return NextResponse.json({ error: "Rate limit exceeded (10 req/min). Please try again later." }, { status: 429 })
        }

        await dbConnect()
        const body = await req.json()
        const { title, description } = body
        
        if (!title || !description) {
            return NextResponse.json({ error: "Missing title or description" }, { status: 400 })
        }

        // Fetch all existing approved/completed proposals context
        const existingDocs = await Proposal.find({ status: { $in: ["approved", "completed"] } })
            .select("title")
            .limit(50)
            .lean()

        const existingProjects = existingDocs.map(d => ({
            id: String(d._id),
            title: d.title
        }))

        // Call AI using the newly gathered context
        const result = await checkDuplicates(title, description, existingProjects)
        return NextResponse.json(result)
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
