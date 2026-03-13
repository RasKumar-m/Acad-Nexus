import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"
import Notification from "@/models/Notification"
import { requireAuth, requireRole } from "@/lib/auth-guard"
import { patchProposalStudentSchema, patchProposalAdminSchema, parseBody } from "@/lib/zod-schemas"
import { getDefaultStudentDashboardUrl, sendNexusEmailNonBlocking } from "@/lib/mailer"

interface RouteContext {
    params: Promise<{ id: string }>
}

// GET /api/proposals/[id] — get single proposal
export async function GET(_req: NextRequest, context: RouteContext) {
    const { res } = await requireAuth()
    if (res) return res

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
    const { session, res } = await requireAuth()
    if (res) return res

    try {
        await dbConnect()
        const { id } = await context.params
        const body = await req.json()

        const role = session.user.role

        // Students can only edit title/description on their own pending proposals
        if (role === "student") {
            const proposal = await Proposal.findById(id).select("leaderId teamMembers status").lean()
            if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
            // Only the team leader can edit
            if (String(proposal.leaderId) !== session.user.id) {
                return NextResponse.json({ error: "Only the team leader can edit the proposal" }, { status: 403 })
            }
            if (proposal.status !== "pending") {
                return NextResponse.json({ error: "Only pending proposals can be edited" }, { status: 403 })
            }
            // Students may only change title and description
            const studentParsed = parseBody(patchProposalStudentSchema, body)
            if (!studentParsed.success) return NextResponse.json({ error: studentParsed.error }, { status: 400 })
            const studentBody = studentParsed.data
            const studentAllowed: Record<string, unknown> = {}
            if (studentBody.title !== undefined) studentAllowed.title = studentBody.title
            if (studentBody.description !== undefined) studentAllowed.description = studentBody.description
            const updated = await Proposal.findByIdAndUpdate(id, { $set: studentAllowed }, { new: true, runValidators: true }).lean()
            return NextResponse.json(updated)
        }

        // Admin and Guide can update status, supervisor, deadline, etc.
        if (role !== "admin" && role !== "guide") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const adminParsed = parseBody(patchProposalAdminSchema, body)
        if (!adminParsed.success) return NextResponse.json({ error: adminParsed.error }, { status: 400 })
        const adminBody = adminParsed.data

        // Build update object — only allow safe fields
        const allowed: Record<string, unknown> = {}
        const safeFields = ["status", "supervisor", "guideId", "deadline", "title", "description"] as const
        for (const key of safeFields) {
            if (adminBody[key] !== undefined) {
                allowed[key] = adminBody[key]
            }
        }

        // If a remark is included alongside the status change, push it atomically
        const update: Record<string, unknown> = { $set: allowed }
        if (adminBody.remark) {
            update.$push = {
                remarks: {
                    from: adminBody.remark.from,
                    fromRole: adminBody.remark.fromRole,
                    message: adminBody.remark.message,
                    action: adminBody.remark.action ?? "feedback",
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

        // Auto-create notification for all team members when status changes
        if (adminBody.status && proposal.teamMembers && Array.isArray(proposal.teamMembers)) {
            const statusLabels: Record<string, string> = {
                approved: "Approved",
                rejected: "Rejected",
                completed: "Completed",
            }
            const statusLabel = statusLabels[adminBody.status!]
            if (statusLabel) {
                const notifType = adminBody.status === "completed" ? "system" : "proposal"
                const notifTitle = `Proposal ${statusLabel}`
                const notifMessage =
                    adminBody.remark?.message ||
                    `Your proposal "${proposal.title}" has been ${statusLabel.toLowerCase()}.`
                try {
                    // Notify every team member
                    const members = proposal.teamMembers as unknown as Array<{ userId: string; email: string; name?: string }>
                    await Promise.all(
                        members.map((m) =>
                            Notification.create({
                                userId: String(m.userId),
                                userEmail: m.email,
                                type: notifType,
                                title: notifTitle,
                                message: notifMessage,
                                relatedId: String(proposal._id),
                            })
                        )
                    )

                    for (const m of members) {
                        sendNexusEmailNonBlocking({
                            to: m.email,
                            subject: notifTitle,
                            heading: notifTitle,
                            intro: `There is a new update on your proposal \"${proposal.title}\".`,
                            blocks: [
                                { label: "Project", value: String(proposal.title) },
                                { label: "Status", value: statusLabel },
                                { label: "Message", value: notifMessage },
                            ],
                            ctaLabel: "View Proposal",
                            ctaUrl: getDefaultStudentDashboardUrl("/student/submit-proposal"),
                        })
                    }
                } catch (_) {
                    // Non-critical — don't fail the main operation
                }
            }
        }

        // If a remark is added (feedback path), email all team members.
        if (adminBody.remark && proposal.teamMembers && Array.isArray(proposal.teamMembers)) {
            const members = proposal.teamMembers as unknown as Array<{ email: string }>
            for (const m of members) {
                sendNexusEmailNonBlocking({
                    to: m.email,
                    subject: "New Proposal Feedback",
                    heading: "New Feedback From Guide/Admin",
                    intro: `A new remark was added to your proposal \"${proposal.title}\".`,
                    blocks: [
                        { label: "From", value: adminBody.remark.from },
                        { label: "Role", value: adminBody.remark.fromRole },
                        { label: "Feedback", value: adminBody.remark.message },
                    ],
                    ctaLabel: "View Feedback",
                    ctaUrl: getDefaultStudentDashboardUrl("/student/feedback"),
                })
            }
        }

        return NextResponse.json(proposal)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// DELETE /api/proposals/[id] — delete proposal (student own pending, or admin)
export async function DELETE(_req: NextRequest, context: RouteContext) {
    const { session, res: authRes } = await requireAuth()
    if (authRes) return authRes

    try {
        await dbConnect()
        const { id } = await context.params

        // Students can only delete their own pending proposals (leader only)
        if (session.user.role === "student") {
            const existing = await Proposal.findById(id).select("leaderId status").lean()
            if (!existing) return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
            if (String(existing.leaderId) !== session.user.id) {
                return NextResponse.json({ error: "Only the team leader can delete the proposal" }, { status: 403 })
            }
            if (existing.status !== "pending" && existing.status !== "draft") {
                return NextResponse.json({ error: "Only pending/draft proposals can be deleted" }, { status: 403 })
            }
        } else if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

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
