"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import {
    Milestone,
    Plus,
    Loader2,
    Trash2,
    CheckCircle2,
    Clock,
    FileText,
    ExternalLink,
    Download,
    LayoutGrid,
    TableProperties,
    Link2,
    Sparkles,
    Wand2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useProposals } from "@/lib/proposal-context"
import { MilestoneKanban } from "@/components/milestone-kanban"

// ─── Types ──────────────────────────────────────────────────────────
interface MilestoneItem {
    _id: string
    title: string
    description: string
    dueDate: string
    status: "pending" | "submitted" | "reviewed"
    fileUrl: string | null
    fileName: string | null
    submissionLink: string | null
    linkType: string | null
    submittedAt: string | null
    createdAt: string
}

// ─── Helpers ────────────────────────────────────────────────────────
function statusBadge(status: string) {
    switch (status) {
        case "pending":
            return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
        case "submitted":
            return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><FileText className="w-3 h-3 mr-1" />Submitted</Badge>
        case "reviewed":
            return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" />Reviewed</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

// ─── Page ───────────────────────────────────────────────────────────
export default function GuideMilestonesPage() {
    const { user } = useAuth()
    const { proposals, loading: proposalsLoading } = useProposals()

    // Filter to only proposals supervised by this guide
    const myProposals = React.useMemo(
        () => proposals.filter((p) => p.supervisor === user?.name && (p.status === "approved" || p.status === "completed")),
        [proposals, user?.name]
    )

    // ── State ───────────────────────────────────────────────────────
    const [selectedProposalId, setSelectedProposalId] = React.useState("")
    const [milestones, setMilestones] = React.useState<Record<string, MilestoneItem[]>>({})
    const [loadingMilestones, setLoadingMilestones] = React.useState<Record<string, boolean>>({})

    // Form state
    const [formProposalId, setFormProposalId] = React.useState("")
    const [formTitle, setFormTitle] = React.useState("")
    const [formDesc, setFormDesc] = React.useState("")
    const [formDueDate, setFormDueDate] = React.useState("")
    const [creating, setCreating] = React.useState(false)
    const [formError, setFormError] = React.useState("")

    // AI Suggestions
    const [aiSuggesting, setAiSuggesting] = React.useState(false)
    const [aiSuggestionsOpen, setAiSuggestionsOpen] = React.useState(false)
    const [aiSuggestedMilestones, setAiSuggestedMilestones] = React.useState<{ title: string; description: string; recommendedDaysFromNow: number }[]>([])
    const [aiSelectedIndices, setAiSelectedIndices] = React.useState<Set<number>>(new Set())

    // Delete dialog
    const [deleteOpen, setDeleteOpen] = React.useState(false)
    const [deleteTarget, setDeleteTarget] = React.useState<{ proposalId: string; milestone: MilestoneItem } | null>(null)
    const [deleting, setDeleting] = React.useState(false)

    // View toggle: "table" | "kanban"
    const [view, setView] = React.useState<"table" | "kanban">("kanban")

    // ── Fetch milestones for a proposal ─────────────────────────────
    const fetchMilestones = React.useCallback(async (proposalId: string) => {
        setLoadingMilestones((prev) => ({ ...prev, [proposalId]: true }))
        try {
            const res = await fetch(`/api/proposals/${proposalId}/milestones`)
            if (!res.ok) return
            const data: MilestoneItem[] = await res.json()
            setMilestones((prev) => ({ ...prev, [proposalId]: data }))
        } finally {
            setLoadingMilestones((prev) => ({ ...prev, [proposalId]: false }))
        }
    }, [])

    // Auto-fetch milestones for all proposals
    React.useEffect(() => {
        if (!proposalsLoading) {
            myProposals.forEach((p) => {
                if (!milestones[p._id]) fetchMilestones(p._id)
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myProposals, proposalsLoading])

    // ── Create Milestone ────────────────────────────────────────────
    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        setFormError("")

        if (!formProposalId || !formTitle || !formDesc || !formDueDate) {
            setFormError("All fields are required.")
            return
        }

        setCreating(true)
        try {
            console.log("Creating milestone for proposal:", formProposalId)
            const res = await fetch(`/api/proposals/${formProposalId}/milestones`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    title: String(formTitle), 
                    description: String(formDesc), 
                    dueDate: String(formDueDate) 
                }),
            })
            
            console.log("Response status:", res.status)
            
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                console.error("API error:", err)
                setFormError(err.error || `Failed to create milestone (${res.status})`)
                return
            }
            
            const updatedMilestones: MilestoneItem[] = await res.json()
            setMilestones((prev) => ({ ...prev, [formProposalId]: updatedMilestones }))
            setFormTitle("")
            setFormDesc("")
            setFormDueDate("")
            setFormProposalId("")
        } catch (err) {
            console.error("Network error:", err)
            setFormError("Network error. Please try again.")
        } finally {
            setCreating(false)
        }
    }

    // ── Delete Milestone ────────────────────────────────────────────
    async function handleDelete() {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const res = await fetch(
                `/api/proposals/${deleteTarget.proposalId}/milestones/${deleteTarget.milestone._id}`,
                { method: "DELETE" }
            )
            if (res.ok) {
                const updated: MilestoneItem[] = await res.json()
                setMilestones((prev) => ({ ...prev, [deleteTarget.proposalId]: updated }))
            }
        } finally {
            setDeleting(false)
            setDeleteOpen(false)
            setDeleteTarget(null)
        }
    }

    // ── Mark as Reviewed ────────────────────────────────────────────
    async function handleMarkReviewed(proposalId: string, milestoneId: string) {
        // ...
        const res = await fetch(`/api/proposals/${proposalId}/milestones/${milestoneId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "reviewed" }),
        })
        if (res.ok) {
            const updated: MilestoneItem[] = await res.json()
            setMilestones((prev) => ({ ...prev, [proposalId]: updated }))
        }
    }

    // ── AI Milestone Recommender ────────────────────────────────────
    async function handleSuggestMilestones() {
        if (!formProposalId) {
            setFormError("Please select a student/project first to get suggestions.")
            return
        }
        setFormError("")
        setAiSuggesting(true)

        const selectedProposal = myProposals.find(p => p._id === formProposalId)
        if (!selectedProposal) {
            setAiSuggesting(false)
            return
        }

        try {
            const res = await fetch("/api/ai/suggest-milestones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: selectedProposal.title,
                    description: selectedProposal.description
                })
            })

            if (res.ok) {
                const data = await res.json()
                if (data.milestones && data.milestones.length > 0) {
                    setAiSuggestedMilestones(data.milestones)
                    setAiSelectedIndices(new Set(data.milestones.map((_: any, i: number) => i)))
                    setAiSuggestionsOpen(true)
                } else {
                    setFormError("AI couldn't generate milestones for this project.")
                }
            } else {
                setFormError("Failed to fetch AI suggestions.")
            }
        } catch (err) {
            console.error(err)
            setFormError("Network error while fetching suggestions.")
        } finally {
            setAiSuggesting(false)
        }
    }

    async function handleAddSuggestedMilestones() {
        if (!formProposalId || aiSelectedIndices.size === 0) return
        
        setCreating(true)
        setAiSuggestionsOpen(false)
        let lastUpdated: MilestoneItem[] = []

        try {
            // Add selected milestones sequentially
            for (const index of Array.from(aiSelectedIndices)) {
                const ms = aiSuggestedMilestones[index]
                
                // Calculate due date based on recommendedDaysFromNow
                const dueDateObj = new Date()
                dueDateObj.setDate(dueDateObj.getDate() + ms.recommendedDaysFromNow)
                const dueDateStr = dueDateObj.toISOString().split('T')[0]

                const res = await fetch(`/api/proposals/${formProposalId}/milestones`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: ms.title,
                        description: ms.description,
                        dueDate: dueDateStr
                    })
                })
                
                if (res.ok) {
                    lastUpdated = await res.json()
                }
            }
            
            if (lastUpdated.length > 0) {
                setMilestones((prev) => ({ ...prev, [formProposalId]: lastUpdated }))
            }
        } catch (err) {
            console.error(err)
        } finally {
            setCreating(false)
            setAiSelectedIndices(new Set())
        }
    }

    // ── All milestones across proposals (for the overview table) ────
    const allMilestones = React.useMemo(() => {
        const result: { proposal: typeof myProposals[0]; milestone: MilestoneItem }[] = []
        for (const p of myProposals) {
            const ms = milestones[p._id] ?? []
            for (const m of ms) {
                result.push({ proposal: p, milestone: m })
            }
        }
        // Sort by due date
        result.sort((a, b) => new Date(a.milestone.dueDate).getTime() - new Date(b.milestone.dueDate).getTime())
        return result
    }, [myProposals, milestones])

    // Filtered by selected student
    const filteredMilestones = selectedProposalId && selectedProposalId !== "all"
        ? allMilestones.filter((item) => item.proposal._id === selectedProposalId)
        : allMilestones

    // ── Kanban data (flat list with proposalId + studentName attached) ──
    const kanbanMilestones = React.useMemo(() => {
        const filtered = selectedProposalId && selectedProposalId !== "all"
            ? allMilestones.filter((item) => item.proposal._id === selectedProposalId)
            : allMilestones
        return filtered.map(({ proposal, milestone }) => ({
            ...milestone,
            proposalId: proposal._id,
            studentName: proposal.studentName,
        }))
    }, [allMilestones, selectedProposalId])

    // ── Kanban status change (optimistic update + PATCH) ────────────
    async function handleKanbanStatusChange(
        proposalId: string,
        milestoneId: string,
        newStatus: "pending" | "submitted" | "reviewed"
    ) {
        // Optimistic: update local state immediately
        setMilestones((prev) => {
            const list = prev[proposalId]
            if (!list) return prev
            return {
                ...prev,
                [proposalId]: list.map((m) =>
                    m._id === milestoneId ? { ...m, status: newStatus } : m
                ),
            }
        })

        // Persist to DB
        try {
            const res = await fetch(
                `/api/proposals/${proposalId}/milestones/${milestoneId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus }),
                }
            )
            if (res.ok) {
                const updated: MilestoneItem[] = await res.json()
                setMilestones((prev) => ({ ...prev, [proposalId]: updated }))
            } else {
                // Revert on failure
                fetchMilestones(proposalId)
            }
        } catch {
            fetchMilestones(proposalId)
        }
    }

    if (proposalsLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 sm:gap-6 w-full px-4 sm:px-0 max-w-6xl mx-auto">
            {/* ─── Header ──────────────────────────────────────────── */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 flex-wrap">
                            <Milestone className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-600 flex-shrink-0" />
                            <span>Milestone Dashboard</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-2">
                            Create milestones for your assigned students and track their progress.
                        </p>
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView("kanban")}
                            className={`h-8 px-3 text-xs gap-1.5 rounded-md ${
                                view === "kanban"
                                    ? "bg-white text-slate-900 shadow-sm hover:bg-white"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-transparent"
                            }`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            Board
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView("table")}
                            className={`h-8 px-3 text-xs gap-1.5 rounded-md ${
                                view === "table"
                                    ? "bg-white text-slate-900 shadow-sm hover:bg-white"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-transparent"
                            }`}
                        >
                            <TableProperties className="w-3.5 h-3.5" />
                            Table
                        </Button>
                    </div>
                </div>
            </div>

            {/* ─── Student filter (shared between views) ─────────── */}
            <div className="flex items-center gap-3">
                <Select value={selectedProposalId} onValueChange={setSelectedProposalId}>
                    <SelectTrigger className="w-full sm:w-64 text-xs sm:text-sm">
                        <SelectValue placeholder="All Students" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        {myProposals.map((p) => (
                            <SelectItem key={p._id} value={p._id}>
                                {p.studentName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* ─── Kanban View ─────────────────────────────────────── */}
            {view === "kanban" && (
                <div className="flex flex-col gap-4 sm:gap-6">
                    <MilestoneKanban
                        milestones={kanbanMilestones}
                        onStatusChange={handleKanbanStatusChange}
                    />

                    {/* Create form below the board */}
                    <Card className="shadow-sm border-slate-100 bg-white max-w-lg">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 text-slate-800">
                                <Plus className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                <span>New Milestone</span>
                            </CardTitle>
                            
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleSuggestMilestones}
                                disabled={aiSuggesting || !formProposalId}
                                className="h-8 gap-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 text-xs px-2.5"
                            >
                                {aiSuggesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                Auto-Suggest
                            </Button>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6 pb-6">
                            {myProposals.length === 0 && (
                                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs sm:text-sm text-amber-800">
                                    No approved or completed assigned projects found. Approve a student project first.
                                </div>
                            )}
                            <form onSubmit={handleCreate} className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="ms-student-k" className="text-xs sm:text-sm">Student / Project</Label>
                                        <Select value={formProposalId} onValueChange={setFormProposalId}>
                                            <SelectTrigger id="ms-student-k" disabled={myProposals.length === 0} className="text-xs sm:text-sm">
                                                <SelectValue placeholder="Select a student" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {myProposals.map((p) => (
                                                    <SelectItem key={p._id} value={p._id} className="text-xs sm:text-sm">
                                                        {p.studentName} — {p.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ms-title-k" className="text-xs sm:text-sm">Milestone Title</Label>
                                        <Input id="ms-title-k" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Literature Review" className="text-xs sm:text-sm" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="ms-desc-k" className="text-xs sm:text-sm">Description</Label>
                                        <textarea id="ms-desc-k" value={formDesc} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormDesc(e.target.value)} placeholder="What the student needs to deliver" rows={2} className="flex min-h-16 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ms-due-k" className="text-xs sm:text-sm">Due Date</Label>
                                        <Input id="ms-due-k" type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} className="text-xs sm:text-sm" />
                                    </div>
                                </div>
                                {formError && (
                                    <p className="text-xs sm:text-sm text-red-600 bg-red-50 px-2 sm:px-3 py-2 rounded-lg">{formError}</p>
                                )}
                                <Button type="submit" disabled={creating || myProposals.length === 0} className="text-xs sm:text-sm py-2">
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                    Create Milestone
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ─── Table View (original layout) ───────────────────── */}
            {view === "table" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* ─── Create Milestone Form ───────────────────────── */}
                <Card className="shadow-sm border-slate-100 bg-white lg:col-span-1">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 text-slate-800">
                            <Plus className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>New Milestone</span>
                        </CardTitle>
                        
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleSuggestMilestones}
                            disabled={aiSuggesting || !formProposalId}
                            className="h-8 gap-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 text-xs px-2.5"
                        >
                            {aiSuggesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            Auto-Suggest
                        </Button>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-6">
                        {myProposals.length === 0 && (
                            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs sm:text-sm text-amber-800">
                                No approved or completed assigned projects found. Approve a student project first.
                            </div>
                        )}
                        <form onSubmit={handleCreate} className="space-y-3 sm:space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ms-student" className="text-xs sm:text-sm">Student / Project</Label>
                                <Select value={formProposalId} onValueChange={setFormProposalId}>
                                    <SelectTrigger id="ms-student" disabled={myProposals.length === 0} className="text-xs sm:text-sm">
                                        <SelectValue placeholder="Select a student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {myProposals.map((p) => (
                                            <SelectItem key={p._id} value={p._id} className="text-xs sm:text-sm">
                                                {p.studentName} — {p.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ms-title" className="text-xs sm:text-sm">Milestone Title</Label>
                                <Input
                                    id="ms-title"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="e.g. Literature Review"
                                    className="text-xs sm:text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ms-desc" className="text-xs sm:text-sm">Description</Label>
                                <textarea
                                    id="ms-desc"
                                    value={formDesc}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormDesc(e.target.value)}
                                    placeholder="What the student needs to deliver"
                                    rows={3}
                                    className="flex min-h-20 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ms-due" className="text-xs sm:text-sm">Due Date</Label>
                                <Input
                                    id="ms-due"
                                    type="date"
                                    value={formDueDate}
                                    onChange={(e) => setFormDueDate(e.target.value)}
                                    className="text-xs sm:text-sm"
                                />
                            </div>

                            {formError && (
                                <p className="text-xs sm:text-sm text-red-600 bg-red-50 px-2 sm:px-3 py-2 rounded-lg">{formError}</p>
                            )}

                            <Button type="submit" disabled={creating || myProposals.length === 0} className="w-full text-xs sm:text-sm py-2">
                                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                Create Milestone
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* ─── Milestones Table ────────────────────────────── */}
                <Card className="shadow-sm border-slate-100 bg-white lg:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm sm:text-base font-semibold text-slate-800">
                            Active Milestones
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredMilestones.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <Milestone className="w-5 sm:w-6 h-5 sm:h-6 text-slate-300" />
                                </div>
                                <h4 className="font-medium text-sm sm:text-base text-slate-700 mb-1">No milestones yet</h4>
                                <p className="text-xs sm:text-sm text-slate-500 px-2">Create a milestone using the form on the left.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                                <Table className="w-full text-xs sm:text-sm">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs">Student</TableHead>
                                            <TableHead className="text-xs">Milestone</TableHead>
                                            <TableHead className="text-xs whitespace-nowrap">Due Date</TableHead>
                                            <TableHead className="text-xs">Status</TableHead>
                                            <TableHead className="text-xs">File</TableHead>
                                            <TableHead className="text-right text-xs">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredMilestones.map(({ proposal, milestone }) => (
                                            <TableRow key={milestone._id}>
                                                <TableCell className="font-medium text-xs sm:text-sm">
                                                    <span className="line-clamp-1">{proposal.studentName}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-xs sm:text-sm text-slate-800 line-clamp-1">{milestone.title}</p>
                                                        <p className="text-xs text-slate-500 max-w-24 sm:max-w-48 line-clamp-1">{milestone.description}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                                                    {new Date(milestone.dueDate).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </TableCell>
                                                <TableCell>{statusBadge(milestone.status)}</TableCell>
                                                <TableCell>
                                                    {milestone.fileUrl ? (
                                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                                            <a
                                                                href={milestone.fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1"
                                                                title="View file"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                            <a
                                                                href={milestone.fileUrl}
                                                                download={milestone.fileName ?? "file"}
                                                                className="text-emerald-600 hover:text-emerald-700 text-xs flex items-center gap-1"
                                                                title="Download file"
                                                            >
                                                                <Download className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    ) : milestone.submissionLink ? (
                                                        <a
                                                            href={milestone.submissionLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200"
                                                            title={milestone.submissionLink}
                                                        >
                                                            <Link2 className="w-3 h-3" />
                                                            {milestone.linkType === "github" ? "GitHub" : milestone.linkType === "drive" ? "Drive" : milestone.linkType === "figma" ? "Figma" : "Link"}
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                                                        {milestone.status === "submitted" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-7 px-1.5 sm:px-2 text-xs"
                                                                onClick={() => handleMarkReviewed(proposal._id, milestone._id)}
                                                                title="Mark as reviewed"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                <span className="hidden sm:inline">Review</span>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-1.5"
                                                            onClick={() => {
                                                                setDeleteTarget({ proposalId: proposal._id, milestone })
                                                                setDeleteOpen(true)
                                                            }}
                                                            title="Delete milestone"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            )}

            {/* ─── Delete Confirmation ─────────────────────────────── */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="mx-4 max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">Delete Milestone</DialogTitle>
                    </DialogHeader>
                    <p className="text-xs sm:text-sm text-slate-600">
                        Are you sure you want to delete &ldquo;<span className="font-semibold">{deleteTarget?.milestone.title}</span>&rdquo;? This action cannot be undone.
                    </p>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" className="text-xs sm:text-sm">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="text-xs sm:text-sm">
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── AI Suggestions Dialog ─────────────────────────────── */}
            <Dialog open={aiSuggestionsOpen} onOpenChange={setAiSuggestionsOpen}>
                <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-900 border-b border-indigo-100 pb-3">
                            <Wand2 className="w-5 h-5 text-indigo-500" />
                            AI Suggested Milestones
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-sm text-slate-600 mb-4 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                            Based on the project description, Gemini has generated the following recommended delivery plan. Select the milestones you want to assign to the student.
                        </p>
                        
                        <div className="space-y-3">
                            {aiSuggestedMilestones.map((ms, index) => (
                                <div 
                                    key={index}
                                    className={`p-3 rounded-lg border transition-colors cursor-pointer flex gap-3 ${
                                        aiSelectedIndices.has(index) 
                                            ? "border-indigo-500 bg-indigo-50" 
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                    onClick={() => {
                                        setAiSelectedIndices(prev => {
                                            const next = new Set(prev)
                                            if (next.has(index)) next.delete(index)
                                            else next.add(index)
                                            return next
                                        })
                                    }}
                                >
                                    <div className="pt-0.5">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 pointer-events-none"
                                            checked={aiSelectedIndices.has(index)}
                                            readOnly
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <h4 className="font-semibold text-sm text-slate-900">{ms.title}</h4>
                                            <Badge variant="outline" className="text-[10px] whitespace-nowrap bg-white">
                                                +{ms.recommendedDaysFromNow} Days
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">{ms.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <DialogClose asChild>
                            <Button variant="outline" className="text-xs sm:text-sm">Cancel</Button>
                        </DialogClose>
                        <Button 
                            className="text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                            onClick={handleAddSuggestedMilestones}
                            disabled={aiSelectedIndices.size === 0 || creating}
                        >
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Add ({aiSelectedIndices.size}) Milestones
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
