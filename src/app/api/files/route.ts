import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import UploadedFile from "@/models/UploadedFile"
import Proposal from "@/models/Proposal"
import { requireAuth, requireRole } from "@/lib/auth-guard"
import { createFileSchema, parseBody } from "@/lib/zod-schemas"

// GET  /api/files?email=...  — list files (all, or filtered by student email)
export async function GET(req: NextRequest) {
    const { res } = await requireAuth()
    if (res) return res

    try {
        await dbConnect()
        const email = req.nextUrl.searchParams.get("email")
        const filter = email ? { studentEmail: email } : {}
        const files = await UploadedFile.find(filter).sort({ createdAt: -1 }).lean()
        return NextResponse.json(files)
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

// POST /api/files — save a new file record (student only)
export async function POST(req: NextRequest) {
    const { session, res } = await requireRole("student")
    if (res) return res

    try {
        await dbConnect()
        const raw = await req.json()
        const parsed = parseBody(createFileSchema, raw)
        if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
        const body = parsed.data

        // Students can only upload for themselves
        if (body.studentId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const file = await UploadedFile.create({
            fileName: body.fileName,
            fileUrl: body.fileUrl,
            category: body.category,
            fileSize: body.fileSize,
            studentId: body.studentId,
            studentName: body.studentName,
            studentEmail: body.studentEmail,
        })

        return NextResponse.json(file, { status: 201 })
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
