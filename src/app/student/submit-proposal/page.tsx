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
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────
type ProposalStatus = "none" | "pending" | "approved" | "rejected"

interface Proposal {
    id: number
    title: string
    description: string
    status: ProposalStatus
    submittedDate: string
    feedback?: string
}

// ─── Helpers ────────────────────────────────────────────────────────
function statusConfig(status: ProposalStatus) {
    switch (status) {
        case "pending":
            return { label: "Pending", color: "border-amber-300 bg-amber-50 text-amber-700", icon: Clock }
        case "approved":
            return { label: "Approved", color: "border-emerald-300 bg-emerald-50 text-emerald-700", icon: CheckCircle2 }
        case "rejected":
            return { label: "Rejected", color: "border-red-300 bg-red-50 text-red-700", icon: AlertTriangle }
        default:
            return { label: "None", color: "border-slate-300 bg-slate-50 text-slate-700", icon: FileText }
    }
}

// ─── Page ───────────────────────────────────────────────────────────
export default function SubmitProposalPage() {
    const [title, setTitle] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [submittedProposal, setSubmittedProposal] = React.useState<Proposal | null>(null)
    const [confirmOpen, setConfirmOpen] = React.useState(false)
    const [successOpen, setSuccessOpen] = React.useState(false)
    const [deleteOpen, setDeleteOpen] = React.useState(false)

    const canSubmit = title.trim().length > 0 && description.trim().length >= 20

    function handleSubmitClick() {
        if (!canSubmit) return
        setConfirmOpen(true)
    }

    function handleConfirmSubmit() {
        const newProposal: Proposal = {
            id: Date.now(),
            title: title.trim(),
            description: description.trim(),
            status: "pending",
            submittedDate: new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }),
        }
        setSubmittedProposal(newProposal)
        setTitle("")
        setDescription("")
        setConfirmOpen(false)
        setSuccessOpen(true)
    }

    function handleDelete() {
        setSubmittedProposal(null)
        setDeleteOpen(false)
    }

    function handleEdit() {
        if (!submittedProposal) return
        setTitle(submittedProposal.title)
        setDescription(submittedProposal.description)
        setSubmittedProposal(null)
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
            {/* ─── Header ─────────────────────────────────────── */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Submit Proposal
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Please fill out all sections of your project proposal. Make sure to be detailed and cleared about your project goals.
                </p>
            </div>

            {/* ─── Proposal Form ──────────────────────────────── */}
            {!submittedProposal && (
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-6 space-y-6">
                        {/* Project Title */}
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

                        {/* Project Description */}
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

                        {/* Submit Button */}
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

            {/* ─── Submitted Proposal Card ────────────────────── */}
            {submittedProposal && (
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-slate-900">Your Proposal</h2>
                                    <p className="text-xs text-slate-500">Submitted on {submittedProposal.submittedDate}</p>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className={`text-xs font-semibold ${statusConfig(submittedProposal.status).color}`}
                            >
                                {statusConfig(submittedProposal.status).label}
                            </Badge>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Title</p>
                                <p className="text-sm font-medium text-slate-800">{submittedProposal.title}</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Description</p>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{submittedProposal.description}</p>
                            </div>
                        </div>

                        {submittedProposal.feedback && (
                            <>
                                <Separator />
                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Feedback</p>
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                                        <p className="text-sm text-slate-700">{submittedProposal.feedback}</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {submittedProposal.status === "pending" && (
                            <>
                                <Separator />
                                <div className="flex items-center gap-3 justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5 text-slate-600"
                                        onClick={handleEdit}
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => setDeleteOpen(true)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Withdraw
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
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
                            You can edit or withdraw your proposal while it is pending review.
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

            {/* ─── Delete Confirmation Dialog ─────────────────── */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Withdraw Proposal
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-3 space-y-3">
                        <p className="text-sm text-slate-600">
                            Are you sure you want to withdraw your proposal? This action cannot be undone.
                        </p>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            className="gap-1.5 bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-4 h-4" />
                            Withdraw
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
