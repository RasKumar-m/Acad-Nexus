"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"

// ─── Mock Data ──────────────────────────────────────────────────────
type RequestStatus = "pending" | "accepted" | "rejected"

interface SupervisionRequest {
    id: number
    studentName: string
    studentEmail: string
    projectTitle: string
    submittedDate: string
    status: RequestStatus
    note: string
}

const initialRequests: SupervisionRequest[] = [
    {
        id: 1,
        studentName: "Ahmed Saeed",
        studentEmail: "ahmed.saeed.student.edu@gmail.com",
        projectTitle: "Smart Deadline & Project Tracking System",
        submittedDate: "09/01/2026",
        status: "pending",
        note: "Project proposal pending",
    },
    {
        id: 2,
        studentName: "Maryam Iqbal",
        studentEmail: "maryam.iqbal@student.edu",
        projectTitle: "Inventory Management System for SMEs",
        submittedDate: "09/01/2026",
        status: "pending",
        note: "Supervisor already assigned",
    },
    {
        id: 3,
        studentName: "Usman Tariq",
        studentEmail: "usman.tariq@student.edu",
        projectTitle: "Real-Time Chat Application",
        submittedDate: "08/28/2026",
        status: "accepted",
        note: "Accepted on 09/02/2026",
    },
    {
        id: 4,
        studentName: "Fatima Noor",
        studentEmail: "fatima.noor@student.edu",
        projectTitle: "AI-Based Resume Screening Tool",
        submittedDate: "08/25/2026",
        status: "rejected",
        note: "Not in area of expertise",
    },
]

// ─── Helpers ────────────────────────────────────────────────────────
function statusConfig(status: RequestStatus) {
    switch (status) {
        case "pending":
            return {
                label: "Pending",
                badge: "border-amber-200 bg-amber-50 text-amber-700",
                cardBorder: "border-l-amber-400",
                cardBg: "bg-amber-50/30",
            }
        case "accepted":
            return {
                label: "Accepted",
                badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
                cardBorder: "border-l-emerald-400",
                cardBg: "bg-emerald-50/20",
            }
        case "rejected":
            return {
                label: "Rejected",
                badge: "border-rose-200 bg-rose-50 text-rose-700",
                cardBorder: "border-l-rose-400",
                cardBg: "bg-rose-50/20",
            }
    }
}

// ─── Page ───────────────────────────────────────────────────────────
export default function PendingRequestsPage() {
    const [requests, setRequests] = React.useState<SupervisionRequest[]>(initialRequests)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterStatus, setFilterStatus] = React.useState("all")

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = React.useState(false)
    const [confirmAction, setConfirmAction] = React.useState<"accept" | "reject" | null>(null)
    const [confirmTarget, setConfirmTarget] = React.useState<SupervisionRequest | null>(null)

    // Computed metrics
    const pendingCount = requests.filter((r) => r.status === "pending").length
    const acceptedCount = requests.filter((r) => r.status === "accepted").length
    const rejectedCount = requests.filter((r) => r.status === "rejected").length

    // Filtering
    const filteredRequests = requests.filter((r) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch =
            r.studentName.toLowerCase().includes(q) ||
            r.projectTitle.toLowerCase().includes(q) ||
            r.studentEmail.toLowerCase().includes(q)
        if (!matchesSearch) return false
        if (filterStatus === "all") return true
        return r.status === filterStatus
    })

    function openConfirm(req: SupervisionRequest, action: "accept" | "reject") {
        setConfirmTarget(req)
        setConfirmAction(action)
        setConfirmOpen(true)
    }

    function handleConfirm() {
        if (!confirmTarget || !confirmAction) return
        setRequests((prev) =>
            prev.map((r) =>
                r.id === confirmTarget.id
                    ? {
                          ...r,
                          status: confirmAction === "accept" ? ("accepted" as RequestStatus) : ("rejected" as RequestStatus),
                          note:
                              confirmAction === "accept"
                                  ? `Accepted on ${new Date().toLocaleDateString()}`
                                  : `Rejected on ${new Date().toLocaleDateString()}`,
                      }
                    : r
            )
        )
        setConfirmOpen(false)
        setConfirmTarget(null)
        setConfirmAction(null)
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Pending Supervision Requests
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Review and respond to student supervision requests
                </p>
            </div>

            {/* Mini Metrics */}
            <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">Pending</p>
                        <p className="text-lg font-bold text-slate-900">{pendingCount}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">Accepted</p>
                        <p className="text-lg font-bold text-slate-900">{acceptedCount}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0">
                        <XCircle className="w-5 h-5" />
                    </div>
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
                    <Input
                        placeholder="Search by student name or project title..."
                        className="pl-9 bg-white border-slate-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="All Requests" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Requests</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
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
                                key={req.id}
                                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-slate-100 shadow-sm border-l-4 ${config.cardBorder} ${config.cardBg} transition-all hover:shadow-md`}
                            >
                                {/* Left: Info */}
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-base font-bold text-slate-900">
                                            {req.studentName}
                                        </h3>
                                        <Badge
                                            variant="outline"
                                            className={`text-[11px] font-semibold ${config.badge}`}
                                        >
                                            {config.label}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                        <Mail className="w-3 h-3 shrink-0" />
                                        {req.studentEmail}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        {req.projectTitle}
                                    </p>
                                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                        <CalendarDays className="w-3 h-3 shrink-0" />
                                        Submitted: {req.submittedDate}
                                    </p>
                                    {req.note && (
                                        <p className="text-xs text-slate-500 italic mt-0.5">
                                            {req.note}
                                        </p>
                                    )}
                                </div>

                                {/* Right: Actions */}
                                {req.status === "pending" && (
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-9 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold gap-1.5 px-4"
                                            onClick={() => openConfirm(req, "accept")}
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-9 bg-rose-500 hover:bg-rose-600 text-white font-semibold gap-1.5 px-4"
                                            onClick={() => openConfirm(req, "reject")}
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </Button>
                                    </div>
                                )}

                                {req.status !== "pending" && (
                                    <div className="shrink-0">
                                        <Badge
                                            variant="outline"
                                            className={`text-xs font-semibold px-3 py-1 ${config.badge}`}
                                        >
                                            {config.label}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* ─── Confirmation Dialog ────────────────────────── */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg">
                            {confirmAction === "accept"
                                ? "Accept Supervision Request?"
                                : "Reject Supervision Request?"}
                        </DialogTitle>
                    </DialogHeader>

                    {confirmTarget && (
                        <div className="space-y-4 py-2">
                            <p className="text-sm text-slate-600">
                                {confirmAction === "accept"
                                    ? "You are about to accept the supervision request from:"
                                    : "You are about to reject the supervision request from:"}
                            </p>

                            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-semibold text-slate-800">
                                        {confirmTarget.studentName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-600">
                                        {confirmTarget.studentEmail}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700">
                                        {confirmTarget.projectTitle}
                                    </span>
                                </div>
                            </div>

                            {confirmAction === "accept" && (
                                <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                                    This student will be added to your assigned students list.
                                </p>
                            )}
                            {confirmAction === "reject" && (
                                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                                    The student will be notified that their request has been declined.
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline" className="border-slate-300 text-slate-700">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={handleConfirm}
                            className={
                                confirmAction === "accept"
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                                    : "bg-rose-500 hover:bg-rose-600 text-white font-medium"
                            }
                        >
                            {confirmAction === "accept" ? "Accept" : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
