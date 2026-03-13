import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { requireAuth } from "@/lib/auth-guard"

// GET /api/users/search?q=<rollNumber|name|email>
// Returns public-facing student details for team member lookup.
// Requires authentication; never exposes passwords.
export async function GET(req: NextRequest) {
    const { res } = await requireAuth()
    if (res) return res

    const q = req.nextUrl.searchParams.get("q")?.trim()
    if (!q || q.length < 2) {
        return NextResponse.json(
            { error: "Query must be at least 2 characters" },
            { status: 400 }
        )
    }

    // Cap at 100 chars to prevent regex denial-of-service
    if (q.length > 100) {
        return NextResponse.json(
            { error: "Query too long" },
            { status: 400 }
        )
    }

    try {
        await dbConnect()

        // Escape special regex characters from user input
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

        const students = await User.find({
            role: "student",
            $or: [
                { rollNumber: { $regex: escaped, $options: "i" } },
                { name: { $regex: escaped, $options: "i" } },
                { email: { $regex: escaped, $options: "i" } },
            ],
        })
            .select("_id name email rollNumber department")
            .limit(20)
            .lean()

        return NextResponse.json(students)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
