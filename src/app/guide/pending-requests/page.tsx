"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Separator } from "@/components/ui/separator"
import {
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Mail,
    FileText,
    CalendarDays,
    AlertTriangle,
    Eye,
    MessageSquare,
    Send,
} from "lucide-react"
import { useProposals, type Proposal } from "@/lib/proposal-context"
import { useAuth } from "@/lib/auth-context"
import FileCard from "@/components/FileCard"

// ─── Helpers ────────────────────────────────────────────────────────
function statusConfig(status: string) {
    switch (status) {
        case "pending":
            return { label: "Pending", badge: "border-amber-200 bg-amber-50 text-amber-700", cardBorder: "border-l-amber-400", cardBg: "bg-amber-50/30" }
        case "approved":
            return { label: "Approved", badge: "border-emerald-200 bg-emerald-50 text-emerald-700", cardBorder: "border-l-emerald-400", cardBg: "bg-emerald-50/20" }
        case "rejected":
            return { label: "Rejected", badge: "border-rose-200 bg-rose-50 text-rose-700", cardBorder: "border-l-rose-400", cardBg: "bg-rose-50/20" }
        case "completed":
            return { label: "Completed", badge: "border-violet-200 bg-violet-50 text-violet-700", cardBorder: "border-l-violet-400", cardBg: "bg-violet-50/20" }
        default:
            return { label: status, badge: "border-slate-200 bg-slate-50 text-slate-700", cardBorder: "border-l-slate-400", cardBg: "" }
    }
}

// ─── Page ───────────────────────────────────────────────────────────
export default function PendingRequestsPage() {
    const { user } = useAuth()
    const { proposals, updateProposalStatus, addRemark } = useProposals()

    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterStatus, setFilterStatus] = React.useState("all")

    // View dialog
    const [viewOpen, setViewOpen] = React.useState(false)
    const [viewTarget, setViewTarget] = React.useState<Proposal | null>(null)
    const [viewRemarkText, setViewRemarkText] = React.useState("")

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = React.useState(false)
    const [confirmAction, setConfirmAction] = React.useState<"approved" | "rejected">("approved")
    const [confirmTarget, setConfirmTarget] = React.useState<Proposal | null>(null)
    const [confirmRemark, setConfirmRemark] = React.useState("")
    const [confirmChecked, setConfirmChecked] = React.useState(false)

    // Get proposals assigned to this guide or unassigned pending proposals
    const guideRequests = proposals.filter(
        (p) => p.supervisor === user?.name || (p.status === "pending" && !p.supervisor)
    )

    // Computed metrics
    const pendingCount = guideRequests.filter((r) => r.status === "pending").length
    const acceptedCount = guideRequests.filter((r) => r.status === "approved").length
    const rejectedCount = guideRequests.filter((r) => r.status === "rejected").length

    // Filtering
    const filteredRequests = guideRequests.filter((r) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch =
            r.studentName.toLowerCase().includes(q) ||
            r.title.toLowerCase().includes(q) ||
            r.studentEmail.toLowerCase().includes(q)
        if (!matchesSearch) return false
        if (filterStatus === "all") return true
        return r.status === filterStatus
    })

    function openView(proposal: Proposal) {
        setViewTarget(proposal)
        setViewRemarkText("")
        setViewOpen(true)
    }

    function openConfirm(req: Proposal, action: "approved" | "rejected") {
        setConfirmTarget(req)
        setConfirmAction(action)
        setConfirmRemark("")
        setConfirmChecked(false)
        setConfirmOpen(true)
    }

    function handleConfirm() {
        if (!confirmTarget) return
        const guideDisplayName = user?.name ?? "Guide"
        const message =
            confirmRemark.trim() ||
            (confirmAction === "approved"
                ? `Supervision accepted by ${guideDisplayName}.`
                : `Supervision declined by ${guideDisplayName}.`)
        updateProposalStatus(confirmTarget._id, confirmAction, guideDisplayName, "Teacher", message)
        setConfirmOpen(false)
        setConfirmTarget(null)
        setConfirmRemark("")
    }

    function handleAddViewRemark() {
        if (!viewTarget || !viewRemarkText.trim()) return
        const guideDisplayName = user?.name ?? "Guide"
        addRemark(viewTarget._id, guideDisplayName, "Teacher", viewRemarkText.trim())
        setViewRemarkText("")
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Supervision Requests
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Review project proposals, view descriptions, and respond with feedback
                </p>
            </div>

            {/* Mini Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0"><Clock className="w-5 h-5" /></div>
                    <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">Pending</p>
                        <p className="text-lg font-bold text-slate-900">{pendingCount}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0"><CheckCircle2 className="w-5 h-5" /></div>
                    <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">Accepted</p>
                        <p className="text-lg font-bold text-slate-900">{acceptedCount}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0"><XCircle className="w-5 h-5" /></div>
                    <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">Rejected</p>
                        <p className="text-lg font-bold text-slate-900">{rejectedCount}</p>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search by student name or project title..." className="pl-9 bg-white border-slate-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="w-full sm:w-48">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="bg-white"><SelectValue placeholder="All Requests" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Requests</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Request Cards */}
            <div className="space-y-4 pb-8">
                {filteredRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-slate-100 shadow-sm">
                        <AlertTriangle className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">No requests found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    filteredRequests.map((req) => {
                        const config = statusConfig(req.status)
                        return (
                            <div
                                key={req._id}
                                className={`flex flex-col gap-4 p-5 bg-white rounded-xl border border-slate-100 shadow-sm border-l-4 ${config.cardBorder} ${config.cardBg} transition-all hover:shadow-md`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    {/* Left: Info */}
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-base font-bold text-slate-900">{req.studentName}</h3>
                                            <Badge variant="outline" className={`text-[11px] font-semibold ${config.badge}`}>{config.label}</Badge>
                                        </div>
                                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                            <Mail className="w-3 h-3 shrink-0" />{req.studentEmail}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />{req.title}
                                        </p>
                                        {/* Show description snippet */}
                                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 pl-5">
                                            {req.description}
                                        </p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                            <CalendarDays className="w-3 h-3 shrink-0" />Submitted: {req.submittedDate}
                                        </p>
                                        {req.remarks.length > 0 && (
                                            <p className="text-xs text-blue-600 flex items-center gap-1.5 mt-0.5">
                                                <MessageSquare className="w-3 h-3 shrink-0" />
                                                {req.remarks.length} remark{req.remarks.length !== 1 ? "s" : ""}
                                            </p>
                                        )}
                                        {req.attachedFileUrl && req.attachedFileType && (
                                            <div className="mt-1">
                                                <FileCard fileUrl={req.attachedFileUrl} fileType={req.attachedFileType} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-9 border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 font-semibold gap-1.5 px-3"
                                            onClick={() => openView(req)}
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Details
                                        </Button>
                                        {req.status === "pending" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-9 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold gap-1.5 px-4"
                                                    onClick={() => openConfirm(req, "approved")}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="h-9 bg-rose-500 hover:bg-rose-600 text-white font-semibold gap-1.5 px-4"
                                                    onClick={() => openConfirm(req, "rejected")}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* ─── View Details Dialog ────────────────────────── */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="sm:max-w-140 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-slate-500" />
                            Proposal Details
                        </DialogTitle>
                    </DialogHeader>

                    {viewTarget && (
                        <div className="grid gap-5 py-1">
                            {/* Title */}
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Title</Label>
                                <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                                    <p className="text-sm font-medium text-slate-800">{viewTarget.title}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Description</Label>
                                <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 max-h-48 overflow-y-auto">
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{viewTarget.description}</p>
                                </div>
                            </div>

                            {/* Attached File */}
                            {viewTarget.attachedFileUrl && viewTarget.attachedFileType && (
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attached File</Label>
                                    <FileCard fileUrl={viewTarget.attachedFileUrl} fileType={viewTarget.attachedFileType} />
                                </div>
                            )}

                            {/* Student Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</Label>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                                        <p className="text-sm text-slate-800">{viewTarget.studentName}</p>
                                        <p className="text-xs text-slate-500">{viewTarget.studentEmail}</p>
                                    </div>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</Label>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                                        <Badge variant="outline" className={`text-xs font-semibold ${statusConfig(viewTarget.status).badge}`}>
                                            {statusConfig(viewTarget.status).label}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Existing Remarks */}
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-slate-500" />
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Remarks &amp; Feedback ({viewTarget.remarks.length})
                                    </Label>
                                </div>
                                {viewTarget.remarks.length > 0 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {viewTarget.remarks.map((r) => (
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
                                        placeholder="Write your feedback or query about this proposal..."
                                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        value={viewRemarkText}
                                        onChange={(e) => setViewRemarkText(e.target.value)}
                                    />
                                    <Button
                                        size="sm"
                                        className="self-end bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                                        disabled={!viewRemarkText.trim()}
                                        onClick={handleAddViewRemark}
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

            {/* ─── Accept / Reject Confirmation Dialog ────────── */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            {confirmAction === "approved" ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <XCircle className="w-5 h-5 text-rose-600" />
                            )}
                            {confirmAction === "approved" ? "Accept Supervision?" : "Reject Supervision?"}
                        </DialogTitle>
                    </DialogHeader>

                    {confirmTarget && (
                        <div className="space-y-4 py-2">
                            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-semibold text-slate-800">{confirmTarget.studentName}</span>
                                </div>
                                <Separator />
                                <div className="flex items-start gap-2">
                                    <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{confirmTarget.title}</p>
                                        <p className="text-xs text-slate-500 line-clamp-3 mt-1">{confirmTarget.description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Remark / Feedback (optional)
                                </Label>
                                <textarea
                                    rows={3}
                                    placeholder={
                                        confirmAction === "approved"
                                            ? "e.g., Looking forward to working with you on this project."
                                            : "e.g., This topic is outside my area of expertise."
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    value={confirmRemark}
                                    onChange={(e) => setConfirmRemark(e.target.value)}
                                />
                            </div>

                            {confirmAction === "approved" && (
                                <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                                    This student will be added to your assigned students list.
                                </p>
                            )}
                            {confirmAction === "rejected" && (
                                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                                    The student will be notified that their request has been declined.
                                </p>
                            )}

                            <label className="flex items-center gap-2 cursor-pointer select-none mt-1">
                                <input
                                    type="checkbox"
                                    checked={confirmChecked}
                                    onChange={(e) => setConfirmChecked(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs font-medium text-slate-600">
                                    I confirm I want to {confirmAction === "approved" ? "accept" : "reject"} this supervision request
                                </span>
                            </label>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline" className="border-slate-300 text-slate-700">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleConfirm}
                            disabled={!confirmChecked}
                            className={confirmAction === "approved" ? "bg-emerald-500 hover:bg-emerald-600 text-white font-medium" : "bg-rose-500 hover:bg-rose-600 text-white font-medium"}
                        >
                            {confirmAction === "approved" ? "Accept" : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
