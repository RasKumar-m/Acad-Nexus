"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Clock, CheckCircle2, ArrowUpRight, FolderOpen, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useProposals } from "@/lib/proposal-context"

export default function GuideDashboard() {
    const { user } = useAuth()
    const { proposals, loading: proposalsLoading } = useProposals()
    const [fileCount, setFileCount] = React.useState(0)
    const [loading, setLoading] = React.useState(true)

    // Filter proposals where this guide is the supervisor
    const myProposals = React.useMemo(
        () => proposals.filter((p) => p.supervisor === user?.name),
        [proposals, user?.name]
    )

    const assignedCount = myProposals.length
    const pendingCount = myProposals.filter((p) => p.status === "pending").length
    const approvedCount = myProposals.filter((p) => p.status === "approved").length

    // Fetch files count
    React.useEffect(() => {
        fetch("/api/files")
            .then((r) => r.json())
            .then((files: unknown[]) => setFileCount(files.length))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    // Recent activity from proposals
    const recentActivity = React.useMemo(() => {
        return [...myProposals]
            .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
            .slice(0, 5)
    }, [myProposals])

    if (proposalsLoading || loading) {
        return <div className="flex items-center justify-center min-h-96"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* Welcome Banner */}
            <div className="bg-linear-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-emerald-200 text-sm font-medium mb-1">Welcome back, Guide</p>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{user?.name || "Teacher Dashboard"}</h1>
                    <p className="text-emerald-100/80 max-w-xl text-sm">Manage your students and provide guidance on their final year projects.</p>
                </div>
                <div className="absolute -right-10 -top-10 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute -right-5 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-xl" />
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Link href="/guide/assigned-students" className="block group">
                    <Card className="shadow-sm border-slate-100 hover:shadow-md hover:border-blue-200 transition-all h-full bg-white">
                        <CardContent className="p-4 md:p-5 flex items-center gap-3 md:gap-4">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0 group-hover:bg-blue-100 transition-colors"><Users className="w-5 h-5" /></div>
                            <div className="min-w-0"><p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Assigned</p><h3 className="font-bold text-2xl text-slate-900">{assignedCount}</h3></div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/guide/pending-requests" className="block group">
                    <Card className="shadow-sm border-slate-100 hover:shadow-md hover:border-amber-200 transition-all h-full bg-white">
                        <CardContent className="p-4 md:p-5 flex items-center gap-3 md:gap-4">
                            <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl shrink-0 group-hover:bg-amber-100 transition-colors"><Clock className="w-5 h-5" /></div>
                            <div className="min-w-0"><p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Pending</p><h3 className="font-bold text-2xl text-slate-900">{pendingCount}</h3></div>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-4 md:p-5 flex items-center gap-3 md:gap-4">
                        <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl shrink-0"><CheckCircle2 className="w-5 h-5" /></div>
                        <div className="min-w-0"><p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Approved</p><h3 className="font-bold text-2xl text-slate-900">{approvedCount}</h3></div>
                    </CardContent>
                </Card>

                <Link href="/guide/student-files" className="block group">
                    <Card className="shadow-sm border-slate-100 hover:shadow-md hover:border-violet-200 transition-all h-full bg-white">
                        <CardContent className="p-4 md:p-5 flex items-center gap-3 md:gap-4">
                            <div className="p-2.5 bg-violet-50 text-violet-500 rounded-xl shrink-0 group-hover:bg-violet-100 transition-colors"><FolderOpen className="w-5 h-5" /></div>
                            <div className="min-w-0"><p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Files</p><h3 className="font-bold text-2xl text-slate-900">{fileCount}</h3></div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link href="/guide/pending-requests" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-amber-200 hover:shadow-md transition-all group">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors shrink-0"><Clock className="w-5 h-5" /></div>
                    <div className="min-w-0"><p className="text-sm font-semibold text-slate-800">Pending Requests</p><p className="text-xs text-slate-500">Review new supervision requests</p></div>
                </Link>
                <Link href="/guide/assigned-students" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors shrink-0"><Users className="w-5 h-5" /></div>
                    <div className="min-w-0"><p className="text-sm font-semibold text-slate-800">Assigned Students</p><p className="text-xs text-slate-500">View your assigned students</p></div>
                </Link>
                <Link href="/guide/student-files" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-violet-200 hover:shadow-md transition-all group">
                    <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-100 transition-colors shrink-0"><FolderOpen className="w-5 h-5" /></div>
                    <div className="min-w-0"><p className="text-sm font-semibold text-slate-800">Student Files</p><p className="text-xs text-slate-500">Download submitted documents</p></div>
                </Link>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4 pt-2">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Latest project updates from your students</p>
                </div>

                <div className="space-y-3">
                    {recentActivity.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center text-slate-400">
                            <p className="text-sm">No recent activity yet.</p>
                        </div>
                    ) : (
                        recentActivity.map((p) => (
                            <Link key={p._id} href="/guide/assigned-students" className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-100 hover:shadow-md transition-all cursor-pointer group">
                                <div className="mt-0.5 w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:text-amber-600 group-hover:bg-amber-100 transition-colors shrink-0">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700">
                                        <span className="text-slate-900 font-semibold">{p.studentName}</span> submitted &quot;{p.title}&quot; — Status: <span className="font-semibold">{p.status}</span>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1.5">{p.submittedDate || new Date(p.createdAt || "").toLocaleDateString()}</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
