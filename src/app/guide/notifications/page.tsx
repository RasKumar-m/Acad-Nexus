"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CalendarDays, MessageSquare, UserCheck, FileText, AlertTriangle, Check, BellOff, Loader2, Megaphone } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

type NotificationType = "deadline" | "feedback" | "assignment" | "proposal" | "system" | "circular"

interface NotificationDoc {
    _id: string
    type: NotificationType
    title: string
    message: string
    isRead: boolean
    postedBy?: string
    createdAt: string
}

function typeConfig(type: NotificationType) {
    switch (type) {
        case "deadline": return { icon: <CalendarDays className="w-5 h-5" />, color: "text-rose-500", bgColor: "bg-rose-50", borderColor: "border-l-rose-500", label: "Deadline" }
        case "feedback": return { icon: <MessageSquare className="w-5 h-5" />, color: "text-purple-500", bgColor: "bg-purple-50", borderColor: "border-l-purple-500", label: "Feedback" }
        case "assignment": return { icon: <UserCheck className="w-5 h-5" />, color: "text-emerald-500", bgColor: "bg-emerald-50", borderColor: "border-l-emerald-500", label: "Submission" }
        case "proposal": return { icon: <FileText className="w-5 h-5" />, color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-l-blue-500", label: "Proposal" }
        case "system": return { icon: <AlertTriangle className="w-5 h-5" />, color: "text-amber-500", bgColor: "bg-amber-50", borderColor: "border-l-amber-500", label: "System" }
        case "circular": return { icon: <Megaphone className="w-5 h-5" />, color: "text-orange-500", bgColor: "bg-orange-50", borderColor: "border-l-orange-500", label: "Announcement" }
        default: return { icon: <Bell className="w-5 h-5" />, color: "text-slate-500", bgColor: "bg-slate-50", borderColor: "border-l-slate-500", label: type }
    }
}

export default function GuideNotificationsPage() {
    const { user } = useAuth()
    const [notifications, setNotifications] = React.useState<NotificationDoc[]>([])
    const [loading, setLoading] = React.useState(true)
    const [alertFilter, setAlertFilter] = React.useState<"all" | NotificationType>("all")

    const fetchNotifications = React.useCallback(() => {
        if (!user?.email) return
        fetch(`/api/notifications?email=${encodeURIComponent(user.email)}&role=guide`)
            .then((r) => { if (!r.ok) throw new Error("Failed"); return r.json() })
            .then((data) => {
                setNotifications(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [user?.email])

    React.useEffect(() => { fetchNotifications() }, [fetchNotifications])

    React.useEffect(() => {
        if (!user?.email) return
        const interval = setInterval(fetchNotifications, 10000)
        return () => clearInterval(interval)
    }, [user?.email, fetchNotifications])

    const myAlerts = notifications.filter((n) => n.type !== "circular")
    const circulars = notifications.filter((n) => n.type === "circular")
    const unreadCount = myAlerts.filter((n) => !n.isRead).length

    const filteredAlerts = alertFilter === "all" ? myAlerts : myAlerts.filter((n) => n.type === alertFilter)

    async function markAsRead(id: string) {
        setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n))
        try {
            await fetch(`/api/notifications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead: true }) })
        } catch { /* ignore */ }
    }

    async function markAllRead() {
        if (!user?.email) return
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        try {
            await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: user.email }) })
        } catch { /* ignore */ }
    }

    const alertFilterButtons: { value: "all" | NotificationType; label: string }[] = [
        { value: "all", label: "All" },
        { value: "assignment", label: "Submissions" },
        { value: "proposal", label: "Proposals" },
        { value: "system", label: "System" },
    ]

    if (loading) {
        return <div className="flex items-center justify-center min-h-96"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
    }

    function renderNotificationCard(notif: NotificationDoc) {
        const cfg = typeConfig(notif.type)
        const date = new Date(notif.createdAt)
        return (
            <Card key={notif._id} className={`shadow-sm border-l-4 ${cfg.borderColor} transition-all hover:shadow-md cursor-pointer ${!notif.isRead ? "bg-blue-50/30" : "bg-white"}`} onClick={() => markAsRead(notif._id)}>
                <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`p-2.5 rounded-xl ${cfg.bgColor} ${cfg.color} shrink-0`}>{cfg.icon}</div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className={`text-sm ${!notif.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>{notif.title}</h3>
                                        {!notif.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-400">
                                <Badge variant="outline" className={`text-xs font-medium ${cfg.bgColor} ${cfg.color} border-transparent`}>{cfg.label}</Badge>
                                <span>{date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                                <span className="hidden sm:inline">{date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="flex flex-col gap-4 sm:gap-6 w-full px-4 sm:px-0 max-w-4xl mx-auto">
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2"><Bell className="w-5 sm:w-6 h-5 sm:h-6 text-slate-700" /> Notifications</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Stay updated with student submissions and announcements</p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <>
                            <Badge variant="outline" className="text-xs font-semibold border-blue-300 bg-blue-50 text-blue-700">{unreadCount} unread</Badge>
                            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={markAllRead}><Check className="w-3.5 h-3.5" /> Mark all read</Button>
                        </>
                    )}
                </div>
            </div>

            <Tabs defaultValue="alerts" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="alerts" className="gap-2 text-xs sm:text-sm">
                        <Bell className="w-4 h-4" /> My Alerts
                        {unreadCount > 0 && <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0 ml-1">{unreadCount}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="noticeboard" className="gap-2 text-xs sm:text-sm">
                        <Megaphone className="w-4 h-4" /> Notice Board
                        {circulars.length > 0 && <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 ml-1">{circulars.length}</Badge>}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="alerts">
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                        {alertFilterButtons.map((btn) => (
                            <Button key={btn.value} variant="outline" size="sm" className={`text-xs font-medium rounded-full px-4 transition-colors ${alertFilter === btn.value ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`} onClick={() => setAlertFilter(btn.value)}>
                                {btn.label}
                            </Button>
                        ))}
                    </div>

                    {filteredAlerts.length === 0 ? (
                        <Card className="shadow-sm border-slate-100">
                            <CardContent className="p-12 sm:p-16 flex flex-col items-center gap-3 text-slate-400">
                                <BellOff className="w-10 sm:w-12 h-10 sm:h-12 text-slate-300" />
                                <p className="font-semibold text-base sm:text-lg text-slate-500">No alerts</p>
                                <p className="text-xs sm:text-sm">{alertFilter === "all" ? "You're all caught up!" : "No alerts in this category."}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3 pb-8">
                            {filteredAlerts.map(renderNotificationCard)}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="noticeboard">
                    {circulars.length === 0 ? (
                        <Card className="shadow-sm border-slate-100">
                            <CardContent className="p-12 sm:p-16 flex flex-col items-center gap-3 text-slate-400">
                                <Megaphone className="w-10 sm:w-12 h-10 sm:h-12 text-slate-300" />
                                <p className="font-semibold text-base sm:text-lg text-slate-500">No announcements</p>
                                <p className="text-xs sm:text-sm">No department circulars have been posted yet.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3 pb-8">
                            {circulars.map((notif) => {
                                const cfg = typeConfig("circular")
                                const date = new Date(notif.createdAt)
                                return (
                                    <Card key={notif._id} className="shadow-sm border-l-4 border-l-orange-500 bg-white hover:shadow-md transition-all">
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <div className={`p-2.5 rounded-xl ${cfg.bgColor} ${cfg.color} shrink-0`}>{cfg.icon}</div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-sm font-semibold text-slate-800">{notif.title}</h3>
                                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed whitespace-pre-line">{notif.message}</p>
                                                    <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-400">
                                                        <Badge variant="outline" className="text-xs font-medium bg-orange-50 text-orange-500 border-transparent">Announcement</Badge>
                                                        {notif.postedBy && <span>by {notif.postedBy}</span>}
                                                        <span>{date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                                                        <span className="hidden sm:inline">{date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
