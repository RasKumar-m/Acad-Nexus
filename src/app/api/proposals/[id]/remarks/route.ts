import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"
import { requireRole } from "@/lib/auth-guard"
import { createRemarkSchema, parseBody } from "@/lib/zod-schemas"

interface RouteContext {
    params: Promise<{ id: string }>
}

// POST /api/proposals/[id]/remarks — add a remark (guide/admin only)
export async function POST(req: NextRequest, context: RouteContext) {
    const { res } = await requireRole("guide", "admin")
    if (res) return res

    try {
        await dbConnect()
        const { id } = await context.params
        const raw = await req.json()
        const parsed = parseBody(createRemarkSchema, raw)
        if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
        const body = parsed.data

        const proposal = await Proposal.findByIdAndUpdate(
            id,
            {
                $push: {
                    remarks: {
                        from: body.from,
                        fromRole: body.fromRole,
                        message: body.message,
                        action: body.action,
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
