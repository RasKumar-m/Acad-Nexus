"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    MessageSquare,
    User,
    CalendarDays,
    Star,
    Inbox,
    FileText,
    Loader2,
} from "lucide-react"
import { useProposals } from "@/lib/proposal-context"
import { useAuth } from "@/lib/auth-context"

// ─── Types ──────────────────────────────────────────────────────────
interface FeedbackItem {
    id: string
    from: string
    fromRole: string
    initials: string
    avatarColor: string
    subject: string
    message: string
    date: string
    isRead: boolean
    priority: "normal" | "important"
}

// ─── Page ───────────────────────────────────────────────────────────
export default function FeedbackPage() {
    const { user } = useAuth()
    const { getProposalsByStudent, loading } = useProposals()

    const studentEmail = user?.email ?? ""
    const myProposals = getProposalsByStudent(studentEmail)

    // Convert proposal remarks into FeedbackItem format
    const proposalFeedback: FeedbackItem[] = myProposals.flatMap((p) =>
        p.remarks.map((r) => ({
            id: r._id ?? "",
            from: r.from,
            fromRole: r.fromRole === "Admin" ? "Administrator" : "Guide",
            initials: r.from.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
            avatarColor: r.fromRole === "Admin" ? "bg-slate-500" : "bg-blue-600",
            subject: `${r.action === "approved" ? "Proposal Approved" : r.action === "rejected" ? "Proposal Rejected" : "Feedback"} — ${p.title}`,
            message: r.message,
            date: r.date,
            isRead: false,
            priority: (r.action === "approved" || r.action === "rejected" ? "important" : "normal") as "important" | "normal",
        }))
    ).sort((a, b) => a.id < b.id ? 1 : -1)

    const [selectedId, setSelectedId] = React.useState<string | null>(null)

    const feedbacks = proposalFeedback
    const selectedFeedback = feedbacks.find((f) => f.id === selectedId) ?? null
    const unreadCount = feedbacks.filter((f) => !f.isRead).length

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
            {/* ─── Header ─────────────────────────────────────── */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Feedback</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        View remarks and feedback from your guide and administration on your proposals
                    </p>
                </div>
                {feedbacks.length > 0 && (
                    <Badge variant="outline" className="text-xs font-semibold border-blue-300 bg-blue-50 text-blue-700 w-fit">
                        {feedbacks.length} message{feedbacks.length !== 1 ? "s" : ""}
                    </Badge>
                )}
            </div>

            {/* ─── Feedback List ───────────────────────────────── */}
            {feedbacks.length === 0 ? (
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-16 flex flex-col items-center gap-3 text-slate-400">
                        <Inbox className="w-12 h-12 text-slate-300" />
                        <p className="font-semibold text-lg text-slate-500">No feedback yet</p>
                        <p className="text-sm">Submit your proposal to start receiving feedback from admin and guide.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pb-8">
                    {/* Left: List */}
                    <div className="lg:col-span-2 space-y-2">
                        {feedbacks.map((fb) => (
                            <Card
                                key={fb.id}
                                className={`shadow-sm cursor-pointer transition-all hover:shadow-md ${selectedId === fb.id ? "border-blue-400 ring-1 ring-blue-200" : "border-slate-100"}`}
                                onClick={() => setSelectedId(fb.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`${fb.avatarColor} w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                                            {fb.initials}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="text-sm truncate font-medium text-slate-800">
                                                    {fb.from}
                                                </h3>
                                                {fb.priority === "important" && (
                                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs truncate mt-0.5 font-semibold text-slate-700">
                                                {fb.subject}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1 truncate">
                                                {fb.message}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1.5">{fb.date}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Right: Detail */}
                    <div className="lg:col-span-3">
                        {selectedFeedback ? (
                            <Card className="shadow-sm border-slate-100 sticky top-6">
                                <CardContent className="p-6 space-y-5">
                                    {/* Header */}
                                    <div className="flex items-start gap-3">
                                        <div className={`${selectedFeedback.avatarColor} w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                            {selectedFeedback.initials}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-slate-900 text-sm">{selectedFeedback.from}</h3>
                                                <Badge variant="outline" className="text-xs border-slate-200 bg-slate-50 text-slate-500">
                                                    {selectedFeedback.fromRole}
                                                </Badge>
                                                {selectedFeedback.priority === "important" && (
                                                    <Badge variant="outline" className="text-xs border-amber-300 bg-amber-50 text-amber-700">
                                                        Important
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                {selectedFeedback.date}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Subject */}
                                    <div>
                                        <h2 className="font-bold text-lg text-slate-900">{selectedFeedback.subject}</h2>
                                    </div>

                                    {/* Message */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                            {selectedFeedback.message}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="shadow-sm border-slate-100">
                                <CardContent className="p-16 flex flex-col items-center gap-3 text-slate-400">
                                    <MessageSquare className="w-10 h-10 text-slate-300" />
                                    <p className="font-medium text-slate-500">Select a message to view</p>
                                    <p className="text-sm">Click on any feedback item to see its full content.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
