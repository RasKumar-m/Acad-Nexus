import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

interface RouteContext {
    params: Promise<{ id: string }>
}

// PATCH /api/users/[id] — update user fields
export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        await dbConnect()
        const { id } = await context.params
        const body = await req.json()

        const allowed: Record<string, unknown> = {}
        const safeFields = ["name", "email", "department", "expertise", "maxStudents", "role"] as const
        for (const key of safeFields) {
            if (body[key] !== undefined) {
                allowed[key] = body[key]
            }
        }

        // If password is provided, hash it
        if (body.password) {
            allowed.password = await bcrypt.hash(body.password, 12)
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

// DELETE /api/users/[id] — delete user
export async function DELETE(_req: NextRequest, context: RouteContext) {
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
