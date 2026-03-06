import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import UploadedFile from "@/models/UploadedFile"

// DELETE /api/files/[id] — delete a file record
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const { id } = await params
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
