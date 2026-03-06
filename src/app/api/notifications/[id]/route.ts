import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Notification from "@/models/Notification"

interface RouteContext {
    params: Promise<{ id: string }>
}

// PATCH /api/notifications/[id] — mark single notification as read
export async function PATCH(_req: NextRequest, context: RouteContext) {
    try {
        await dbConnect()
        const { id } = await context.params

        const notification = await Notification.findByIdAndUpdate(
            id,
            { $set: { isRead: true } },
            { new: true }
        ).lean()

        if (!notification) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 })
        }

        return NextResponse.json(notification)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
