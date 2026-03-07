import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth-options"

type Role = "admin" | "guide" | "student"

const unauthorized = () =>
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })

const forbidden = () =>
    NextResponse.json({ error: "Forbidden" }, { status: 403 })

/**
 * Require an authenticated session.
 * Returns the session or a 401 NextResponse.
 */
export async function requireAuth() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { session: null as never, res: unauthorized() }
    return { session, res: null }
}

/**
 * Require an authenticated session with one of the specified roles.
 * Returns the session or a 401/403 NextResponse.
 */
export async function requireRole(...roles: Role[]) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { session: null as never, res: unauthorized() }
    if (!roles.includes(session.user.role as Role))
        return { session, res: forbidden() }
    return { session, res: null }
}
