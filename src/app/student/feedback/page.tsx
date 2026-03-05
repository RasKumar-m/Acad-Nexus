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
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────
interface FeedbackItem {
    id: number
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

// ─── Mock Data ──────────────────────────────────────────────────────
const feedbackData: FeedbackItem[] = [
    {
        id: 1,
        from: "Dr. Aneela",
        fromRole: "Supervisor",
        initials: "DA",
        avatarColor: "bg-blue-600",
        subject: "Project Proposal Review",
        message:
            "Your project proposal looks promising. However, please add more details to the system architecture section. Also include a timeline with milestones for each phase of the project. I'd also like to see a brief literature review section before the next submission.",
        date: "March 3, 2026",
        isRead: true,
        priority: "important",
    },
    {
        id: 2,
        from: "Dr. Aneela",
        fromRole: "Supervisor",
        initials: "DA",
        avatarColor: "bg-blue-600",
        subject: "Progress Report Feedback",
        message:
            "Good progress so far. The database schema is well-designed. Focus on completing the authentication module by next week. Make sure to write unit tests as you go.",
        date: "February 20, 2026",
        isRead: true,
        priority: "normal",
    },
    {
        id: 3,
        from: "Admin Office",
        fromRole: "Administrator",
        initials: "AO",
        avatarColor: "bg-slate-500",
        subject: "File Submission Reminder",
        message:
            "Please upload your mid-semester progress report by the end of this week. Late submissions will not be accepted without prior approval from your supervisor.",
        date: "February 15, 2026",
        isRead: false,
        priority: "important",
    },
]

// ─── Page ───────────────────────────────────────────────────────────
export default function FeedbackPage() {
    const [feedbacks] = React.useState<FeedbackItem[]>(feedbackData)
    const [selectedId, setSelectedId] = React.useState<number | null>(null)

    const selectedFeedback = feedbacks.find((f) => f.id === selectedId) ?? null
    const unreadCount = feedbacks.filter((f) => !f.isRead).length

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
            {/* ─── Header ─────────────────────────────────────── */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Feedback</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        View feedback from your supervisor and administration
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Badge variant="outline" className="text-xs font-semibold border-blue-300 bg-blue-50 text-blue-700 w-fit">
                        {unreadCount} unread
                    </Badge>
                )}
            </div>

            {/* ─── Feedback List ───────────────────────────────── */}
            {feedbacks.length === 0 ? (
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-16 flex flex-col items-center gap-3 text-slate-400">
                        <Inbox className="w-12 h-12 text-slate-300" />
                        <p className="font-semibold text-lg text-slate-500">No feedback yet</p>
                        <p className="text-sm">Feedback from your supervisor will appear here.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pb-8">
                    {/* Left: List */}
                    <div className="lg:col-span-2 space-y-2">
                        {feedbacks.map((fb) => (
                            <Card
                                key={fb.id}
                                className={`shadow-sm cursor-pointer transition-all hover:shadow-md ${selectedId === fb.id ? "border-blue-400 ring-1 ring-blue-200" : "border-slate-100"} ${!fb.isRead ? "bg-blue-50/40" : ""}`}
                                onClick={() => setSelectedId(fb.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`${fb.avatarColor} w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                                            {fb.initials}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className={`text-sm truncate ${!fb.isRead ? "font-bold text-slate-900" : "font-medium text-slate-800"}`}>
                                                    {fb.from}
                                                </h3>
                                                {fb.priority === "important" && (
                                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                                                )}
                                            </div>
                                            <p className={`text-xs truncate mt-0.5 ${!fb.isRead ? "font-semibold text-slate-700" : "text-slate-600"}`}>
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
