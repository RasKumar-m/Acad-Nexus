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
import { requireAuth, requireRole } from "@/lib/auth-guard"
import { createUserSchema, parseBody } from "@/lib/zod-schemas"

// GET /api/users?role=student|guide|admin
// Any authenticated user can list guides; admin required for other roles
export async function GET(req: NextRequest) {
    const role = req.nextUrl.searchParams.get("role")

    if (role === "guide") {
        const { res } = await requireAuth()
        if (res) return res
    } else {
        const { res } = await requireRole("admin")
        if (res) return res
    }

    try {
        await dbConnect()

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

// POST /api/users — create a new user (admin only)
export async function POST(req: NextRequest) {
    const { res } = await requireRole("admin")
    if (res) return res

    try {
        await dbConnect()

        const raw = (await req.json()) as Record<string, unknown>
        const zodParsed = parseBody(createUserSchema, raw)
        if (!zodParsed.success) return NextResponse.json({ error: zodParsed.error }, { status: 400 })
        const zodBody = zodParsed.data

        const normalized = normalizeUserInput(zodBody as unknown as Record<string, unknown>)
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
