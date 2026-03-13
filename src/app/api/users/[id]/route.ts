import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import {
    normalizeRole,
    validateEmail,
    validateName,
    validatePassword,
} from "@/lib/validation"
import { requireRole } from "@/lib/auth-guard"
import { patchUserSchema, parseBody } from "@/lib/zod-schemas"

interface RouteContext {
    params: Promise<{ id: string }>
}

// PATCH /api/users/[id] — update user fields (admin only)
export async function PATCH(req: NextRequest, context: RouteContext) {
    const { res } = await requireRole("admin")
    if (res) return res

    try {
        await dbConnect()
        const { id } = await context.params
        const raw = (await req.json()) as Record<string, unknown>
        const zodParsed = parseBody(patchUserSchema, raw)
        if (!zodParsed.success) return NextResponse.json({ error: zodParsed.error }, { status: 400 })
        const body = zodParsed.data

        const allowed: Record<string, unknown> = {}
        const safeFields = ["name", "email", "department", "expertise", "maxStudents", "role", "rollNumber", "assignedGuideId", "assignedGuideName"] as const
        for (const key of safeFields) {
            if (body[key] !== undefined) {
                allowed[key] = body[key]
            }
        }

        if (allowed.name !== undefined) {
            const nextName = String(allowed.name).trim()
            const err = validateName(nextName)
            if (err) return NextResponse.json({ error: err }, { status: 400 })
            allowed.name = nextName
        }

        if (allowed.email !== undefined) {
            const nextEmail = String(allowed.email).toLowerCase().trim()
            const err = validateEmail(nextEmail)
            if (err) return NextResponse.json({ error: err }, { status: 400 })
            const exists = await User.findOne({ email: nextEmail, _id: { $ne: id } }).select("_id").lean()
            if (exists) return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 })
            allowed.email = nextEmail
        }

        if (allowed.role !== undefined) {
            const role = normalizeRole(String(allowed.role))
            if (!role) return NextResponse.json({ error: "Invalid role" }, { status: 400 })
            allowed.role = role
        }

        if (allowed.maxStudents !== undefined) {
            const max = Number(allowed.maxStudents)
            if (Number.isNaN(max) || max < 1 || max > 50) {
                return NextResponse.json({ error: "maxStudents must be between 1 and 50" }, { status: 400 })
            }
            allowed.maxStudents = max
        }

        // If password is provided, hash it
        if (body.password) {
            const nextPassword = String(body.password)
            const name = allowed.name ? String(allowed.name) : undefined
            const email = allowed.email ? String(allowed.email) : undefined
            const passwordErr = validatePassword(nextPassword, name, email)
            if (passwordErr) {
                return NextResponse.json({ error: passwordErr }, { status: 400 })
            }
            allowed.password = await bcrypt.hash(nextPassword, 12)
        }

        const user = await User.findByIdAndUpdate(id, { $set: allowed }, {
            new: true,
            runValidators: true,
        }).select("-password").lean()

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// DELETE /api/users/[id] — delete user (admin only)
export async function DELETE(_req: NextRequest, context: RouteContext) {
    const { res } = await requireRole("admin")
    if (res) return res

    try {
        await dbConnect()
        const { id } = await context.params
        const user = await User.findByIdAndDelete(id)

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "User deleted" })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
