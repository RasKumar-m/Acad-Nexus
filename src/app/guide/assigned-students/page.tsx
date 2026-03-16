"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Users, CheckCircle2, Clock, Search, MessageSquare, FolderKanban, CalendarDays, AlertTriangle, Send, Loader2, Trophy, Sparkles, TrendingUp, TrendingDown } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useProposals, type Proposal } from "@/lib/proposal-context"
import FileCard from "@/components/FileCard"

const avatarColors = ["bg-blue-600", "bg-emerald-600", "bg-violet-600", "bg-rose-600", "bg-amber-600", "bg-teal-600"]

function statusConfig(status: string) {
    switch (status) {
        case "approved": return { label: "Approved", color: "border-emerald-300 bg-emerald-50 text-emerald-700" }
        case "pending": return { label: "Pending", color: "border-amber-300 bg-amber-50 text-amber-700" }
        case "rejected": return { label: "Rejected", color: "border-rose-300 bg-rose-50 text-rose-700" }
        case "completed": return { label: "Completed", color: "border-violet-300 bg-violet-50 text-violet-700" }
        default: return { label: status, color: "border-slate-300 bg-slate-50 text-slate-700" }
    }
}

export default function AssignedStudentsPage() {
    const { user } = useAuth()
    const { proposals, loading, addRemark, updateProposalStatus } = useProposals()
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterStatus, setFilterStatus] = React.useState("all")

    const [feedbackOpen, setFeedbackOpen] = React.useState(false)
    const [feedbackTarget, setFeedbackTarget] = React.useState<Proposal | null>(null)
    const [feedbackText, setFeedbackText] = React.useState("")
    const [sending, setSending] = React.useState(false)

    const [confirmCompleteOpen, setConfirmCompleteOpen] = React.useState(false)
    const [confirmCompleteTarget, setConfirmCompleteTarget] = React.useState<Proposal | null>(null)
    const [completing, setCompleting] = React.useState(false)
    const [completeChecked, setCompleteChecked] = React.useState(false)

    const [analyticsOpen, setAnalyticsOpen] = React.useState(false)
    const [analyticsTarget, setAnalyticsTarget] = React.useState<Proposal | null>(null)
    const [aiAnalyticsLoading, setAiAnalyticsLoading] = React.useState(false)
    const [aiAnalyticsData, setAiAnalyticsData] = React.useState<{ score: number; verdict: string; strengths: string[]; risks: string[] } | null>(null)

    // Filter proposals where this guide is assigned
    const myStudents = React.useMemo(
        () => proposals.filter((p) => p.supervisor === user?.name),
        [proposals, user?.name]
    )

    const total = myStudents.length
    const approvedCount = myStudents.filter((s) => s.status === "approved").length
    const pendingCount = myStudents.filter((s) => s.status === "pending").length
    const completedCount = myStudents.filter((s) => s.status === "completed").length

    const filtered = myStudents.filter((s) => {
        const q = searchQuery.toLowerCase()
        const matchSearch = s.studentName.toLowerCase().includes(q) || s.title.toLowerCase().includes(q) || s.studentEmail.toLowerCase().includes(q)
        if (!matchSearch) return false
        if (filterStatus === "all") return true
        return s.status === filterStatus
    })

    function openFeedback(proposal: Proposal) {
        setFeedbackTarget(proposal)
        setFeedbackText("")
        setFeedbackOpen(true)
    }

    async function handleSendFeedback() {
        if (!feedbackTarget || !feedbackText.trim()) return
        setSending(true)
        try {
            await addRemark(feedbackTarget._id, user?.name || "Guide", "Teacher", feedbackText.trim())
            setFeedbackOpen(false)
            setFeedbackTarget(null)
            setFeedbackText("")
        } catch (err) { console.error(err) }
        finally { setSending(false) }
    }

    async function handleConfirmComplete() {
        if (!confirmCompleteTarget) return
        setCompleting(true)
        try {
            await updateProposalStatus(confirmCompleteTarget._id, "completed", user?.name || "Guide", "Teacher", "Project marked as completed (final milestone).")
            setConfirmCompleteOpen(false)
            setConfirmCompleteTarget(null)
        } catch (err) { console.error(err) }
        finally { setCompleting(false) }
    }

    async function handleViewAnalytics(proposal: Proposal) {
        setAnalyticsTarget(proposal)
        setAnalyticsOpen(true)
        setAiAnalyticsLoading(true)
        setAiAnalyticsData(null)

        try {
            const res = await fetch("/api/ai/performance-analytics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    milestones: [], // Can be expanded later to include actual milestones
                    proposalId: proposal._id,
                    deadline: proposal.deadline || undefined,
                    status: proposal.status
                })
            })
            if (res.ok) {
                const data = await res.json()
                setAiAnalyticsData(data)
            }
        } catch (err) {
            console.error("Failed to fetch analytics:", err)
        } finally {
            setAiAnalyticsLoading(false)
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-96"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assigned Students</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your assigned students and their projects</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm border-slate-100 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-3 p-4">
                            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shrink-0"><Users className="w-5 h-5" /></div>
                            <div className="min-w-0"><p className="text-xs text-slate-500 font-medium">Total Students</p><h3 className="font-bold text-2xl text-slate-900">{total}</h3></div>
                        </div>
                        <div className="h-1 bg-blue-500" />
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-3 p-4">
                            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl shrink-0"><CheckCircle2 className="w-5 h-5" /></div>
                            <div className="min-w-0"><p className="text-xs text-slate-500 font-medium">Approved</p><h3 className="font-bold text-2xl text-slate-900">{approvedCount}</h3></div>
                        </div>
                        <div className="h-1 bg-emerald-500" />
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-3 p-4">
                            <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl shrink-0"><Clock className="w-5 h-5" /></div>
                            <div className="min-w-0"><p className="text-xs text-slate-500 font-medium">Pending</p><h3 className="font-bold text-2xl text-slate-900">{pendingCount}</h3></div>
                        </div>
                        <div className="h-1 bg-amber-500" />
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-3 p-4">
                            <div className="p-2.5 bg-violet-100 text-violet-600 rounded-xl shrink-0"><FolderKanban className="w-5 h-5" /></div>
                            <div className="min-w-0"><p className="text-xs text-slate-500 font-medium">Total Projects</p><h3 className="font-bold text-2xl text-slate-900">{total}</h3></div>
                        </div>
                        <div className="h-1 bg-violet-500" />
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-3 p-4">
                            <div className="p-2.5 bg-teal-100 text-teal-600 rounded-xl shrink-0"><Trophy className="w-5 h-5" /></div>
                            <div className="min-w-0"><p className="text-xs text-slate-500 font-medium">Completed</p><h3 className="font-bold text-2xl text-slate-900">{completedCount}</h3></div>
                        </div>
                        <div className="h-1 bg-teal-500" />
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="w-full sm:flex-1 space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Students</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search by name, email, or project..." className="pl-9 bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="w-full sm:w-48 space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Status</Label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="bg-white"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-16 flex flex-col items-center gap-3 text-slate-400">
                    <AlertTriangle className="w-10 h-10" />
                    <p className="font-semibold text-lg">No assigned students found</p>
                    <p className="text-sm">Try adjusting your search or filter criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
                    {filtered.map((proposal, idx) => {
                        const cfg = statusConfig(proposal.status)
                        const initials = proposal.studentName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
                        const color = avatarColors[idx % avatarColors.length]

                        return (
                            <Card key={proposal._id} className="shadow-sm border-slate-100 hover:shadow-md transition-shadow">
                                <CardContent className="p-5 flex flex-col gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`${color} w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>{initials}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-sm text-slate-900 truncate">{proposal.studentName}</h3>
                                                    <p className="text-xs text-slate-500 truncate">{proposal.studentEmail}</p>
                                                </div>
                                                <Badge variant="outline" className={`text-xs font-semibold shrink-0 ${cfg.color}`}>{cfg.label}</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <FolderKanban className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                            <p className="text-sm font-medium text-slate-800 line-clamp-1">{proposal.title}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                                            <p className="text-xs text-slate-500">Submitted: {proposal.submittedDate || new Date(proposal.createdAt || "").toLocaleDateString()}</p>
                                        </div>
                                        {proposal.remarks.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                                                <p className="text-xs text-slate-500">{proposal.remarks.length} remark{proposal.remarks.length !== 1 ? "s" : ""}</p>
                                            </div>
                                        )}
                                        {proposal.attachedFileUrl && proposal.attachedFileType && (
                                            <div className="mt-1">
                                                <FileCard fileUrl={proposal.attachedFileUrl} fileType={proposal.attachedFileType} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                                        <Button size="sm" variant="outline" className="flex-[1_0_auto] gap-1.5 border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800" onClick={() => openFeedback(proposal)}>
                                            <MessageSquare className="w-4 h-4" /> Feedback
                                        </Button>
                                        <Button size="sm" variant="outline" className="flex-[1_0_auto] gap-1.5 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800" onClick={() => handleViewAnalytics(proposal)}>
                                            <Sparkles className="w-4 h-4" /> Analytics
                                        </Button>
                                        {proposal.status === "approved" && (
                                            <Button size="sm" className="flex-[1_0_auto] gap-1.5 bg-violet-600 hover:bg-violet-700 text-white" onClick={() => { setConfirmCompleteTarget(proposal); setCompleteChecked(false); setConfirmCompleteOpen(true) }}>
                                                <Trophy className="w-4 h-4" /> Complete
                                            </Button>
                                        )}
                                        {proposal.status === "completed" && (
                                            <Badge variant="outline" className="flex-[1_0_auto] justify-center py-1.5 border-violet-300 bg-violet-50 text-violet-700 text-xs font-semibold">
                                                <Trophy className="w-3.5 h-3.5 mr-1" /> Completed
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Feedback Dialog */}
            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5 text-teal-600" /> Send Feedback</DialogTitle>
                    </DialogHeader>
                    {feedbackTarget && (
                        <div className="grid gap-4 py-2">
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                                <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {feedbackTarget.studentName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-slate-900">{feedbackTarget.studentName}</p>
                                    <p className="text-xs text-slate-500 truncate">{feedbackTarget.title}</p>
                                </div>
                            </div>

                            {feedbackTarget.remarks.length > 0 && (
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Previous Remarks</Label>
                                    {feedbackTarget.remarks.map((r) => (
                                        <div key={r._id || r.date} className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
                                            <span className="font-semibold text-slate-700">{r.from}</span>: {r.message}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="grid gap-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Feedback</Label>
                                <textarea rows={5} placeholder="Enter your feedback for the student..." className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none" value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white" disabled={!feedbackText.trim() || sending} onClick={handleSendFeedback}>
                            {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                            <Send className="w-4 h-4" /> Send Feedback
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Mark Complete Dialog */}
            <Dialog open={confirmCompleteOpen} onOpenChange={setConfirmCompleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-violet-600" /> Confirm Completion</DialogTitle>
                    </DialogHeader>
                    {confirmCompleteTarget && (
                        <div className="py-2 space-y-3">
                            <p className="text-sm text-slate-600">Are you sure you want to mark this project as <span className="font-semibold text-violet-700">completed</span>?</p>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                                <p className="font-semibold text-sm text-slate-900">{confirmCompleteTarget.studentName}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{confirmCompleteTarget.title}</p>
                            </div>
                            <p className="text-xs text-amber-600 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> This action cannot be undone.</p>
                            <label className="flex items-center gap-2 cursor-pointer select-none mt-1">
                                <input
                                    type="checkbox"
                                    checked={completeChecked}
                                    onChange={(e) => setCompleteChecked(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                />
                                <span className="text-xs font-medium text-slate-600">
                                    I confirm I want to mark this project as completed
                                </span>
                            </label>
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white" disabled={completing || !completeChecked} onClick={handleConfirmComplete}>
                            {completing && <Loader2 className="w-4 h-4 animate-spin" />}
                            <Trophy className="w-4 h-4" /> Yes, Mark Complete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Performance Analytics Dialog */}
            <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-600" /> AI Performance Analytics</DialogTitle>
                    </DialogHeader>
                    {analyticsTarget && (
                        <div className="py-2">
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
                                <div className="bg-indigo-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {analyticsTarget.studentName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-slate-900">{analyticsTarget.studentName}</p>
                                    <p className="text-xs text-slate-500 truncate">{analyticsTarget.title}</p>
                                </div>
                            </div>

                            {aiAnalyticsLoading ? (
                                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-6 flex flex-col items-center justify-center gap-3 text-indigo-600 h-48">
                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600 flex-shrink-0" />
                                    <p className="text-sm font-medium animate-pulse text-center">Analyzing project timeline and completion data...</p>
                                </div>
                            ) : aiAnalyticsData ? (
                                <div className="rounded-xl border border-indigo-200 bg-white overflow-hidden shadow-sm">
                                    <div className={`p-5 flex items-start gap-4 ${aiAnalyticsData.score >= 70 ? 'bg-emerald-50/50 border-b border-emerald-100' : aiAnalyticsData.score >= 40 ? 'bg-amber-50/50 border-b border-amber-100' : 'bg-rose-50/50 border-b border-rose-100'}`}>
                                        <div className={`p-3 rounded-full shrink-0 ${aiAnalyticsData.score >= 70 ? 'bg-emerald-100 text-emerald-700' : aiAnalyticsData.score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {aiAnalyticsData.score >= 70 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                                        </div>
                                        <div className="mt-0.5">
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">{aiAnalyticsData.verdict}</h3>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`text-xs font-semibold ${aiAnalyticsData.score >= 70 ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : aiAnalyticsData.score >= 40 ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-rose-200 text-rose-700 bg-rose-50'}`}>
                                                    Score: {aiAnalyticsData.score}/100
                                                </Badge>
                                                <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">Velocity Assessment</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Strengths & Progress
                                            </h4>
                                            <ul className="space-y-2.5">
                                                {aiAnalyticsData.strengths.map((s, i) => (
                                                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2 leading-snug">
                                                        <span className="text-emerald-500 mt-0.5 shrink-0">•</span> <span>{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider mb-3">
                                                <AlertTriangle className="w-4 h-4 text-rose-600" /> Risks & Bottlenecks
                                            </h4>
                                            <ul className="space-y-2.5">
                                                {aiAnalyticsData.risks.length > 0 ? (
                                                    aiAnalyticsData.risks.map((r, i) => (
                                                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2 leading-snug">
                                                            <span className="text-rose-500 mt-0.5 shrink-0">•</span> <span>{r}</span>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-sm text-slate-500 italic flex items-center gap-2 pl-2">
                                                        <CheckCircle2 className="w-4 h-4 text-slate-400" /> No major risks detected.
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500 text-sm">
                                    Analytics data is temporarily unavailable.
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Close Analysis</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
