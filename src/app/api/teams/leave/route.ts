import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"
import { requireRole } from "@/lib/auth-guard"

// ─── POST /api/teams/leave — Leave a draft team ────────────────────
export async function POST(_req: NextRequest) {
    const { session, res } = await requireRole("student")
    if (res) return res

    try {
        await dbConnect()
        const userId = session.user.id

        const proposal = await Proposal.findOne({
            "teamMembers.userId": userId,
            status: "draft",
        })

        if (!proposal) {
            return NextResponse.json({ error: "You are not in any draft team" }, { status: 404 })
        }

        if (proposal.teamLocked) {
            return NextResponse.json({ error: "Cannot leave a locked team" }, { status: 400 })
        }

        // If leader leaves, delete the whole draft
        if (proposal.leaderId.toString() === userId) {
            await Proposal.findByIdAndDelete(proposal._id)
            return NextResponse.json({ message: "Team disbanded (leader left)" })
        }

        // Otherwise remove just this member
        proposal.teamMembers = proposal.teamMembers.filter(
            (m: { userId: { toString: () => string } }) => m.userId.toString() !== userId
        )
        await proposal.save()

        return NextResponse.json({ message: "Left team successfully" })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
