import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"
import Notification from "@/models/Notification"
import User from "@/models/User"
import { requireAuth, requireRole } from "@/lib/auth-guard"
import { patchMilestoneSchema, parseBody } from "@/lib/zod-schemas"

interface RouteContext {
    params: Promise<{ id: string; milestoneId: string }>
}

interface MilestoneDocLike {
    _id?: unknown
    title?: unknown
    description?: unknown
    dueDate?: unknown
    status?: unknown
    fileUrl?: unknown
    fileName?: unknown
    submissionLink?: unknown
    linkType?: unknown
    submittedAt?: unknown
    createdAt?: unknown
}

function serialiseMilestones(milestones: unknown): Array<Record<string, unknown>> {
    if (!Array.isArray(milestones)) return []

    return milestones.map((milestone) => {
        const m = (milestone ?? {}) as MilestoneDocLike
        return {
            _id: String(m._id ?? ""),
            title: String(m.title ?? ""),
            description: String(m.description ?? ""),
            dueDate: String(m.dueDate ?? ""),
            status: String(m.status ?? "pending"),
            fileUrl: m.fileUrl ? String(m.fileUrl) : null,
            fileName: m.fileName ? String(m.fileName) : null,
            submissionLink: m.submissionLink ? String(m.submissionLink) : null,
            linkType: m.linkType ? String(m.linkType) : null,
            submittedAt: m.submittedAt ? new Date(String(m.submittedAt)).toISOString() : null,
            createdAt: m.createdAt ? new Date(String(m.createdAt)).toISOString() : null,
        }
    })
}

// PATCH /api/proposals/[id]/milestones/[milestoneId] — submit file (student) or update status (guide)
export async function PATCH(req: NextRequest, context: RouteContext) {
    const { res } = await requireAuth()
    if (res) return res

    try {
        await dbConnect()
        const { id, milestoneId } = await context.params
        const raw = await req.json()
        const parsed = parseBody(patchMilestoneSchema, raw)
        if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
        const body = parsed.data

        const update: Record<string, unknown> = {}

        // Student submitting a file
        if (body.fileUrl && body.fileName) {
            update["milestones.$.fileUrl"] = body.fileUrl
            update["milestones.$.fileName"] = body.fileName
            update["milestones.$.submissionLink"] = null
            update["milestones.$.linkType"] = null
            update["milestones.$.status"] = "submitted"
            update["milestones.$.submittedAt"] = new Date()
        }

        // Student submitting a link
        if (body.submissionLink && body.linkType) {
            update["milestones.$.submissionLink"] = body.submissionLink
            update["milestones.$.linkType"] = body.linkType
            update["milestones.$.fileUrl"] = null
            update["milestones.$.fileName"] = null
            update["milestones.$.status"] = "submitted"
            update["milestones.$.submittedAt"] = new Date()
        }

        // Guide updating milestone status (e.g. reviewed, pending, submitted)
        if (body.status) {
            update["milestones.$.status"] = body.status
        }

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
        }

        const isStudentSubmission = !!(body.fileUrl || body.submissionLink)
        const isGuideReview = !!(body.status === "reviewed")

        const proposal = await Proposal.findOneAndUpdate(
            { _id: id, "milestones._id": milestoneId },
            { $set: update },
            { new: true, runValidators: true }
        ).lean()

        if (!proposal) {
            return NextResponse.json({ error: "Proposal or milestone not found" }, { status: 404 })
        }

        // Find the updated milestone title for notification message
        const updatedMilestone = (proposal.milestones as Array<{ _id?: unknown; title?: string }>)
            ?.find((m) => String(m._id) === milestoneId)
        const milestoneTitle = updatedMilestone?.title ?? "Milestone"

        // Notify guide when student submits a milestone
        if (isStudentSubmission && proposal.guideId) {
            try {
                const guide = await User.findById(proposal.guideId).select("email").lean()
                if (guide) {
                    await Notification.create({
                        userId: proposal.guideId,
                        userEmail: (guide as { email?: string }).email,
                        type: "assignment",
                        title: "Milestone Submitted",
                        message: `${proposal.studentName} has submitted "${milestoneTitle}" for project "${proposal.title}".`,
                        relatedId: String(proposal._id),
                    })
                }
            } catch (_) { /* non-critical */ }
        }

        // Notify all team members when guide marks milestone as reviewed
        if (isGuideReview) {
            try {
                const members = (proposal.teamMembers ?? []) as unknown as Array<{ userId: string; email: string }>
                await Promise.all(
                    members.map((m) =>
                        Notification.create({
                            userId: String(m.userId),
                            userEmail: m.email,
                            type: "feedback",
                            title: "Milestone Reviewed",
                            message: `Your milestone "${milestoneTitle}" for project "${proposal.title}" has been reviewed by your guide.`,
                            relatedId: String(proposal._id),
                        })
                    )
                )
            } catch (_) { /* non-critical */ }
        }

        return NextResponse.json(serialiseMilestones(proposal.milestones))
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// DELETE /api/proposals/[id]/milestones/[milestoneId] — remove a milestone (guide/admin)
export async function DELETE(_req: NextRequest, context: RouteContext) {
    const { res } = await requireRole("guide", "admin")
    if (res) return res

    try {
        await dbConnect()
        const { id, milestoneId } = await context.params

        const proposal = await Proposal.findByIdAndUpdate(
            id,
            { $pull: { milestones: { _id: milestoneId } } },
            { new: true }
        ).lean()

        if (!proposal) {
            return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
        }

        return NextResponse.json(serialiseMilestones(proposal.milestones))
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
