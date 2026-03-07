"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Loader2 } from "lucide-react"

interface Circular {
    _id: string
    title: string
    message: string
    targetAudience: string
    postedBy?: string
    createdAt: string
}

export default function GuideAnnouncementsPage() {
    const [circulars, setCirculars] = React.useState<Circular[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        fetch("/api/notifications?audience=guide")
            .then((r) => (r.ok ? r.json() : []))
            .then((data: Circular[]) => setCirculars(data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return <div className="flex items-center justify-center min-h-96"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-amber-500" /> Announcements
                </h1>
                <p className="text-sm text-slate-500 mt-1">All department circulars and notices from administration</p>
            </div>

            {circulars.length === 0 ? (
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-16 flex flex-col items-center gap-3 text-slate-400">
                        <Megaphone className="w-12 h-12 text-slate-300" />
                        <p className="font-semibold text-lg text-slate-500">No announcements yet</p>
                        <p className="text-sm">No department circulars have been posted.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3 pb-8">
                    {circulars.map((c) => {
                        const date = new Date(c.createdAt)
                        const audienceLabel = c.targetAudience === "all" ? "Everyone" : c.targetAudience === "student" ? "Students" : c.targetAudience === "guide" ? "Guides" : c.targetAudience
                        const audienceColor = c.targetAudience === "all" ? "bg-violet-100 text-violet-700" : c.targetAudience === "student" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                        return (
                            <Card key={c._id} className="shadow-sm border-l-4 border-l-orange-500 bg-white hover:shadow-md transition-all">
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="p-2.5 rounded-xl bg-orange-50 text-orange-500 shrink-0">
                                            <Megaphone className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-sm font-semibold text-slate-800">{c.title}</h3>
                                                <Badge className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${audienceColor}`}>
                                                    {audienceLabel}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-1 leading-relaxed whitespace-pre-line">{c.message}</p>
                                            <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-400">
                                                {c.postedBy && <span>Posted by {c.postedBy}</span>}
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
        </div>
    )
}
