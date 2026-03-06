"use client"

import * as React from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import {
    BookX,
    CheckCircle2,
    Clock,
    FileText,
    MessageSquare,
    User,
    Zap,
    CalendarDays,
    Upload,
    CalendarPlus,
    ArrowRight,
    Milestone,
    Loader2,
    CloudUpload,
    X,
} from "lucide-react"
import Link from "next/link"
import { useProposals } from "@/lib/proposal-context"
import { useAuth } from "@/lib/auth-context"
import { useUploadThing } from "@/lib/uploadthing"
import { ActivityHeatmap } from "@/components/activity-heatmap"

// ─── Milestone type ─────────────────────────────────────────────────
interface MilestoneItem {
    _id: string
    title: string
    description: string
    dueDate: string
    status: "pending" | "submitted" | "reviewed"
    fileUrl: string | null
    fileName: string | null
    submittedAt: string | null
}

export default function StudentDashboard() {
    const { user } = useAuth()
    const { getProposalsByStudent } = useProposals()

    const studentEmail = user?.email ?? ""
    const myProposals = getProposalsByStudent(studentEmail)
    const latestProposal = myProposals.length > 0 ? myProposals[0] : null

    // Collect all remarks across all proposals (most recent first)
    const allRemarks = myProposals.flatMap((p) =>
        p.remarks.map((r) => ({ ...r, proposalTitle: p.title }))
    ).sort((a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime())

    const projectTitle = latestProposal?.title ?? "N/A"
    const projectDesc = latestProposal?.description ?? "No description provided yet. Please submit a project proposal to get started."
    const guideName = latestProposal?.supervisor ?? "Not Assigned"
    const deadlineStr = latestProposal?.deadline ?? "None"
    const statusLabel = latestProposal
        ? latestProposal.status === "approved" ? "Approved" : latestProposal.status === "rejected" ? "Rejected" : "Pending Review"
        : "Pending Proposal"
    const statusClass = latestProposal
        ? latestProposal.status === "approved" ? "bg-emerald-50 text-emerald-700" : latestProposal.status === "rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
        : "bg-slate-50 text-slate-500"
    const progress = latestProposal
        ? latestProposal.status === "approved" ? 25 : latestProposal.status === "rejected" ? 0 : 10
        : 0

    // ── Milestones state ────────────────────────────────────────────
    const [milestones, setMilestones] = React.useState<MilestoneItem[]>([])
    const [milestonesLoading, setMilestonesLoading] = React.useState(false)

    // Upload dialog state
    const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)
    const [activeMilestone, setActiveMilestone] = React.useState<MilestoneItem | null>(null)
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = React.useState(0)
    const [uploadError, setUploadError] = React.useState("")
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const { startUpload, isUploading } = useUploadThing("projectFile", {
        onUploadProgress: (p) => setUploadProgress(p),
        onUploadError: (err) => {
            setUploadError(err.message)
            setSelectedFile(null)
            setUploadProgress(0)
        },
    })

    // Fetch milestones for approved/completed proposal
    React.useEffect(() => {
        if (!latestProposal || (latestProposal.status !== "approved" && latestProposal.status !== "completed")) return
        setMilestonesLoading(true)
        fetch(`/api/proposals/${latestProposal._id}/milestones`)
            .then((r) => r.ok ? r.json() : [])
            .then((data: MilestoneItem[]) => setMilestones(data))
            .catch(() => {})
            .finally(() => setMilestonesLoading(false))
    }, [latestProposal])

    function openUploadDialog(m: MilestoneItem) {
        setActiveMilestone(m)
        setSelectedFile(null)
        setUploadProgress(0)
        setUploadError("")
        setUploadDialogOpen(true)
    }

    async function handleMilestoneUpload() {
        if (!selectedFile || !activeMilestone || !latestProposal) return
        setUploadError("")
        setUploadProgress(0)

        try {
            const res = await startUpload([selectedFile])
            if (!res?.[0]) {
                setUploadError("Upload failed. Please try again.")
                return
            }
            const uploaded = res[0]

            // Update milestone in DB
            const patchRes = await fetch(
                `/api/proposals/${latestProposal._id}/milestones/${activeMilestone._id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fileUrl: uploaded.ufsUrl ?? uploaded.url, fileName: uploaded.name }),
                }
            )

            if (patchRes.ok) {
                const updatedMilestones: MilestoneItem[] = await patchRes.json()
                setMilestones(updatedMilestones)
            }

            setUploadDialogOpen(false)
            setSelectedFile(null)
            setUploadProgress(0)
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.")
        }
    }

    const pendingMilestones = milestones.filter((m) => m.status === "pending")
    const completedMilestones = milestones.filter((m) => m.status !== "pending")

    const [activityMap, setActivityMap] = React.useState<Record<string, number>>({})
    const [streak, setStreak] = React.useState({ current: 0, longest: 0, totalActiveDays: 0 })

    React.useEffect(() => {
        if (!studentEmail) return

        fetch(`/api/activity?studentEmail=${encodeURIComponent(studentEmail)}&days=120`)
            .then((r) => (r.ok ? r.json() : null))
            .then((data: { activity?: Record<string, number>; currentStreak?: number; longestStreak?: number; totalActiveDays?: number } | null) => {
                if (!data) return
                setActivityMap(data.activity ?? {})
                setStreak({
                    current: data.currentStreak ?? 0,
                    longest: data.longestStreak ?? 0,
                    totalActiveDays: data.totalActiveDays ?? 0,
                })
            })
            .catch(() => {})
    }, [studentEmail])

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">

            {/* Welcome Banner */}
            <div className="bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-blue-200 text-sm font-medium mb-1">Welcome back</p>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{user?.name ?? "Student"}</h1>
                    <p className="text-blue-100/80 max-w-xl text-sm">Here&apos;s your project overview, recent updates, and tasks. Let&apos;s make progress on your Final Year Project.</p>
                </div>
                <div className="absolute -right-10 -top-10 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute -right-5 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-xl" />
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow bg-white border-slate-100">
                    <CardContent className="p-4 md:p-5 flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                            {latestProposal ? <FileText className="w-5 h-5" /> : <BookX className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Project</p>
                            <h3 className="font-semibold text-base line-clamp-1 text-slate-800">{latestProposal ? projectTitle : "No Project"}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow bg-white border-slate-100">
                    <CardContent className="p-4 md:p-5 flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Guide</p>
                            <h3 className="font-semibold text-base text-slate-800">{guideName}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow bg-white border-slate-100">
                    <CardContent className="p-4 md:p-5 flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Deadline</p>
                            <h3 className="font-semibold text-base text-slate-800">{deadlineStr}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow bg-white border-slate-100">
                    <CardContent className="p-4 md:p-5 flex items-center gap-3">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Feedback</p>
                            <h3 className="font-semibold text-base text-slate-800">
                                {allRemarks.length > 0 ? `${allRemarks.length} remark${allRemarks.length !== 1 ? "s" : ""}` : <span className="text-slate-500 italic">No feedback</span>}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Larger) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Project Overview */}
                    <Card className="shadow-sm border-slate-100 bg-white">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                                <FileText className="w-4.5 h-4.5 text-blue-600" />
                                Project Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 relative">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <p className="text-sm font-medium text-muted-foreground">Title</p>
                                    <p className="text-slate-800 font-medium">{projectTitle}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge variant="outline" className={`${statusClass} font-normal`}>
                                        {statusLabel}
                                    </Badge>
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                                    <p className="text-slate-600 text-sm line-clamp-3">{projectDesc}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
                                    <p className="text-slate-800 font-medium">{guideName}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-sm font-medium text-muted-foreground">Submission Deadline</p>
                                    <p className="text-slate-800 font-medium">{deadlineStr}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t space-y-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-700">Overall Progress</span>
                                    <span className="text-blue-600 font-semibold">{progress}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="shadow-sm border-slate-100 bg-white">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                                <Zap className="w-4.5 h-4.5 text-amber-500" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Link href="/student/submit-proposal">
                                    <Button variant="outline" className="h-auto py-3 justify-start gap-3 bg-white hover:bg-slate-50 hover:text-blue-600 transition-colors w-full">
                                        <Upload className="w-4 h-4 text-blue-500" />
                                        <div className="text-left">
                                            <p className="font-semibold text-sm">Submit Proposal</p>
                                            <p className="text-xs text-muted-foreground font-normal">Upload your initial idea</p>
                                        </div>
                                    </Button>
                                </Link>
                                <Link href="/student/upload-files">
                                    <Button variant="outline" className="h-auto py-3 justify-start gap-3 bg-white hover:bg-slate-50 hover:text-emerald-600 transition-colors w-full">
                                        <CalendarPlus className="w-4 h-4 text-emerald-500" />
                                        <div className="text-left">
                                            <p className="font-semibold text-sm">Upload Files</p>
                                            <p className="text-xs text-muted-foreground font-normal">Submit project documents</p>
                                        </div>
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Deadlines */}
                    <Card className="shadow-sm border-slate-100 bg-white">
                        <CardHeader className="pb-0 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                                <CalendarDays className="w-4.5 h-4.5 text-rose-500" />
                                Upcoming Deadlines
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="hidden sm:flex text-blue-600 hover:text-blue-700 h-8">
                                View Calendar
                                <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {pendingMilestones.length > 0 ? (
                                <div className="space-y-3">
                                    {pendingMilestones.map((m) => (
                                        <div
                                            key={m._id}
                                            className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100 rounded-lg"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm text-slate-800 truncate">{m.title}</p>
                                                <p className="text-xs text-slate-500">
                                                    Due {new Date(m.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] shrink-0 ml-2">
                                                <Clock className="w-3 h-3 mr-1" /> Pending
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                        <CheckCircle2 className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <h4 className="font-medium text-slate-700 mb-1">You&apos;re all caught up!</h4>
                                    <p className="text-sm text-slate-500 max-w-62.5">There are no upcoming deadlines at the moment.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ─── My Milestones ─────────────────────────────── */}
                    <Card className="shadow-sm border-slate-100 bg-white">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                                <Milestone className="w-4.5 h-4.5 text-indigo-600" />
                                My Milestones
                            </CardTitle>
                            <CardDescription>Click a pending milestone to upload your deliverable</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {milestonesLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                                </div>
                            ) : milestones.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                        <Milestone className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-sm text-slate-500">No milestones assigned yet.</p>
                                    <p className="text-xs text-slate-400 mt-1">Your guide will create milestones for you.</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {milestones.map((m) => {
                                        const isPending = m.status === "pending"
                                        const isSubmitted = m.status === "submitted"
                                        const isReviewed = m.status === "reviewed"
                                        const isOverdue = isPending && new Date(m.dueDate) < new Date()

                                        return (
                                            <button
                                                key={m._id}
                                                type="button"
                                                disabled={!isPending}
                                                onClick={() => isPending && openUploadDialog(m)}
                                                className={`w-full text-left p-3 rounded-lg border transition-all ${
                                                    isPending
                                                        ? "border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:shadow-sm cursor-pointer"
                                                        : isSubmitted
                                                        ? "border-blue-200 bg-blue-50/50 cursor-default"
                                                        : "border-emerald-200 bg-emerald-50/50 cursor-default"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm text-slate-800 truncate">{m.title}</p>
                                                        <p className="text-xs text-slate-500 truncate mt-0.5">{m.description}</p>
                                                        <p className="text-[11px] text-slate-400 mt-1">
                                                            Due {new Date(m.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                            {isOverdue && <span className="text-red-500 ml-1 font-semibold">• Overdue</span>}
                                                        </p>
                                                    </div>
                                                    <div className="shrink-0">
                                                        {isPending && (
                                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                                                                <Upload className="w-3 h-3 mr-1" />Pending
                                                            </Badge>
                                                        )}
                                                        {isSubmitted && (
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                                                                <FileText className="w-3 h-3 mr-1" />Submitted
                                                            </Badge>
                                                        )}
                                                        {isReviewed && (
                                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                                                <CheckCircle2 className="w-3 h-3 mr-1" />Reviewed
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column (Smaller) */}
                <div className="space-y-6">

                    <Card className="shadow-sm border-slate-100 bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold text-slate-800">Consistency Heatmap</CardTitle>
                            <CardDescription>Your daily submission activity — like GitHub&apos;s contribution graph.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <ActivityHeatmap activity={activityMap} days={120} title="Submission Activity" />
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                                    <p className="text-slate-500">Current Streak</p>
                                    <p className="font-semibold text-slate-800">{streak.current} day{streak.current === 1 ? "" : "s"}</p>
                                </div>
                                <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                                    <p className="text-slate-500">Longest Streak</p>
                                    <p className="font-semibold text-slate-800">{streak.longest} day{streak.longest === 1 ? "" : "s"}</p>
                                </div>
                                <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                                    <p className="text-slate-500">Active Days</p>
                                    <p className="font-semibold text-slate-800">{streak.totalActiveDays} day{streak.totalActiveDays === 1 ? "" : "s"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Latest Feedback from Proposals */}
                    <Card className="shadow-sm border-slate-100 flex flex-col bg-white">
                        <CardHeader className="pb-0 shrink-0">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                                    <MessageSquare className="w-4.5 h-4.5 text-purple-600" />
                                    Latest Feedback
                                </CardTitle>
                                <Link href="/student/feedback" className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors">
                                    View All
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-4">
                            {allRemarks.length > 0 ? (
                                <ScrollArea className="h-56">
                                    <div className="space-y-3 pr-2">
                                        {allRemarks.slice(0, 5).map((r) => (
                                            <div key={r._id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-semibold text-slate-700">{r.from}</span>
                                                        <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-500">{r.fromRole}</Badge>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400">{r.date}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium">Re: {r.proposalTitle}</p>
                                                <p className="text-sm text-slate-700 line-clamp-2">{r.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                        <MessageSquare className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-sm text-slate-500">No feedback available yet.</p>
                                    <p className="text-xs text-slate-400 mt-1">Submit your proposal to receive feedback.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Activity Timeline */}
                    <Card className="shadow-sm border-slate-100 bg-white">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base font-semibold text-slate-800">Recent Activity</CardTitle>
                            <CardDescription>Your latest actions in the system</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 p-0">
                            <ScrollArea className="h-62.5 px-6">
                                <div className="space-y-6 py-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                    {/* Timeline Item */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-blue-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow sm:absolute sm:left-1/2 sm:-ml-2.5"></div>
                                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-3 sm:ml-0 md:group-even:text-right">
                                            <div className="flex flex-col sm:flex-row items-start md:group-even:items-end justify-between sm:items-center space-y-1 sm:space-y-0 mb-1">
                                                <div className="font-semibold text-slate-800 text-sm">Account Created</div>
                                                <time className="font-medium text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Just now</time>
                                            </div>
                                            <div className="text-xs text-slate-600">You successfully joined the system and configured your profile.</div>
                                        </div>
                                    </div>

                                    {latestProposal ? (
                                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-emerald-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow sm:absolute sm:left-1/2 sm:-ml-2.5"></div>
                                            <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-3 sm:ml-0 md:group-even:text-right">
                                                <div className="flex flex-col sm:flex-row items-start md:group-even:items-end justify-between sm:items-center space-y-1 sm:space-y-0 mb-1">
                                                    <div className="font-semibold text-slate-800 text-sm">Proposal Submitted</div>
                                                    <time className="font-medium text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{latestProposal.submittedDate}</time>
                                                </div>
                                                <div className="text-xs text-slate-600">You submitted &ldquo;{latestProposal.title}&rdquo; for review.</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-slate-200 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow sm:absolute sm:left-1/2 sm:-ml-2.5"></div>
                                            <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-3 sm:ml-0 md:group-even:text-right">
                                                <div className="flex flex-col sm:flex-row items-start md:group-even:items-end justify-between sm:items-center space-y-1 sm:space-y-0 mb-1">
                                                    <div className="font-semibold text-slate-400 text-sm">Waiting for Project Proposal</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                </div>
            </div>

            {/* ─── Milestone Upload Dialog ────────────────────────── */}
            <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
                if (!isUploading) {
                    setUploadDialogOpen(open)
                    if (!open) { setSelectedFile(null); setUploadProgress(0); setUploadError("") }
                }
            }}>
                <DialogContent className="sm:max-w-md mx-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Milestone className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
                            <span className="truncate">Submit: {activeMilestone?.title}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="bg-slate-50 p-3 rounded-lg border text-sm text-slate-600">
                            <p>{activeMilestone?.description}</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Due {activeMilestone?.dueDate && new Date(activeMilestone.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </p>
                        </div>

                        {/* File selection area */}
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-300 transition-colors">
                            {selectedFile ? (
                                <div className="space-y-2">
                                    <FileText className="w-8 h-8 text-indigo-500 mx-auto" />
                                    <p className="text-sm font-medium text-slate-800 truncate">{selectedFile.name}</p>
                                    <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                                        disabled={isUploading}
                                        className="text-red-500 hover:text-red-600 h-8"
                                    >
                                        <X className="w-3.5 h-3.5 mr-1" /> Remove
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <CloudUpload className="w-8 h-8 text-slate-400 mx-auto" />
                                    <p className="text-sm text-slate-500">Select a file to submit</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Browse Files
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.gz"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) { setSelectedFile(file); setUploadError("") }
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Progress bar */}
                        {isUploading && (
                            <div className="space-y-1.5">
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 text-center">Uploading… {uploadProgress}%</p>
                            </div>
                        )}

                        {/* Error */}
                        {uploadError && (
                            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{uploadError}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isUploading}>Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleMilestoneUpload}
                            disabled={!selectedFile || isUploading}
                        >
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                            Submit Milestone
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
