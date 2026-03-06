import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"

function toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10)
}

function buildRange(days: number): string[] {
    const out: string[] = []
    const now = new Date()
    for (let i = days - 1; i >= 0; i -= 1) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        out.push(toDateKey(d))
    }
    return out
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect()

        const studentEmail = req.nextUrl.searchParams.get("studentEmail")?.toLowerCase().trim()
        const daysParam = Number(req.nextUrl.searchParams.get("days") ?? "120")
        const days = Number.isNaN(daysParam) ? 120 : Math.min(Math.max(daysParam, 14), 365)

        if (!studentEmail) {
            return NextResponse.json({ error: "studentEmail is required" }, { status: 400 })
        }

        const since = new Date()
        since.setDate(since.getDate() - days + 1)

        const proposals = await Proposal.find({ studentEmail })
            .select("milestones")
            .lean()

        const activityMap: Record<string, number> = {}

        for (const proposal of proposals) {
            const milestones = Array.isArray(proposal.milestones) ? proposal.milestones : []
            for (const m of milestones) {
                const submittedAt = m?.submittedAt ? new Date(String(m.submittedAt)) : null
                if (!submittedAt || Number.isNaN(submittedAt.getTime()) || submittedAt < since) continue
                const key = toDateKey(submittedAt)
                activityMap[key] = (activityMap[key] ?? 0) + 1
            }
        }

        const range = buildRange(days)
        let currentStreak = 0
        let longestStreak = 0
        let running = 0

        for (const dayKey of range) {
            if ((activityMap[dayKey] ?? 0) > 0) {
                running += 1
                if (running > longestStreak) longestStreak = running
            } else {
                running = 0
            }
        }

        for (let i = range.length - 1; i >= 0; i -= 1) {
            if ((activityMap[range[i]] ?? 0) > 0) {
                currentStreak += 1
            } else {
                break
            }
        }

        return NextResponse.json({
            studentEmail,
            days,
            startDate: range[0],
            endDate: range[range.length - 1],
            activity: activityMap,
            totalActiveDays: Object.keys(activityMap).length,
            currentStreak,
            longestStreak,
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
