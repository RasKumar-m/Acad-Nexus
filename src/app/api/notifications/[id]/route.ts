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

// PUT /api/notifications/[id] — update a circular's title, message, or audience
export async function PUT(req: NextRequest, context: RouteContext) {
    try {
        await dbConnect()
        const { id } = await context.params
        const body = await req.json()
        const { title, message, targetAudience } = body

        if (!title || !message) {
            return NextResponse.json({ error: "title and message are required" }, { status: 400 })
        }

        const update: Record<string, unknown> = {
            title: String(title).trim(),
            message: String(message).trim(),
        }
        if (targetAudience && ["all", "student", "guide", "admin"].includes(targetAudience)) {
            update.targetAudience = targetAudience
        }

        const notification = await Notification.findByIdAndUpdate(
            id,
            { $set: update },
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

// DELETE /api/notifications/[id] — delete a notification
export async function DELETE(_req: NextRequest, context: RouteContext) {
    try {
        await dbConnect()
        const { id } = await context.params

        const notification = await Notification.findByIdAndDelete(id).lean()

        if (!notification) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
