import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"

// GET /api/proposals  — list proposals (optional ?email= filter)
export async function GET(req: NextRequest) {
    try {
        await dbConnect()

        const email = req.nextUrl.searchParams.get("email")
        const filter = email ? { studentEmail: email.toLowerCase().trim() } : {}
        const proposals = await Proposal.find(filter).sort({ createdAt: -1 }).lean()

        return NextResponse.json(proposals)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// POST /api/proposals — create a new proposal
export async function POST(req: NextRequest) {
    try {
        await dbConnect()

        const body = await req.json()
        const {
            title,
            description,
            studentId,
            studentName,
            studentEmail,
            attachedFileUrl,
            attachedFileType,
        } = body

        if (!title || !description || !studentId || !studentName || !studentEmail) {
            return NextResponse.json(
                { error: "title, description, studentId, studentName, and studentEmail are required" },
                { status: 400 }
            )
        }

        const proposal = await Proposal.create({
            title,
            description,
            studentId,
            studentName,
            studentEmail: studentEmail.toLowerCase().trim(),
            attachedFileUrl: attachedFileUrl || null,
            attachedFileType: attachedFileType || null,
        })

        return NextResponse.json(proposal, { status: 201 })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
