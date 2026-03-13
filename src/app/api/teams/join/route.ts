import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"
import User from "@/models/User"
import { requireRole } from "@/lib/auth-guard"
import { parseBody } from "@/lib/zod-schemas"
import { z } from "zod"

const joinSchema = z.object({
    teamCode: z.string().trim().toUpperCase().min(1).max(10),
})

// ─── POST /api/teams/join — Join an existing team by code ───────────
export async function POST(req: NextRequest) {
    const { session, res } = await requireRole("student")
    if (res) return res

    try {
        await dbConnect()
        const raw = await req.json()
        const parsed = parseBody(joinSchema, raw)
        if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

        const { teamCode } = parsed.data
        const userId = session.user.id

        // Check if student is already on an active team
        const alreadyInTeam = await Proposal.findOne({
            "teamMembers.userId": userId,
            status: { $in: ["draft", "pending", "approved"] },
        }).select("_id teamCode").lean()

        if (alreadyInTeam) {
            return NextResponse.json(
                { error: "You are already part of an active team", teamCode: alreadyInTeam.teamCode },
                { status: 409 }
            )
        }

        // Find the draft proposal with this code
        const proposal = await Proposal.findOne({ teamCode, status: "draft" })
        if (!proposal) {
            return NextResponse.json({ error: "Invalid or expired team code" }, { status: 404 })
        }

        if (proposal.teamLocked) {
            return NextResponse.json({ error: "This team is already locked" }, { status: 400 })
        }

        if (proposal.teamMembers.length >= 5) {
            return NextResponse.json({ error: "Team is full (max 5 members)" }, { status: 400 })
        }

        // Check if already a member (shouldn't happen due to check above, but defensive)
        if (proposal.teamMembers.some((m: { userId: { toString: () => string } }) => m.userId.toString() === userId)) {
            return NextResponse.json({ error: "You are already in this team" }, { status: 409 })
        }

        // Get user details
        const user = await User.findById(userId).select("name email rollNumber").lean()
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        proposal.teamMembers.push({
            userId: new mongoose.Types.ObjectId(userId),
            name: user.name as string,
            email: user.email as string,
            rollNumber: (user.rollNumber as string) || undefined,
        })
        await proposal.save()

        return NextResponse.json({
            _id: proposal._id,
            teamCode: proposal.teamCode,
            teamMembers: proposal.teamMembers,
            teamLocked: proposal.teamLocked,
            status: proposal.status,
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
