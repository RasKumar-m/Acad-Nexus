"use client"

import * as React from "react"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    FolderKanban,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Search,
    Eye,
    ThumbsUp,
    ThumbsDown,
    FileText,
    Download,
    ExternalLink,
    MessageSquare,
    Send,
    User,
} from "lucide-react"
import { useProposals, type ProposalStatus, type Proposal } from "@/lib/proposal-context"
import FileCard from "@/components/FileCard"
import { useSearchParams } from "next/navigation"

// ─── Helpers ────────────────────────────────────────────────────────
function statusBadge(status: ProposalStatus) {
    switch (status) {
        case "pending":
            return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold">Pending</Badge>
        case "approved":
            return <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold">Approved</Badge>
        case "rejected":
            return <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold">Rejected</Badge>
        case "completed":
            return <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 text-xs font-semibold">Completed</Badge>
    }
}

function formatDeadline(d: string | null) {
    if (!d) return "N/A"
    const date = new Date(d)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

function truncateText(text: string, max: number) {
    if (text.length <= max) return text
    return text.slice(0, max) + "..."
}

// ─── Page Component ─────────────────────────────────────────────────
export default function AdminProjectsPage() {
    const { proposals, updateProposalStatus, addRemark } = useProposals()
    const searchParams = useSearchParams()

    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterStatus, setFilterStatus] = React.useState(searchParams.get("status") ?? "all")
    const [filterSupervisor, setFilterSupervisor] = React.useState("all")
    const [supervisorNames, setSupervisorNames] = React.useState<string[]>([])

    React.useEffect(() => {
        fetch("/api/users?role=guide")
            .then((r) => r.json())
            .then((guides: { name: string }[]) => setSupervisorNames(guides.map((g) => g.name)))
            .catch(console.error)
    }, [])

    // View dialog
    const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
    const [selectedProject, setSelectedProject] = React.useState<Proposal | null>(null)
    const [remarkText, setRemarkText] = React.useState("")

    // Action dialog (approve / reject)
    const [actionDialogOpen, setActionDialogOpen] = React.useState(false)
    const [actionType, setActionType] = React.useState<"approved" | "rejected">("approved")
    const [actionTarget, setActionTarget] = React.useState<Proposal | null>(null)
    const [actionRemark, setActionRemark] = React.useState("")
    const [actionChecked, setActionChecked] = React.useState(false)

    // Computed metrics
    const totalProjects = proposals.length
    const approvedCount = proposals.filter((p) => p.status === "approved").length
    const pendingCount = proposals.filter((p) => p.status === "pending").length
    const rejectedCount = proposals.filter((p) => p.status === "rejected").length

    // Filtering
    const filteredProjects = proposals.filter((p) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch =
            p.title.toLowerCase().includes(q) ||
            p.studentName.toLowerCase().includes(q) ||
            p.studentEmail.toLowerCase().includes(q)
        if (!matchesSearch) return false
        if (filterStatus !== "all" && p.status !== filterStatus) return false
        if (filterSupervisor !== "all") {
            if (!p.supervisor) return false
            if (p.supervisor !== filterSupervisor) return false
        }
        return true
    })

    function handleView(project: Proposal) {
        setSelectedProject(project)
        setRemarkText("")
        setViewDialogOpen(true)
    }

    function openActionDialog(project: Proposal, action: "approved" | "rejected") {
        setActionTarget(project)
        setActionType(action)
        setActionRemark("")
        setActionChecked(false)
        setActionDialogOpen(true)
    }

    function handleConfirmAction() {
        if (!actionTarget) return
        const message = actionRemark.trim() || (actionType === "approved" ? "Proposal approved by admin." : "Proposal rejected by admin.")
        updateProposalStatus(actionTarget._id, actionType, "System Admin", "Admin", message)
        setActionDialogOpen(false)
        setActionTarget(null)
        setActionRemark("")
    }

    function handleAddRemark() {
        if (!selectedProject || !remarkText.trim()) return
        addRemark(selectedProject._id, "System Admin", "Admin", remarkText.trim())
        setRemarkText("")
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Projects</h1>
                    <p className="text-sm text-slate-500 mt-1">View, approve, and manage all student project proposals</p>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0"><FolderKanban className="w-5 h-5" /></div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium truncate">Total Projects</p>
                            <h3 className="font-bold text-xl text-slate-900">{totalProjects}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0"><CheckCircle2 className="w-5 h-5" /></div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium truncate">Approved</p>
                            <h3 className="font-bold text-xl text-slate-900">{approvedCount}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0"><Clock className="w-5 h-5" /></div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium truncate">Pending</p>
                            <h3 className="font-bold text-xl text-slate-900">{pendingCount}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0"><AlertTriangle className="w-5 h-5" /></div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium truncate">Rejected</p>
                            <h3 className="font-bold text-xl text-slate-900">{rejectedCount}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mb-8">
                {/* Search & Filters */}
                <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-end bg-slate-50/50">
                    <div className="w-full lg:flex-1 lg:max-w-md space-y-1.5">
                        <Label htmlFor="search-projects" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Projects</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input id="search-projects" placeholder="Search by project title or student name..." className="pl-9 bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="w-full sm:w-48 space-y-1.5">
                            <Label htmlFor="filter-project-status" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter by Status</Label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger id="filter-project-status" className="bg-white"><SelectValue placeholder="All Projects" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full sm:w-48 space-y-1.5">
                            <Label htmlFor="filter-supervisor" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Supervisor</Label>
                            <Select value={filterSupervisor} onValueChange={setFilterSupervisor}>
                                <SelectTrigger id="filter-supervisor" className="bg-white"><SelectValue placeholder="All Supervisors" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Supervisors</SelectItem>
                                    {supervisorNames.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="p-0">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-slate-800">Projects Overview</h2>
                        <span className="text-xs text-slate-400 font-medium">{filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="min-w-55 text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Project Details</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Student</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider hidden md:table-cell">Supervisor</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider hidden lg:table-cell">Deadline</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Status</TableHead>
                                    <TableHead className="text-right text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider min-w-40">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProjects.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="h-32 text-center text-slate-400">No projects found.</TableCell></TableRow>
                                ) : (
                                    filteredProjects.map((project) => (
                                        <TableRow key={project._id} className="hover:bg-slate-50 border-slate-100">
                                            <TableCell className="py-3.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-semibold text-sm text-slate-900 leading-snug">{project.title}</span>
                                                    <span className="text-xs text-slate-500 line-clamp-1">{truncateText(project.description, 45)}</span>
                                                    <span className="text-[11px] text-slate-400 mt-0.5">Submitted: {project.submittedDate}</span>
                                                    {project.attachedFileUrl && project.attachedFileType && (
                                                        <div className="mt-1">
                                                            <FileCard fileUrl={project.attachedFileUrl} fileType={project.attachedFileType} />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-slate-800 font-medium">{project.studentName}</span>
                                                    <span className="text-[11px] text-slate-400">{project.studentEmail}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3.5 hidden md:table-cell">
                                                {project.supervisor ? (
                                                    <span className="text-sm font-medium text-emerald-700">{project.supervisor}</span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-3.5 hidden lg:table-cell">
                                                <span className="text-sm text-slate-700">{formatDeadline(project.deadline)}</span>
                                            </TableCell>
                                            <TableCell className="py-3.5">{statusBadge(project.status)}</TableCell>
                                            <TableCell className="py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                                    <Button size="sm" className="h-8 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold gap-1 px-3" onClick={() => handleView(project)}>
                                                        <Eye className="w-3.5 h-3.5" />View
                                                    </Button>
                                                    {project.status === "pending" && (
                                                        <>
                                                            <Button size="sm" className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold gap-1 px-3" onClick={() => openActionDialog(project, "approved")}>
                                                                <ThumbsUp className="w-3.5 h-3.5" />Approve
                                                            </Button>
                                                            <Button size="sm" className="h-8 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold gap-1 px-3" onClick={() => openActionDialog(project, "rejected")}>
                                                                <ThumbsDown className="w-3.5 h-3.5" />Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* ─── Project View Dialog ────────────────────────── */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="sm:max-w-140 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-slate-500" />
                            Project Details
                        </DialogTitle>
                    </DialogHeader>

                    {selectedProject && (
                        <div className="grid gap-5 py-1">
                            {/* Title */}
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</Label>
                                <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                                    <p className="text-sm font-medium text-slate-800">{selectedProject.title}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</Label>
                                <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 max-h-40 overflow-y-auto">
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedProject.description}</p>
                                </div>
                            </div>

                            {/* Attached File */}
                            {selectedProject.attachedFileUrl && selectedProject.attachedFileType && (
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attached File</Label>
                                    <FileCard fileUrl={selectedProject.attachedFileUrl} fileType={selectedProject.attachedFileType} />
                                </div>
                            )}

                            {/* Student & Supervisor row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</Label>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                                        <p className="text-sm text-slate-800">{selectedProject.studentName}</p>
                                        <p className="text-xs text-slate-500">{selectedProject.studentEmail}</p>
                                    </div>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supervisor</Label>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                                        <p className="text-sm text-slate-800">{selectedProject.supervisor ?? "Not Assigned"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Deadline row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</Label>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                                        {statusBadge(selectedProject.status)}
                                    </div>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Deadline</Label>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                                        <p className="text-sm text-slate-800">{formatDeadline(selectedProject.deadline)}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Files */}
                            <div className="grid gap-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Files</Label>
                                {selectedProject.files.length > 0 ? (
                                    <ul className="space-y-2">
                                        {selectedProject.files.map((file, idx) => (
                                            <li key={idx}>
                                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                                                    <Download className="w-4 h-4 shrink-0" />
                                                    <span className="truncate">{file.name}</span>
                                                    <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-400">No files uploaded yet.</p>
                                )}
                            </div>

                            <Separator />

                            {/* Existing Remarks */}
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-slate-500" />
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Remarks &amp; Feedback ({selectedProject.remarks.length})
                                    </Label>
                                </div>
                                {selectedProject.remarks.length > 0 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {selectedProject.remarks.map((r) => (
                                            <div key={r._id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-0.5 bg-slate-200 rounded-full"><User className="w-3 h-3 text-slate-600" /></div>
                                                        <span className="text-xs font-semibold text-slate-700">{r.from}</span>
                                                        <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-500">{r.fromRole}</Badge>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400">{r.date}</span>
                                                </div>
                                                <p className="text-sm text-slate-700">{r.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400">No remarks yet.</p>
                                )}
                            </div>

                            {/* Add Remark */}
                            <div className="grid gap-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add a Remark</Label>
                                <div className="flex gap-2">
                                    <textarea
                                        rows={2}
                                        placeholder="Write your remark or feedback to the student..."
                                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        value={remarkText}
                                        onChange={(e) => setRemarkText(e.target.value)}
                                    />
                                    <Button
                                        size="sm"
                                        className="self-end bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                                        disabled={!remarkText.trim()}
                                        onClick={handleAddRemark}
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ─── Approve / Reject Action Dialog ─────────────── */}
            <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            {actionType === "approved" ? (
                                <ThumbsUp className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <ThumbsDown className="w-5 h-5 text-rose-600" />
                            )}
                            {actionType === "approved" ? "Approve Proposal" : "Reject Proposal"}
                        </DialogTitle>
                    </DialogHeader>
                    {actionTarget && (
                        <div className="py-3 space-y-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1">
                                <p className="font-semibold text-sm text-slate-900">{actionTarget.title}</p>
                                <p className="text-xs text-slate-500">by {actionTarget.studentName}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Remark / Feedback (optional)
                                </Label>
                                <textarea
                                    rows={3}
                                    placeholder={actionType === "approved" ? "e.g., Proposal looks good. Assigned to supervisor." : "e.g., Please revise the scope and resubmit."}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    value={actionRemark}
                                    onChange={(e) => setActionRemark(e.target.value)}
                                />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={actionChecked}
                                    onChange={(e) => setActionChecked(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs font-medium text-slate-600">
                                    I confirm I want to {actionType === "approved" ? "approve" : "reject"} this proposal
                                </span>
                            </label>
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            className={`gap-1.5 text-white ${actionType === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
                            onClick={handleConfirmAction}
                            disabled={!actionChecked}
                        >
                            {actionType === "approved" ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                            {actionType === "approved" ? "Confirm Approve" : "Confirm Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
