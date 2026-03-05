"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import {
    FileText,
    Send,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Edit3,
    Trash2,
    MessageSquare,
    User,
} from "lucide-react"
import { useProposals, type ProposalStatus } from "@/lib/proposal-context"
import { useAuth } from "@/lib/auth-context"

// ─── Helpers ────────────────────────────────────────────────────────
function statusConfig(status: ProposalStatus | "none") {
    switch (status) {
        case "pending":
            return { label: "Pending Review", color: "border-amber-300 bg-amber-50 text-amber-700", icon: Clock }
        case "approved":
            return { label: "Approved", color: "border-emerald-300 bg-emerald-50 text-emerald-700", icon: CheckCircle2 }
        case "rejected":
            return { label: "Rejected", color: "border-red-300 bg-red-50 text-red-700", icon: AlertTriangle }
        default:
            return { label: "None", color: "border-slate-300 bg-slate-50 text-slate-700", icon: FileText }
    }
}

function remarkActionBadge(action?: string) {
    switch (action) {
        case "approved":
            return <Badge variant="outline" className="text-[10px] border-emerald-300 bg-emerald-50 text-emerald-700">Approved</Badge>
        case "rejected":
            return <Badge variant="outline" className="text-[10px] border-red-300 bg-red-50 text-red-700">Rejected</Badge>
        default:
            return <Badge variant="outline" className="text-[10px] border-blue-300 bg-blue-50 text-blue-700">Feedback</Badge>
    }
}

// ─── Page ───────────────────────────────────────────────────────────
export default function SubmitProposalPage() {
    const { user } = useAuth()
    const { addProposal, getProposalsByStudent } = useProposals()

    const [title, setTitle] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [confirmOpen, setConfirmOpen] = React.useState(false)
    const [successOpen, setSuccessOpen] = React.useState(false)

    const studentEmail = user?.email ?? ""
    const studentName = user?.name ?? ""
    const myProposals = getProposalsByStudent(studentEmail)
    const latestProposal = myProposals.length > 0 ? myProposals[0] : null

    const canSubmit = title.trim().length > 0 && description.trim().length >= 20

    function handleSubmitClick() {
        if (!canSubmit) return
        setConfirmOpen(true)
    }

    function handleConfirmSubmit() {
        addProposal(title.trim(), description.trim(), studentName, studentEmail)
        setTitle("")
        setDescription("")
        setConfirmOpen(false)
        setSuccessOpen(true)
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
            {/* ─── Header ─────────────────────────────────────── */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Submit Proposal
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Please fill out all sections of your project proposal. Make sure to be detailed and clear about your project goals.
                </p>
            </div>

            {/* ─── Proposal Form (only if no pending/approved proposal) ── */}
            {(!latestProposal || latestProposal.status === "rejected") && (
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="project-title" className="font-semibold text-sm text-slate-700">
                                Project Title
                            </Label>
                            <Input
                                id="project-title"
                                placeholder="Enter your project title"
                                className="bg-white"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="project-desc" className="font-semibold text-sm text-slate-700">
                                Project Description
                            </Label>
                            <textarea
                                id="project-desc"
                                rows={6}
                                placeholder="Provide a detailed description of your project..."
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            {description.length > 0 && description.length < 20 && (
                                <p className="text-xs text-amber-600">
                                    Description should be at least 20 characters ({20 - description.length} more needed)
                                </p>
                            )}
                        </div>

                        <Separator />

                        <div className="flex justify-end">
                            <Button
                                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6"
                                disabled={!canSubmit}
                                onClick={handleSubmitClick}
                            >
                                <Send className="w-4 h-4" />
                                Submit Proposal
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ─── Submitted Proposal Cards ───────────────────── */}
            {myProposals.map((proposal) => (
                <Card key={proposal.id} className="shadow-sm border-slate-100">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-slate-900">Your Proposal</h2>
                                    <p className="text-xs text-slate-500">Submitted on {proposal.submittedDate}</p>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className={`text-xs font-semibold ${statusConfig(proposal.status).color}`}
                            >
                                {statusConfig(proposal.status).label}
                            </Badge>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Title</p>
                                <p className="text-sm font-medium text-slate-800">{proposal.title}</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Description</p>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{proposal.description}</p>
                            </div>
                            {proposal.supervisor && (
                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Supervisor</p>
                                    <p className="text-sm font-medium text-slate-800">{proposal.supervisor}</p>
                                </div>
                            )}
                        </div>

                        {/* ─── Remarks / Feedback Timeline ────────── */}
                        {proposal.remarks.length > 0 && (
                            <>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-slate-500" />
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Remarks &amp; Feedback ({proposal.remarks.length})
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        {proposal.remarks.map((remark) => (
                                            <div
                                                key={remark.id}
                                                className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-slate-200 rounded-full">
                                                            <User className="w-3 h-3 text-slate-600" />
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-700">{remark.from}</span>
                                                        <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-500">
                                                            {remark.fromRole}
                                                        </Badge>
                                                        {remarkActionBadge(remark.action)}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400">{remark.date}</span>
                                                </div>
                                                <p className="text-sm text-slate-700 leading-relaxed">{remark.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            ))}

            {/* ─── Empty State ────────────────────────────────── */}
            {myProposals.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No proposals submitted yet</p>
                    <p className="text-xs mt-1">Fill out the form above to submit your first proposal</p>
                </div>
            )}

            {/* ─── Confirm Submit Dialog ──────────────────────── */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <Send className="w-5 h-5 text-blue-600" />
                            Confirm Submission
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-3 space-y-3">
                        <p className="text-sm text-slate-600">
                            Are you sure you want to submit this proposal?
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                            <p className="font-semibold text-sm text-slate-900">{title}</p>
                            <p className="text-xs text-slate-600 line-clamp-3">{description}</p>
                        </div>
                        <p className="text-xs text-slate-500">
                            Your proposal will be sent to the admin for review.
                        </p>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleConfirmSubmit}
                        >
                            <Send className="w-4 h-4" />
                            Confirm Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Success Dialog ─────────────────────────────── */}
            <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
                <DialogContent className="sm:max-w-sm text-center">
                    <div className="flex flex-col items-center gap-4 py-6">
                        <div className="p-3 bg-emerald-100 rounded-full">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Proposal Submitted!</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Your proposal has been submitted successfully and is awaiting admin review.
                            </p>
                        </div>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                            onClick={() => setSuccessOpen(false)}
                        >
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
