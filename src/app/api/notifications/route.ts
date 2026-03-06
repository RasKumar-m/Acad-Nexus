import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Notification from "@/models/Notification"

// GET /api/notifications?email=...&unread=true  — list notifications
export async function GET(req: NextRequest) {
    try {
        await dbConnect()

        const email = req.nextUrl.searchParams.get("email")
        const unreadOnly = req.nextUrl.searchParams.get("unread")

        const filter: Record<string, unknown> = {}
        if (email) filter.userEmail = email.toLowerCase().trim()
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

// POST /api/notifications — create a notification
export async function POST(req: NextRequest) {
    try {
        await dbConnect()

        const body = await req.json()
        const { userId, userEmail, type, title, message, relatedId } = body

        if (!userId || !userEmail || !title || !message) {
            return NextResponse.json(
                { error: "userId, userEmail, title, and message are required" },
                { status: 400 }
            )
        }

        const notification = await Notification.create({
            userId,
            userEmail: userEmail.toLowerCase().trim(),
            type: type || "system",
            title,
            message,
            relatedId: relatedId || "",
        })

        return NextResponse.json(notification, { status: 201 })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// PATCH /api/notifications — mark all as read for an email
export async function PATCH(req: NextRequest) {
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
