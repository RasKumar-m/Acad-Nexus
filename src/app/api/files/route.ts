import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import UploadedFile from "@/models/UploadedFile"
import { requireAuth, requireRole } from "@/lib/auth-guard"

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
        const body = await req.json()
        const { fileName, fileUrl, category, fileSize, studentId, studentName, studentEmail } = body

        // Students can only upload for themselves
        if (studentId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        if (!fileName || !fileUrl || !category || !studentId || !studentName || !studentEmail) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const file = await UploadedFile.create({
            fileName,
            fileUrl,
            category,
            fileSize: fileSize || "0 B",
            studentId,
            studentName,
            studentEmail,
        })

        return NextResponse.json(file, { status: 201 })
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
