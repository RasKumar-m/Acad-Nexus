import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"

interface RouteContext {
    params: Promise<{ id: string }>
}

// POST /api/proposals/[id]/remarks — add a remark to a proposal
export async function POST(req: NextRequest, context: RouteContext) {
    try {
        await dbConnect()
        const { id } = await context.params
        const body = await req.json()
        const { from, fromRole, message, action } = body

        if (!from || !fromRole || !message) {
            return NextResponse.json(
                { error: "from, fromRole, and message are required" },
                { status: 400 }
            )
        }

        const proposal = await Proposal.findByIdAndUpdate(
            id,
            {
                $push: {
                    remarks: {
                        from,
                        fromRole,
                        message,
                        action: action ?? "feedback",
                        createdAt: new Date(),
                    },
                },
            },
            { new: true, runValidators: true }
        ).lean()

        if (!proposal) {
            return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
        }

        return NextResponse.json(proposal)
    } catch (error: unknown) {
        const message_ = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message_ }, { status: 500 })
    }
}
