"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Megaphone, ChevronDown } from "lucide-react"
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
    const [isAtBottom, setIsAtBottom] = React.useState(false)

    const audience = role === "student" ? "student" : "guide"
    const viewAllHref = role === "student" ? "/student/notifications" : "/guide/announcements"

    React.useEffect(() => {
        fetch(`/api/notifications?audience=${audience}`)
            .then((r) => (r.ok ? r.json() : []))
            .then((data: Circular[]) => setCirculars(data))
            .catch(() => {})
    }, [audience])

    React.useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        function handleScroll() {
            if (!el) return
            setIsAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 5)
        }
        el.addEventListener("scroll", handleScroll)
        handleScroll()
        return () => el.removeEventListener("scroll", handleScroll)
    }, [circulars])

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
            <CardContent className="relative pb-3">
                {/* Snap-scroll container — adaptive height, scrolls when content is tall */}
                <div
                    ref={scrollRef}
                    className="max-h-44 overflow-y-auto snap-y snap-mandatory scrollbar-hide"
                >
                    {circulars.slice(0, 5).map((c, idx) => (
                        <div
                            key={c._id}
                            className="snap-start min-h-[11rem] flex items-center px-1"
                        >
                            <div
                                className={`w-full p-4 rounded-xl border transition-all ${
                                    idx === 0
                                        ? "bg-amber-50 border-amber-200 ring-1 ring-amber-200/60"
                                        : "bg-slate-50 border-slate-200 hover:border-amber-200"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{c.title}</h4>
                                    <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                                        {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-3 leading-relaxed">{c.message}</p>
                                {c.postedBy && (
                                    <p className="text-[10px] text-slate-400 mt-2">— {c.postedBy}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bounce arrow indicator — hidden when scrolled to bottom */}
                {circulars.length > 1 && !isAtBottom && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-amber-400 animate-bounce" />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
