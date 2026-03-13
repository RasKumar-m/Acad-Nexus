import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"
import { requireRole } from "@/lib/auth-guard"
import { parseBody } from "@/lib/zod-schemas"
import { z } from "zod"

const lockSchema = z.object({
    proposalId: z.string().min(1).max(50),
    title: z.string().trim().min(1).max(300),
    description: z.string().trim().min(20).max(5000),
    attachedFileUrl: z.string().url().max(2048).nullish(),
    attachedFileType: z.string().max(100).nullish(),
})

// ─── POST /api/teams/lock — Lock team & submit proposal ────────────
export async function POST(req: NextRequest) {
    const { session, res } = await requireRole("student")
    if (res) return res

    try {
        await dbConnect()
        const raw = await req.json()
        const parsed = parseBody(lockSchema, raw)
        if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

        const { proposalId, title, description, attachedFileUrl, attachedFileType } = parsed.data
        const userId = session.user.id

        const proposal = await Proposal.findById(proposalId)
        if (!proposal) {
            return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
        }

        // Only the team leader can lock
        if (proposal.leaderId.toString() !== userId) {
            return NextResponse.json({ error: "Only the team leader can lock the team" }, { status: 403 })
        }

        if (proposal.status !== "draft") {
            return NextResponse.json({ error: "Team is already submitted" }, { status: 400 })
        }

        if (proposal.teamMembers.length < 2) {
            return NextResponse.json(
                { error: "At least 2 members are required to submit" },
                { status: 400 }
            )
        }

        // Lock team and promote to pending
        proposal.title = title
        proposal.description = description
        proposal.attachedFileUrl = attachedFileUrl || null
        proposal.attachedFileType = attachedFileType || null
        proposal.teamLocked = true
        proposal.status = "pending"
        await proposal.save()

        return NextResponse.json(proposal.toObject())
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
