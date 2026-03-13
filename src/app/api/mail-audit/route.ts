import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import MailAudit from "@/models/MailAudit"
import { requireRole } from "@/lib/auth-guard"

const ALLOWED_STATUS = new Set(["sent", "failed"])

function parsePositiveInt(value: string | null, fallback: number, max: number): number {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback
    return Math.min(Math.floor(parsed), max)
}

// GET /api/mail-audit?status=sent|failed&to=student@x.com&startDate=ISO&endDate=ISO&page=1&limit=20
export async function GET(req: NextRequest) {
    const { res } = await requireRole("admin")
    if (res) return res

    try {
        await dbConnect()

        const params = req.nextUrl.searchParams
        const status = params.get("status")?.trim().toLowerCase()
        const to = params.get("to")?.trim().toLowerCase()
        const startDateRaw = params.get("startDate")?.trim()
        const endDateRaw = params.get("endDate")?.trim()

        const page = parsePositiveInt(params.get("page"), 1, 100000)
        const limit = parsePositiveInt(params.get("limit"), 20, 100)
        const skip = (page - 1) * limit

        const filter: Record<string, unknown> = {}

        if (status) {
            if (!ALLOWED_STATUS.has(status)) {
                return NextResponse.json(
                    { error: "status must be one of: sent, failed" },
                    { status: 400 }
                )
            }
            filter.status = status
        }

        if (to) {
            filter.to = { $in: [to] }
        }

        if (startDateRaw || endDateRaw) {
            const createdAt: Record<string, Date> = {}

            if (startDateRaw) {
                const startDate = new Date(startDateRaw)
                if (Number.isNaN(startDate.getTime())) {
                    return NextResponse.json({ error: "Invalid startDate" }, { status: 400 })
                }
                createdAt.$gte = startDate
            }

            if (endDateRaw) {
                const endDate = new Date(endDateRaw)
                if (Number.isNaN(endDate.getTime())) {
                    return NextResponse.json({ error: "Invalid endDate" }, { status: 400 })
                }
                createdAt.$lte = endDate
            }

            filter.createdAt = createdAt
        }

        const [items, total] = await Promise.all([
            MailAudit.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            MailAudit.countDocuments(filter),
        ])

        return NextResponse.json({
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
            filters: {
                status: status || null,
                to: to || null,
                startDate: startDateRaw || null,
                endDate: endDateRaw || null,
            },
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
