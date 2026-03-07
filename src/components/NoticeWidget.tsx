"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Megaphone } from "lucide-react"
import Link from "next/link"

interface Circular {
    _id: string
    title: string
    message: string
    targetAudience: string
    postedBy?: string
    createdAt: string
}

interface NoticeWidgetProps {
    role: "student" | "guide"
}

export function NoticeWidget({ role }: NoticeWidgetProps) {
    const [circulars, setCirculars] = React.useState<Circular[]>([])
    const scrollRef = React.useRef<HTMLDivElement>(null)

    const audience = role === "student" ? "student" : "guide"
    const viewAllHref = role === "student" ? "/student/notifications" : "/guide/announcements"

    React.useEffect(() => {
        fetch(`/api/notifications?audience=${audience}`)
            .then((r) => (r.ok ? r.json() : []))
            .then((data: Circular[]) => setCirculars(data))
            .catch(() => {})
    }, [audience])

    if (circulars.length === 0) return null

    return (
        <Card className="shadow-sm border-slate-100 bg-white">
            <CardHeader className="pb-2 shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        <div className="p-1.5 bg-amber-100 rounded-lg">
                            <Megaphone className="w-4 h-4 text-amber-600" />
                        </div>
                        Latest Announcements
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-amber-500 text-white hover:bg-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {circulars.length}
                        </Badge>
                        <Link
                            href={viewAllHref}
                            className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline"
                        >
                            View all
                        </Link>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <div
                    ref={scrollRef}
                    className="max-h-52 overflow-y-auto space-y-2 scrollbar-hide"
                >
                    {circulars.slice(0, 5).map((c, idx) => (
                        <div
                            key={c._id}
                            className={`p-3.5 rounded-xl border transition-all ${
                                idx === 0
                                    ? "bg-amber-50 border-amber-200 ring-1 ring-amber-200/60"
                                    : "bg-slate-50 border-slate-200 hover:border-amber-200"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{c.title}</h4>
                                <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                                    {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-2 leading-relaxed">{c.message}</p>
                            {c.postedBy && (
                                <p className="text-[10px] text-slate-400 mt-1.5">— {c.postedBy}</p>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
