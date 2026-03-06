import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

// GET /api/users?role=student|guide|admin  — list users, optional role filter
export async function GET(req: NextRequest) {
    try {
        await dbConnect()

        const role = req.nextUrl.searchParams.get("role")
        const filter = role ? { role } : {}
        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json(users)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// POST /api/users — create a new user (admin action)
export async function POST(req: NextRequest) {
    try {
        await dbConnect()

        const body = await req.json()
        const { name, email, password, role, department, expertise, maxStudents } = body

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: "name, email, password, and role are required" },
                { status: 400 }
            )
        }

        const existing = await User.findOne({ email: email.toLowerCase().trim() })
        if (existing) {
            return NextResponse.json(
                { error: "A user with this email already exists" },
                { status: 409 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role,
            department: department || "",
            expertise: expertise || "",
            maxStudents: maxStudents || 5,
        })

        const userObj = user.toObject()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pw, ...safeUser } = userObj

        return NextResponse.json(safeUser, { status: 201 })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
