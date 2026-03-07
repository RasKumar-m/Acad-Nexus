import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import UploadedFile from "@/models/UploadedFile"
import { requireAuth } from "@/lib/auth-guard"

// DELETE /api/files/[id] — delete a file record (student own or admin)
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { session, res } = await requireAuth()
    if (res) return res

    try {
        await dbConnect()
        const { id } = await params

        // Students can only delete their own files
        if (session.user.role === "student") {
            const file = await UploadedFile.findById(id).select("studentId").lean()
            if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 })
            if (String(file.studentId) !== session.user.id) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 })
            }
        } else if (session.user.role !== "admin" && session.user.role !== "guide") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const deleted = await UploadedFile.findByIdAndDelete(id)
        if (!deleted) {
            return NextResponse.json({ error: "File not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true })
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
