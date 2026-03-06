import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import UploadedFile from "@/models/UploadedFile"

// GET  /api/files?email=...  — list files (all, or filtered by student email)
export async function GET(req: NextRequest) {
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

// POST /api/files — save a new file record after successful upload
export async function POST(req: NextRequest) {
    try {
        await dbConnect()
        const body = await req.json()
        const { fileName, fileUrl, category, fileSize, studentId, studentName, studentEmail } = body

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
