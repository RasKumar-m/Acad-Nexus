import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"
import Notification from "@/models/Notification"

interface RouteContext {
    params: Promise<{ id: string }>
}

// GET /api/proposals/[id] — get single proposal
export async function GET(_req: NextRequest, context: RouteContext) {
    try {
        await dbConnect()
        const { id } = await context.params
        const proposal = await Proposal.findById(id).lean()

        if (!proposal) {
            return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
        }

        return NextResponse.json(proposal)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// PATCH /api/proposals/[id] — update proposal (status, supervisor, deadline, etc.)
export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        await dbConnect()
        const { id } = await context.params
        const body = await req.json()

        // Build update object — only allow safe fields
        const allowed: Record<string, unknown> = {}
        const safeFields = ["status", "supervisor", "guideId", "deadline"] as const
        for (const key of safeFields) {
            if (body[key] !== undefined) {
                allowed[key] = body[key]
            }
        }

        // If a remark is included alongside the status change, push it atomically
        const update: Record<string, unknown> = { $set: allowed }
        if (body.remark) {
            update.$push = {
                remarks: {
                    from: body.remark.from,
                    fromRole: body.remark.fromRole,
                    message: body.remark.message,
                    action: body.remark.action ?? "feedback",
                    createdAt: new Date(),
                },
            }
        }

        const proposal = await Proposal.findByIdAndUpdate(id, update, {
            new: true,
            runValidators: true,
        }).lean()

        if (!proposal) {
            return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
        }

        // Auto-create notification for the student when status changes
        if (body.status && proposal.studentEmail) {
            const statusLabels: Record<string, string> = {
                approved: "Approved",
                rejected: "Rejected",
                completed: "Completed",
            }
            const statusLabel = statusLabels[body.status]
            if (statusLabel) {
                const notifType = body.status === "completed" ? "system" : "proposal"
                const notifTitle = `Proposal ${statusLabel}`
                const notifMessage =
                    body.remark?.message ||
                    `Your proposal "${proposal.title}" has been ${statusLabel.toLowerCase()}.`
                try {
                    await Notification.create({
                        userId: proposal.studentId,
                        userEmail: proposal.studentEmail,
                        type: notifType,
                        title: notifTitle,
                        message: notifMessage,
                        relatedId: String(proposal._id),
                    })
                } catch (_) {
                    // Non-critical — don't fail the main operation
                }
            }
        }

        return NextResponse.json(proposal)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// DELETE /api/proposals/[id] — delete proposal
export async function DELETE(_req: NextRequest, context: RouteContext) {
    try {
        await dbConnect()
        const { id } = await context.params
        const proposal = await Proposal.findByIdAndDelete(id)

        if (!proposal) {
            return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Proposal deleted" })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
