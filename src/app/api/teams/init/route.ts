import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import mongoose from "mongoose"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"
import User from "@/models/User"
import { requireRole } from "@/lib/auth-guard"

/** Generate a unique 6-char alphanumeric code prefixed by NEXUS- */
function generateTeamCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/O/1/I confusion
    let code = ""
    const bytes = crypto.randomBytes(4)
    for (let i = 0; i < 4; i++) {
        code += chars[bytes[i] % chars.length]
    }
    return `NEXUS-${code}`
}

// ─── POST /api/teams/init — Start a new project (create draft proposal with team code) ───
export async function POST(req: NextRequest) {
    const { session, res } = await requireRole("student")
    if (res) return res

    try {
        await dbConnect()

        const userId = session.user.id

        // Check if student is already on an active team (draft/pending/approved)
        const existing = await Proposal.findOne({
            "teamMembers.userId": userId,
            status: { $in: ["draft", "pending", "approved"] },
        }).select("_id teamCode status").lean()

        if (existing) {
            return NextResponse.json(
                { error: "You are already part of an active team", teamCode: existing.teamCode },
                { status: 409 }
            )
        }

        // Get full user info for the leader
        const leader = await User.findById(userId).select("name email rollNumber").lean()
        if (!leader) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Generate unique team code (retry on collision)
        let teamCode = generateTeamCode()
        for (let attempt = 0; attempt < 5; attempt++) {
            const collision = await Proposal.findOne({ teamCode }).select("_id").lean()
            if (!collision) break
            teamCode = generateTeamCode()
        }

        const oid = new mongoose.Types.ObjectId(userId)

        const proposal = await Proposal.create({
            title: "",
            description: "",
            studentId: oid,
            studentName: leader.name,
            studentEmail: leader.email,
            leaderId: oid,
            teamMembers: [
                {
                    userId: oid,
                    name: leader.name,
                    email: leader.email,
                    rollNumber: (leader.rollNumber as string) || undefined,
                },
            ],
            teamCode,
            teamLocked: false,
            status: "draft",
        })

        return NextResponse.json(
            {
                _id: proposal._id,
                teamCode: proposal.teamCode,
                teamMembers: proposal.teamMembers,
                teamLocked: proposal.teamLocked,
                status: proposal.status,
            },
            { status: 201 }
        )
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
