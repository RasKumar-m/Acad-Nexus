import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"
import Notification from "@/models/Notification"
import { requireAuth, requireRole } from "@/lib/auth-guard"
import { createMilestoneSchema, parseBody } from "@/lib/zod-schemas"
import { sendEmail, milestoneAssignedEmail } from "@/lib/email"

interface RouteContext {
    params: Promise<{ id: string }>
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

// GET /api/proposals/[id]/milestones — list milestones for a proposal
export async function GET(_req: NextRequest, context: RouteContext) {
    const { res } = await requireAuth()
    if (res) return res

    try {
        await dbConnect()
        const { id } = await context.params
        const proposal = await Proposal.findById(id).select("milestones studentName studentEmail title").lean()

        if (!proposal) {
            return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
        }

        const milestones = serialiseMilestones(proposal.milestones)
        return NextResponse.json(milestones)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        console.error("Error fetching milestones:", message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// POST /api/proposals/[id]/milestones — create a new milestone (guide/admin)
export async function POST(req: NextRequest, context: RouteContext) {
    const { res } = await requireRole("guide", "admin")
    if (res) return res

    try {
        await dbConnect()
        const { id } = await context.params
        const raw = await req.json()
        const parsed = parseBody(createMilestoneSchema, raw)
        if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
        const body = parsed.data

        const proposal = await Proposal.findByIdAndUpdate(
            id,
            {
                $push: {
                    milestones: {
                        title: body.title,
                        description: body.description,
                        dueDate: body.dueDate,
                        status: "pending",
                        fileUrl: null,
                        fileName: null,
                        submittedAt: null,
                    },
                },
            },
            { new: true, runValidators: true }
        ).lean()

        if (!proposal) {
            return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
        }

        // Notify all team members about the new milestone
        try {
            const members = (proposal.teamMembers ?? []) as unknown as Array<{ userId: string; email: string }>
            await Promise.all(
                members.map((m) =>
                    Notification.create({
                        userId: String(m.userId),
                        userEmail: m.email,
                        type: "deadline",
                        title: "New Milestone Assigned",
                        message: `A new milestone "${body.title}" (due ${body.dueDate}) has been added to your project "${proposal.title}".`,
                        relatedId: String(proposal._id),
                    })
                )
            )

            // Send email to every team member about the new milestone
            await Promise.allSettled(
                members.map((m) => {
                    const email = milestoneAssignedEmail(
                        (m as unknown as { name?: string }).name || "Team Member",
                        String(proposal.title),
                        String(body.title),
                        String(body.dueDate)
                    )
                    return sendEmail((m as unknown as { email: string }).email, email.subject, email.html)
                })
            )
        } catch (_) {
            // Non-critical
        }

        return NextResponse.json(serialiseMilestones(proposal.milestones), { status: 201 })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        console.error("Error creating milestone:", message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
