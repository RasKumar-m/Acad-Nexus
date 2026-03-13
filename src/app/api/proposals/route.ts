import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"
import { requireAuth, requireRole } from "@/lib/auth-guard"
import { createProposalSchema, parseBody } from "@/lib/zod-schemas"

// GET /api/proposals  — list proposals (optional ?email= filter)
export async function GET(req: NextRequest) {
    const { res } = await requireAuth()
    if (res) return res

    try {
        await dbConnect()

        const email = req.nextUrl.searchParams.get("email")
        const filter = email
            ? { "teamMembers.email": email.toLowerCase().trim(), status: { $ne: "draft" } }
            : { status: { $ne: "draft" } }
        const proposals = await Proposal.find(filter).sort({ createdAt: -1 }).lean()

        return NextResponse.json(proposals)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// POST /api/proposals — create a new proposal (student only)
export async function POST(req: NextRequest) {
    const { session, res } = await requireRole("student")
    if (res) return res

    try {
        await dbConnect()

        const raw = await req.json()
        const parsed = parseBody(createProposalSchema, raw)
        if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
        const body = parsed.data

        // Students can only create proposals for themselves
        if (body.studentId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const proposal = await Proposal.create({
            title: body.title,
            description: body.description,
            studentId: body.studentId,
            studentName: body.studentName,
            studentEmail: body.studentEmail,
            leaderId: body.leaderId,
            teamMembers: body.teamMembers,
            attachedFileUrl: body.attachedFileUrl || null,
            attachedFileType: body.attachedFileType || null,
        })

        return NextResponse.json(proposal, { status: 201 })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
