"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Bell,
    CheckCircle2,
    Clock,
    FileText,
    MessageSquare,
    UserCheck,
    AlertTriangle,
    CalendarDays,
    Check,
    BellOff,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────
type NotificationType = "deadline" | "feedback" | "supervisor" | "project" | "system"

interface Notification {
    id: number
    type: NotificationType
    title: string
    message: string
    date: string
    time: string
    isRead: boolean
}

// ─── Mock Data ──────────────────────────────────────────────────────
const initialNotifications: Notification[] = [
    {
        id: 1,
        type: "deadline",
        title: "Upcoming Deadline",
        message: "Your progress report submission is due in 3 days. Make sure to upload all required documents before the deadline.",
        date: "March 5, 2026",
        time: "10:30 AM",
        isRead: false,
    },
    {
        id: 2,
        type: "feedback",
        title: "New Feedback Received",
        message: "Dr. Aneela has provided feedback on your project proposal. Check the Feedback section for details.",
        date: "March 3, 2026",
        time: "2:15 PM",
        isRead: false,
    },
    {
        id: 3,
        type: "supervisor",
        title: "Supervisor Request Update",
        message: "Your supervision request to Dr. Aneela has been approved. You can now view your supervisor details.",
        date: "February 28, 2026",
        time: "9:00 AM",
        isRead: true,
    },
    {
        id: 4,
        type: "project",
        title: "Project Status Updated",
        message: "Your project 'Smart Deadline & Project Tracking System' has been approved by the admin. You can now proceed with the implementation phase.",
        date: "February 25, 2026",
        time: "4:45 PM",
        isRead: true,
    },
    {
        id: 5,
        type: "system",
        title: "System Maintenance",
        message: "The system will undergo scheduled maintenance on March 10, 2026 from 2:00 AM to 6:00 AM. Please save your work before this time.",
        date: "February 20, 2026",
        time: "8:00 AM",
        isRead: true,
    },
    {
        id: 6,
        type: "deadline",
        title: "Final Submission Reminder",
        message: "Remember that the final project submission deadline is December 10, 2027. Plan your milestones accordingly.",
        date: "February 15, 2026",
        time: "11:00 AM",
        isRead: true,
    },
]

// ─── Helpers ────────────────────────────────────────────────────────
function typeConfig(type: NotificationType) {
    switch (type) {
        case "deadline":
            return {
                icon: <CalendarDays className="w-5 h-5" />,
                color: "text-rose-500",
                bgColor: "bg-rose-50",
                borderColor: "border-l-rose-500",
                label: "Deadline",
            }
        case "feedback":
            return {
                icon: <MessageSquare className="w-5 h-5" />,
                color: "text-purple-500",
                bgColor: "bg-purple-50",
                borderColor: "border-l-purple-500",
                label: "Feedback",
            }
        case "supervisor":
            return {
                icon: <UserCheck className="w-5 h-5" />,
                color: "text-emerald-500",
                bgColor: "bg-emerald-50",
                borderColor: "border-l-emerald-500",
                label: "Supervisor",
            }
        case "project":
            return {
                icon: <FileText className="w-5 h-5" />,
                color: "text-blue-500",
                bgColor: "bg-blue-50",
                borderColor: "border-l-blue-500",
                label: "Project",
            }
        case "system":
            return {
                icon: <AlertTriangle className="w-5 h-5" />,
                color: "text-amber-500",
                bgColor: "bg-amber-50",
                borderColor: "border-l-amber-500",
                label: "System",
            }
    }
}

// ─── Page ───────────────────────────────────────────────────────────
export default function NotificationsPage() {
    const [notifications, setNotifications] = React.useState<Notification[]>(initialNotifications)
    const [filterType, setFilterType] = React.useState<"all" | NotificationType>("all")

    const unreadCount = notifications.filter((n) => !n.isRead).length

    const filtered = filterType === "all"
        ? notifications
        : notifications.filter((n) => n.type === filterType)

    function markAsRead(id: number) {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        )
    }

    function markAllRead() {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    }

    const filterButtons: { value: "all" | NotificationType; label: string }[] = [
        { value: "all", label: "All" },
        { value: "deadline", label: "Deadlines" },
        { value: "feedback", label: "Feedback" },
        { value: "supervisor", label: "Supervisor" },
        { value: "project", label: "Project" },
        { value: "system", label: "System" },
    ]

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
            {/* ─── Header ─────────────────────────────────────── */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Bell className="w-6 h-6 text-slate-700" />
                        Notifications
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Stay updated with your project activities and announcements
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <>
                            <Badge variant="outline" className="text-xs font-semibold border-blue-300 bg-blue-50 text-blue-700">
                                {unreadCount} unread
                            </Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs gap-1.5"
                                onClick={markAllRead}
                            >
                                <Check className="w-3.5 h-3.5" />
                                Mark all read
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* ─── Filter Chips ────────────────────────────────── */}
            <div className="flex items-center gap-2 flex-wrap">
                {filterButtons.map((btn) => (
                    <Button
                        key={btn.value}
                        variant="outline"
                        size="sm"
                        className={`text-xs font-medium rounded-full px-4 transition-colors ${filterType === btn.value
                            ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white"
                            : "bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                        onClick={() => setFilterType(btn.value)}
                    >
                        {btn.label}
                    </Button>
                ))}
            </div>

            {/* ─── Notification List ──────────────────────────── */}
            {filtered.length === 0 ? (
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-16 flex flex-col items-center gap-3 text-slate-400">
                        <BellOff className="w-12 h-12 text-slate-300" />
                        <p className="font-semibold text-lg text-slate-500">No notifications</p>
                        <p className="text-sm">
                            {filterType === "all"
                                ? "You're all caught up!"
                                : "No notifications in this category."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3 pb-8">
                    {filtered.map((notif) => {
                        const cfg = typeConfig(notif.type)

                        return (
                            <Card
                                key={notif.id}
                                className={`shadow-sm border-l-4 ${cfg.borderColor} transition-all hover:shadow-md cursor-pointer ${!notif.isRead ? "bg-blue-50/30" : "bg-white"}`}
                                onClick={() => markAsRead(notif.id)}
                            >
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        {/* Icon */}
                                        <div className={`p-2.5 rounded-xl ${cfg.bgColor} ${cfg.color} shrink-0`}>
                                            {cfg.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className={`text-sm ${!notif.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                                                            {notif.title}
                                                        </h3>
                                                        {!notif.isRead && (
                                                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                                        {notif.message}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-400">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs font-medium ${cfg.bgColor} ${cfg.color} border-transparent`}
                                                >
                                                    {cfg.label}
                                                </Badge>
                                                <span>{notif.date}</span>
                                                <span className="hidden sm:inline">{notif.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
