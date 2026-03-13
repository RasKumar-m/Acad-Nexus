import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"
import { requireRole } from "@/lib/auth-guard"

// ─── GET /api/teams/my — Get current user's team/proposal ──────────
export async function GET(_req: NextRequest) {
    const { session, res } = await requireRole("student")
    if (res) return res

    try {
        await dbConnect()
        const userId = session.user.id

        const proposal = await Proposal.findOne({
            "teamMembers.userId": userId,
            status: { $in: ["draft", "pending", "approved", "completed"] },
        })
            .sort({ createdAt: -1 })
            .lean()

        if (!proposal) {
            return NextResponse.json({ team: null })
        }

        return NextResponse.json({ team: proposal })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
