import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Notification from "@/models/Notification"
import { requireAuth, requireRole } from "@/lib/auth-guard"

// GET /api/notifications?email=...&unread=true&audience=...&role=...  — list notifications
export async function GET(req: NextRequest) {
    const { res } = await requireAuth()
    if (res) return res

    try {
        await dbConnect()

        const email = req.nextUrl.searchParams.get("email")
        const unreadOnly = req.nextUrl.searchParams.get("unread")
        const audience = req.nextUrl.searchParams.get("audience") // "all" | "student" | "guide" | "admin"
        const role = req.nextUrl.searchParams.get("role")         // user's DB role: "student" | "guide"

        const filter: Record<string, unknown> = {}

        if (audience) {
            // Fetch circulars/broadcast notifications for a role
            // Return notices targeted at "all" OR at the specific role
            filter.$or = [
                { targetAudience: "all" },
                { targetAudience: audience },
            ]
            filter.type = "circular"
        } else if (email) {
            // Personal notifications + circulars matching the user's role
            const orConditions: Record<string, unknown>[] = [
                { userEmail: email.toLowerCase().trim() },
                { targetAudience: "all", type: "circular" },
            ]
            // If the caller passes their role, also include role-targeted circulars
            if (role && ["student", "guide", "admin"].includes(role)) {
                orConditions.push({ targetAudience: role, type: "circular" })
            }
            filter.$or = orConditions
        }

        if (unreadOnly === "true") filter.isRead = false

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()

        return NextResponse.json(notifications)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// POST /api/notifications — create a notification (admin/guide only)
export async function POST(req: NextRequest) {
    const { res } = await requireRole("guide", "admin")
    if (res) return res

    try {
        await dbConnect()

        const body = await req.json()
        const { userId, userEmail, type, title, message, relatedId, targetAudience, postedBy } = body

        if (!title || !message) {
            return NextResponse.json(
                { error: "title and message are required" },
                { status: 400 }
            )
        }

        // For circulars, userId/userEmail are not needed
        const isCircular = type === "circular" || (targetAudience && targetAudience !== "individual")

        if (!isCircular && (!userId || !userEmail)) {
            return NextResponse.json(
                { error: "userId and userEmail are required for personal notifications" },
                { status: 400 }
            )
        }

        const notification = await Notification.create({
            ...(userId && { userId }),
            ...(userEmail && { userEmail: userEmail.toLowerCase().trim() }),
            type: type || (isCircular ? "circular" : "system"),
            targetAudience: targetAudience || "individual",
            title,
            message,
            relatedId: relatedId || "",
            ...(postedBy && { postedBy }),
        })

        return NextResponse.json(notification, { status: 201 })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// PATCH /api/notifications — mark all as read for an email
export async function PATCH(req: NextRequest) {
    const { res } = await requireAuth()
    if (res) return res

    try {
        await dbConnect()

        const body = await req.json()
        const { email } = body

        if (!email) {
            return NextResponse.json({ error: "email is required" }, { status: 400 })
        }

        await Notification.updateMany(
            { userEmail: email.toLowerCase().trim(), isRead: false },
            { $set: { isRead: true } }
        )

        return NextResponse.json({ message: "All notifications marked as read" })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
