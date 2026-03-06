import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import {
    normalizeUserInput,
    validateEmail,
    validateName,
    validatePassword,
} from "@/lib/validation"

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

        const body = (await req.json()) as Record<string, unknown>
        const normalized = normalizeUserInput(body)
        const { name, email, password, role, department, expertise, maxStudents } = normalized

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: "name, email, password, and role are required" },
                { status: 400 }
            )
        }

        const nameError = validateName(name)
        if (nameError) {
            return NextResponse.json({ error: nameError }, { status: 400 })
        }

        const emailError = validateEmail(email)
        if (emailError) {
            return NextResponse.json({ error: emailError }, { status: 400 })
        }

        const passwordError = validatePassword(password, name, email)
        if (passwordError) {
            return NextResponse.json({ error: passwordError }, { status: 400 })
        }

        if (role === "guide") {
            if (typeof maxStudents !== "number" || Number.isNaN(maxStudents) || maxStudents < 1 || maxStudents > 50) {
                return NextResponse.json({ error: "Guide maxStudents must be between 1 and 50" }, { status: 400 })
            }
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
            name,
            email,
            password: hashedPassword,
            role,
            department: department || "",
            expertise: expertise || "",
            maxStudents: role === "guide" ? maxStudents : undefined,
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
