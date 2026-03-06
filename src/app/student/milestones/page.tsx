"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Milestone,
    Loader2,
    Upload,
    CloudUpload,
    X,
    FileText,
    Clock,
    CheckCircle2,
    ExternalLink,
} from "lucide-react"
import { useProposals } from "@/lib/proposal-context"
import { useAuth } from "@/lib/auth-context"
import { useUploadThing } from "@/lib/uploadthing"

interface MilestoneItem {
    _id: string
    title: string
    description: string
    dueDate: string
    status: "pending" | "submitted" | "reviewed"
    fileUrl: string | null
    fileName: string | null
    submittedAt: string | null
    createdAt: string | null
}

interface MilestoneWithProposal {
    proposalId: string
    proposalTitle: string
    milestone: MilestoneItem
}

function statusBadge(status: MilestoneItem["status"]) {
    if (status === "pending") {
        return (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Clock className="w-3 h-3 mr-1" />
                Pending
            </Badge>
        )
    }

    if (status === "submitted") {
        return (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <FileText className="w-3 h-3 mr-1" />
                Submitted
            </Badge>
        )
    }

    return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Reviewed
        </Badge>
    )
}

export default function StudentMilestonesPage() {
    const { user } = useAuth()
    const { getProposalsByStudent } = useProposals()

    const studentEmail = user?.email ?? ""
    const myProposals = React.useMemo(() => getProposalsByStudent(studentEmail), [getProposalsByStudent, studentEmail])

    const approvedProposals = React.useMemo(
        () => myProposals.filter((p) => p.status === "approved" || p.status === "completed"),
        [myProposals]
    )

    const [loading, setLoading] = React.useState(true)
    const [milestones, setMilestones] = React.useState<MilestoneWithProposal[]>([])

    const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)
    const [active, setActive] = React.useState<MilestoneWithProposal | null>(null)
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

    const fetchMilestones = React.useCallback(async () => {
        if (approvedProposals.length === 0) {
            setMilestones([])
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const responses = await Promise.all(
                approvedProposals.map(async (proposal) => {
                    const res = await fetch(`/api/proposals/${proposal._id}/milestones`)
                    if (!res.ok) return [] as MilestoneWithProposal[]
                    const rows: MilestoneItem[] = await res.json()
                    return rows.map((milestone) => ({
                        proposalId: proposal._id,
                        proposalTitle: proposal.title,
                        milestone,
                    }))
                })
            )

            const merged = responses.flat()
            merged.sort((a, b) => new Date(a.milestone.dueDate).getTime() - new Date(b.milestone.dueDate).getTime())
            setMilestones(merged)
        } finally {
            setLoading(false)
        }
    }, [approvedProposals])

    React.useEffect(() => {
        fetchMilestones()
    }, [fetchMilestones])

    function openUploadDialog(item: MilestoneWithProposal) {
        if (item.milestone.status !== "pending") return
        setActive(item)
        setSelectedFile(null)
        setUploadError("")
        setUploadProgress(0)
        setUploadDialogOpen(true)
    }

    async function submitMilestone() {
        if (!active || !selectedFile) return

        setUploadError("")
        setUploadProgress(0)

        try {
            console.log("Uploading file:", selectedFile.name, "for milestone:", active.milestone.title)
            const uploadRes = await startUpload([selectedFile])
            const file = uploadRes?.[0]

            if (!file) {
                console.error("Upload failed - no file returned")
                setUploadError("Upload failed. Please try again.")
                return
            }

            console.log("File uploaded successfully, updating milestone...")
            const patchRes = await fetch(`/api/proposals/${active.proposalId}/milestones/${active.milestone._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileUrl: file.ufsUrl ?? file.url, fileName: file.name }),
            })

            console.log("Patch response status:", patchRes.status)

            if (!patchRes.ok) {
                const payload = await patchRes.json().catch(() => ({}))
                console.error("Patch error:", payload)
                setUploadError(payload.error ?? "Failed to submit milestone.")
                return
            }

            const updated: MilestoneItem[] = await patchRes.json()
            setMilestones((prev) => {
                const withoutProposal = prev.filter((p) => p.proposalId !== active.proposalId)
                const remapped = updated.map((milestone) => ({
                    proposalId: active.proposalId,
                    proposalTitle: active.proposalTitle,
                    milestone,
                }))
                const merged = [...withoutProposal, ...remapped]
                merged.sort((a, b) => new Date(a.milestone.dueDate).getTime() - new Date(b.milestone.dueDate).getTime())
                return merged
            })

            setUploadDialogOpen(false)
            setSelectedFile(null)
        } catch (err) {
            console.error("Submission error:", err)
            setUploadError("Network error. Please try again.")
        }
    }

    const pending = milestones.filter((m) => m.milestone.status === "pending")
    const done = milestones.filter((m) => m.milestone.status !== "pending")

    return (
        <div className="flex flex-col gap-4 sm:gap-6 w-full px-4 sm:px-0 max-w-7xl mx-auto">
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-100 shadow-sm">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 flex-wrap">
                    <Milestone className="w-5 sm:w-6 h-5 sm:h-6 text-indigo-600 flex-shrink-0" />
                    <span>My Milestones</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-2">
                    Track your assigned milestones and upload deliverables before deadlines.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card className="border-slate-100 bg-white">
                    <CardContent className="p-4 sm:p-5">
                        <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">Total</p>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{milestones.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-100 bg-white">
                    <CardContent className="p-4 sm:p-5">
                        <p className="text-xs uppercase tracking-wider text-amber-600 font-medium">Pending</p>
                        <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-2">{pending.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-100 bg-white">
                    <CardContent className="p-4 sm:p-5">
                        <p className="text-xs uppercase tracking-wider text-emerald-600 font-medium">Completed</p>
                        <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">{done.length}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="border-slate-100 bg-white">
                    <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                        <CardTitle className="text-sm sm:text-base">Pending Milestones</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Tap a card to upload files for that milestone.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                        {loading ? (
                            <div className="flex justify-center py-8 sm:py-10"><Loader2 className="w-5 sm:w-6 h-5 sm:h-6 animate-spin text-slate-400" /></div>
                        ) : pending.length === 0 ? (
                            <p className="text-xs sm:text-sm text-slate-500 py-6 text-center">No pending milestones.</p>
                        ) : (
                            <div className="space-y-2 sm:space-y-3">
                                {pending.map((item) => (
                                    <button
                                        key={item.milestone._id}
                                        type="button"
                                        onClick={() => openUploadDialog(item)}
                                        className="w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl border border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:shadow-sm transition-all active:scale-95 sm:active:scale-100"
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-xs sm:text-sm text-slate-800 truncate">{item.milestone.title}</p>
                                                    <p className="text-xs text-slate-500 truncate mt-0.5">{item.proposalTitle}</p>
                                                </div>
                                                {statusBadge(item.milestone.status)}
                                            </div>
                                            <p className="text-xs text-slate-600 line-clamp-2">{item.milestone.description}</p>
                                            <p className="text-xs text-amber-700 font-medium">
                                                Due {new Date(item.milestone.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-slate-100 bg-white">
                    <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                        <CardTitle className="text-sm sm:text-base">Submitted Milestones</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Already submitted or reviewed by your guide.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                        {loading ? (
                            <div className="flex justify-center py-8 sm:py-10"><Loader2 className="w-5 sm:w-6 h-5 sm:h-6 animate-spin text-slate-400" /></div>
                        ) : done.length === 0 ? (
                            <p className="text-xs sm:text-sm text-slate-500 py-6 text-center">No submissions yet.</p>
                        ) : (
                            <div className="space-y-2 sm:space-y-3">
                                {done.map((item) => (
                                    <div key={item.milestone._id} className="p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 bg-white">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-xs sm:text-sm text-slate-800 truncate">{item.milestone.title}</p>
                                                    <p className="text-xs text-slate-500 truncate mt-0.5">{item.proposalTitle}</p>
                                                </div>
                                                {statusBadge(item.milestone.status)}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
                                                <p className="text-xs text-slate-500">
                                                    Due {new Date(item.milestone.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </p>
                                                {item.milestone.fileUrl && (
                                                    <a
                                                        href={item.milestone.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        Open File
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={uploadDialogOpen}
                onOpenChange={(open) => {
                    if (!isUploading) {
                        setUploadDialogOpen(open)
                        if (!open) {
                            setSelectedFile(null)
                            setUploadError("")
                            setUploadProgress(0)
                        }
                    }
                }}
            >
                <DialogContent className="mx-4 max-w-md w-full sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg truncate pr-6">Submit: {active?.milestone.title}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 sm:space-y-4">
                        <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-600">
                            <p className="line-clamp-3">{active?.milestone.description}</p>
                            <p className="text-xs text-slate-500 mt-2">
                                Due {active?.milestone.dueDate ? new Date(active.milestone.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "-"}
                            </p>
                        </div>

                        <div className="border-2 border-dashed border-slate-300 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center">
                            {selectedFile ? (
                                <div className="space-y-2">
                                    <FileText className="w-6 sm:w-8 h-6 sm:h-8 text-indigo-500 mx-auto" />
                                    <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">{selectedFile.name}</p>
                                    <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedFile(null)
                                            if (fileInputRef.current) fileInputRef.current.value = ""
                                        }}
                                        disabled={isUploading}
                                        className="text-red-500 hover:text-red-600 text-xs sm:text-sm h-8"
                                    >
                                        <X className="w-3.5 h-3.5 mr-1" />
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <CloudUpload className="w-6 sm:w-8 h-6 sm:h-8 text-slate-400 mx-auto" />
                                    <p className="text-xs sm:text-sm text-slate-600 font-medium">Select a file to submit</p>
                                    <p className="text-xs text-slate-500 px-1">PDF, DOC, PPT, ZIP, etc.</p>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs sm:text-sm h-8"
                                    >
                                        <CloudUpload className="w-3.5 h-3.5 mr-1" />
                                        Browse Files
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.gz,.xlsx,.xls,.txt"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                setSelectedFile(file)
                                                setUploadError("")
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {isUploading && (
                            <div className="space-y-1.5">
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                                </div>
                                <p className="text-xs text-slate-600 text-center font-medium">Uploading... {uploadProgress}%</p>
                            </div>
                        )}

                        {uploadError && <p className="text-xs sm:text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{uploadError}</p>}
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isUploading} className="text-xs sm:text-sm">Cancel</Button>
                        </DialogClose>
                        <Button onClick={submitMilestone} disabled={!selectedFile || isUploading} className="text-xs sm:text-sm">
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                            Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
