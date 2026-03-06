import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"

interface RouteContext {
    params: Promise<{ id: string; milestoneId: string }>
}

// PATCH /api/proposals/[id]/milestones/[milestoneId] — submit file to milestone (student) or review (guide)
export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        await dbConnect()
        const { id, milestoneId } = await context.params
        const body = await req.json()

        const update: Record<string, unknown> = {}

        // Student submitting a file
        if (body.fileUrl && body.fileName) {
            update["milestones.$.fileUrl"] = body.fileUrl
            update["milestones.$.fileName"] = body.fileName
            update["milestones.$.status"] = "submitted"
            update["milestones.$.submittedAt"] = new Date()
        }

        // Guide marking as reviewed
        if (body.status === "reviewed") {
            update["milestones.$.status"] = "reviewed"
        }

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
        }

        const proposal = await Proposal.findOneAndUpdate(
            { _id: id, "milestones._id": milestoneId },
            { $set: update },
            { new: true, runValidators: true }
        ).lean()

        if (!proposal) {
            return NextResponse.json({ error: "Proposal or milestone not found" }, { status: 404 })
        }

        return NextResponse.json(proposal.milestones)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// DELETE /api/proposals/[id]/milestones/[milestoneId] — remove a milestone (guide)
export async function DELETE(_req: NextRequest, context: RouteContext) {
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

        return NextResponse.json(proposal.milestones)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
