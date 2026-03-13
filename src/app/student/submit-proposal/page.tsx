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
    Users,
    Paperclip,
    ExternalLink,
    Loader2,
    Upload,
    CloudUpload,
    Copy,
    LogOut,
    Lock,
    Plus,
    Crown,
} from "lucide-react"
import { useProposals, type ProposalStatus, type ProposalTeamMember } from "@/lib/proposal-context"
import { useAuth } from "@/lib/auth-context"
import { useUploadThing } from "@/lib/uploadthing"

// ─── Types ──────────────────────────────────────────────────────────
interface TeamData {
    _id: string
    teamCode: string
    teamMembers: ProposalTeamMember[]
    teamLocked: boolean
    status: string
    leaderId: string
    title: string
    description: string
}

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
    const { editProposal, deleteProposal, getProposalsByStudent, refreshProposals, loading: proposalsLoading } = useProposals()

    // ── Team state (draft/lobby) ────────────────────────────────────
    const [team, setTeam] = React.useState<TeamData | null>(null)
    const [teamLoading, setTeamLoading] = React.useState(true)
    const [teamError, setTeamError] = React.useState("")
    const [actionLoading, setActionLoading] = React.useState(false)

    // Join code input
    const [joinCode, setJoinCode] = React.useState("")

    // Lock & Submit form
    const [title, setTitle] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [fileUrl, setFileUrl] = React.useState("")
    const [fileName, setFileName] = React.useState("")
    const [fileType, setFileType] = React.useState("")
    const [lockConfirmOpen, setLockConfirmOpen] = React.useState(false)
    const [successOpen, setSuccessOpen] = React.useState(false)
    const [codeCopied, setCodeCopied] = React.useState(false)

    // Leave team confirmation
    const [leaveOpen, setLeaveOpen] = React.useState(false)

    // Edit state
    const [editOpen, setEditOpen] = React.useState(false)
    const [editTarget, setEditTarget] = React.useState<string | null>(null)
    const [editTitle, setEditTitle] = React.useState("")
    const [editDescription, setEditDescription] = React.useState("")
    const [editSaving, setEditSaving] = React.useState(false)

    // Delete state
    const [deleteOpen, setDeleteOpen] = React.useState(false)
    const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null)
    const [deleteDeleting, setDeleteDeleting] = React.useState(false)

    // File upload state
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

    const studentEmail = user?.email ?? ""
    const myProposals = getProposalsByStudent(studentEmail)
    const isLeader = team ? team.leaderId === user?.id : false
    const canLock = title.trim().length > 0 && description.trim().length >= 20 && (team?.teamMembers.length ?? 0) >= 2

    // ── Fetch team on mount ─────────────────────────────────────────
    const fetchTeam = React.useCallback(async () => {
        try {
            const res = await fetch("/api/teams/my")
            const data = await res.json()
            if (data.team && data.team.status === "draft") {
                setTeam(data.team)
            } else {
                setTeam(null)
            }
        } catch {
            setTeam(null)
        } finally {
            setTeamLoading(false)
        }
    }, [])

    React.useEffect(() => { fetchTeam() }, [fetchTeam])

    // ── Team actions ────────────────────────────────────────────────
    async function handleStartProject() {
        setActionLoading(true)
        setTeamError("")
        try {
            const res = await fetch("/api/teams/init", { method: "POST" })
            const data = await res.json()
            if (!res.ok) {
                setTeamError(data.error || "Failed to start project")
                return
            }
            await fetchTeam()
        } catch {
            setTeamError("Network error. Please try again.")
        } finally {
            setActionLoading(false)
        }
    }

    async function handleJoinTeam() {
        if (!joinCode.trim()) return
        setActionLoading(true)
        setTeamError("")
        try {
            const res = await fetch("/api/teams/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamCode: joinCode.trim() }),
            })
            const data = await res.json()
            if (!res.ok) {
                setTeamError(data.error || "Failed to join team")
                return
            }
            setJoinCode("")
            await fetchTeam()
        } catch {
            setTeamError("Network error. Please try again.")
        } finally {
            setActionLoading(false)
        }
    }

    async function handleLeaveTeam() {
        setActionLoading(true)
        setTeamError("")
        try {
            const res = await fetch("/api/teams/leave", { method: "POST" })
            const data = await res.json()
            if (!res.ok) {
                setTeamError(data.error || "Failed to leave team")
                return
            }
            setTeam(null)
            setLeaveOpen(false)
        } catch {
            setTeamError("Network error. Please try again.")
        } finally {
            setActionLoading(false)
        }
    }

    async function handleLockAndSubmit() {
        if (!team || !canLock) return
        setActionLoading(true)
        setTeamError("")
        try {
            const res = await fetch("/api/teams/lock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    proposalId: team._id,
                    title: title.trim(),
                    description: description.trim(),
                    attachedFileUrl: fileUrl || null,
                    attachedFileType: fileType || null,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setTeamError(data.error || "Failed to submit proposal")
                return
            }
            setTeam(null)
            setLockConfirmOpen(false)
            setSuccessOpen(true)
            await refreshProposals()
        } catch {
            setTeamError("Network error. Please try again.")
        } finally {
            setActionLoading(false)
        }
    }

    function copyTeamCode() {
        if (!team?.teamCode) return
        navigator.clipboard.writeText(team.teamCode)
        setCodeCopied(true)
        setTimeout(() => setCodeCopied(false), 2000)
    }

    // ── Edit / Delete handlers ──────────────────────────────────────
    function openEdit(proposal: { _id: string; title: string; description: string }) {
        setEditTarget(proposal._id)
        setEditTitle(proposal.title)
        setEditDescription(proposal.description)
        setEditOpen(true)
    }

    async function handleEditSave() {
        if (!editTarget) return
        setEditSaving(true)
        try {
            await editProposal(editTarget, {
                title: editTitle.trim(),
                description: editDescription.trim(),
            })
            setEditOpen(false)
        } catch {
            // handled
        } finally {
            setEditSaving(false)
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        setDeleteDeleting(true)
        try {
            await deleteProposal(deleteTarget)
            setDeleteOpen(false)
        } catch {
            // handled
        } finally {
            setDeleteDeleting(false)
        }
    }

    // ── Loading ─────────────────────────────────────────────────────
    if (proposalsLoading || teamLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        )
    }

    // Determine view: draft lobby vs normal
    const hasSubmittedProposals = myProposals.length > 0
    const hasDraftTeam = team !== null
    const showStartOptions = !hasDraftTeam && (!hasSubmittedProposals || myProposals.every(p => p.status === "rejected"))

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
            {/* ─── Header ─────────────────────────────────────── */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {hasDraftTeam ? "Team Lobby" : "Project Proposal"}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    {hasDraftTeam
                        ? "Manage your team and submit your proposal when ready."
                        : showStartOptions
                            ? "Start a new project or join an existing team to begin."
                            : "View and manage your submitted proposals."
                    }
                </p>
            </div>

            {/* ─── Error Banner ────────────────────────────────── */}
            {teamError && (
                <div className="flex items-center gap-2 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {teamError}
                    <button className="ml-auto text-red-400 hover:text-red-600" onClick={() => setTeamError("")}>
                        &times;
                    </button>
                </div>
            )}

            {/* ════════════════════════════════════════════════════
                STATE 1: No Team — Start a Project or Join
            ════════════════════════════════════════════════════ */}
            {showStartOptions && (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Start a Project */}
                    <Card className="shadow-sm border-slate-100 hover:border-blue-200 transition-colors">
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                            <div className="p-4 bg-blue-50 rounded-full">
                                <Plus className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-slate-900">Start a Project</h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Create a new team and get a join code to share with your teammates.
                                </p>
                            </div>
                            <Button
                                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full"
                                disabled={actionLoading}
                                onClick={handleStartProject}
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                                Start a Project
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Join with Code */}
                    <Card className="shadow-sm border-slate-100 hover:border-emerald-200 transition-colors">
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                            <div className="p-4 bg-emerald-50 rounded-full">
                                <Send className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-slate-900">Join a Team</h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Enter the team code shared by your team leader to join their project.
                                </p>
                            </div>
                            <div className="w-full space-y-3">
                                <Input
                                    placeholder="e.g. NEXUS-AB3K"
                                    className="bg-white text-center font-mono text-lg tracking-wider uppercase"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    maxLength={10}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleJoinTeam() }}
                                />
                                <Button
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                                    disabled={actionLoading || !joinCode.trim()}
                                    onClick={handleJoinTeam}
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Join Team
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ════════════════════════════════════════════════════
                STATE 2: Draft Team — Team Lobby
            ════════════════════════════════════════════════════ */}
            {hasDraftTeam && (
                <>
                    {/* Team Code Card */}
                    <Card className="shadow-sm border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg text-slate-900">Team Code</h2>
                                        <p className="text-xs text-slate-500">Share this code with your teammates</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 text-xs">
                                    Draft
                                </Badge>
                            </div>

                            <div className="flex items-center justify-center gap-3 py-3">
                                <span className="font-mono text-3xl font-bold tracking-[0.2em] text-blue-700 select-all">
                                    {team.teamCode}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50"
                                    onClick={copyTeamCode}
                                >
                                    {codeCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {codeCopied ? "Copied!" : "Copy"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Members */}
                    <Card className="shadow-sm border-slate-100">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm text-slate-700 uppercase tracking-wider">
                                    Team Members ({team.teamMembers.length}/5)
                                </h3>
                                {team.teamMembers.length < 2 && (
                                    <span className="text-xs text-amber-600 font-medium">Minimum 2 required</span>
                                )}
                            </div>
                            <div className="space-y-2">
                                {team.teamMembers.map((member, i) => (
                                    <div
                                        key={member.userId || i}
                                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white"
                                    >
                                        <div className="p-1.5 bg-slate-100 rounded-full">
                                            <User className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 truncate">
                                                {member.name}
                                                {member.userId === team.leaderId && (
                                                    <span className="inline-flex items-center gap-1 ml-2 text-xs text-amber-600 font-semibold">
                                                        <Crown className="w-3 h-3" /> Leader
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {member.email}
                                                {member.rollNumber && ` · ${member.rollNumber}`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Leave Team Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 border-red-300 text-red-700 hover:bg-red-50"
                                disabled={actionLoading}
                                onClick={() => setLeaveOpen(true)}
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                {isLeader ? "Disband Team" : "Leave Team"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Lock & Submit Section — Leader Only */}
                    {isLeader ? (
                        <Card className="shadow-sm border-slate-100">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg text-slate-900">Lock Team &amp; Submit Proposal</h2>
                                        <p className="text-xs text-slate-500">Fill in your project details and submit when your team is ready</p>
                                    </div>
                                </div>

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

                                <div className="space-y-3">
                                    <Label className="font-semibold text-sm text-slate-700">Attach Proposal File (Optional)</Label>
                                    {!fileUrl ? (
                                        <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 transition-colors text-center">
                                            {!selectedFile && !isUploading ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-3 bg-blue-50 rounded-full">
                                                        <CloudUpload className="w-6 h-6 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700">Choose a file to attach</p>
                                                        <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, PPT, PPTX, ZIP, RAR &middot; Max 32MB</p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <Upload className="w-4 h-4" />
                                                        Browse Files
                                                    </Button>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-rar-compressed,application/gzip"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0]
                                                            if (!file) return
                                                            setSelectedFile(file)
                                                            setUploadError("")
                                                            setUploadProgress(0)
                                                            try {
                                                                const res = await startUpload([file])
                                                                if (!res?.[0]) {
                                                                    setUploadError("Upload failed. Please try again.")
                                                                    setSelectedFile(null)
                                                                    return
                                                                }
                                                                const uploaded = res[0]
                                                                setFileUrl(uploaded.ufsUrl)
                                                                setFileName(uploaded.name)
                                                                const ext = uploaded.name.split(".").pop()?.toLowerCase() || "file"
                                                                setFileType(ext)
                                                                setSelectedFile(null)
                                                                setUploadProgress(0)
                                                            } catch (err) {
                                                                setUploadError(err instanceof Error ? err.message : "Upload failed.")
                                                                setSelectedFile(null)
                                                                setUploadProgress(0)
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 w-full max-w-md">
                                                        <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                                                        <div className="min-w-0 flex-1 text-left">
                                                            <p className="text-sm font-medium text-slate-800 truncate">{selectedFile?.name}</p>
                                                        </div>
                                                    </div>
                                                    {isUploading && (
                                                        <div className="w-full max-w-md space-y-2">
                                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                                            </div>
                                                            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                Uploading... {uploadProgress}%
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {uploadError && (
                                                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                                    {uploadError}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">{fileName}</p>
                                                <p className="text-xs text-slate-500 uppercase">{fileType}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                                                        <ExternalLink className="w-3.5 h-3.5" /> View
                                                    </a>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setFileUrl("")
                                                        setFileName("")
                                                        setFileType("")
                                                        if (fileInputRef.current) fileInputRef.current.value = ""
                                                    }}
                                                >
                                                    Replace
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="flex justify-end">
                                    <Button
                                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                                        disabled={!canLock || actionLoading}
                                        onClick={() => setLockConfirmOpen(true)}
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                        Lock Team &amp; Submit Proposal
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        /* Non-leader waiting state */
                        <Card className="shadow-sm border-slate-100">
                            <CardContent className="p-6 text-center space-y-3">
                                <div className="p-3 bg-amber-50 rounded-full inline-block">
                                    <Clock className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-900">Waiting for Team Leader</h3>
                                <p className="text-sm text-slate-500 max-w-md mx-auto">
                                    The team leader will fill in the project details and submit the proposal once the team is ready.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* ════════════════════════════════════════════════════
                STATE 3: Submitted Proposal Cards
            ════════════════════════════════════════════════════ */}
            {myProposals.map((proposal) => (
                <Card key={proposal._id} className="shadow-sm border-slate-100">
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

                        {/* Team Members (for submitted proposals) */}
                        {proposal.teamMembers && proposal.teamMembers.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {proposal.teamMembers.map((m, i) => (
                                    <Badge key={m.userId || i} variant="outline" className="text-xs border-slate-300 gap-1">
                                        <User className="w-3 h-3" />
                                        {m.name}
                                        {m.userId === proposal.leaderId && <Crown className="w-3 h-3 text-amber-500" />}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Edit / Delete actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50"
                                onClick={() => openEdit(proposal)}
                            >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 border-red-300 text-red-700 hover:bg-red-50"
                                onClick={() => { setDeleteTarget(proposal._id); setDeleteOpen(true) }}
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                            </Button>
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
                            {proposal.attachedFileUrl && (
                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attached File</p>
                                    <a
                                        href={proposal.attachedFileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                        {proposal.attachedFileType ? `${proposal.attachedFileType.toUpperCase()} File` : "View Attached File"}
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            )}
                            {proposal.supervisor && (
                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Guide</p>
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
                                                key={remark._id}
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

            {/* ─── Empty State (no team, no proposals) ────────── */}
            {!hasDraftTeam && myProposals.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No proposals yet</p>
                    <p className="text-xs mt-1">Start a project or join a team to get started</p>
                </div>
            )}

            {/* ─── Lock & Submit Confirmation Dialog ──────────── */}
            <Dialog open={lockConfirmOpen} onOpenChange={setLockConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <Lock className="w-5 h-5 text-emerald-600" />
                            Confirm Submission
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-3 space-y-3">
                        <p className="text-sm text-slate-600">
                            This will <strong>lock the team</strong> (no more members can join) and submit the proposal for review. This cannot be undone.
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                            <p className="font-semibold text-sm text-slate-900">{title}</p>
                            <p className="text-xs text-slate-600 line-clamp-3">{description}</p>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Users className="w-3.5 h-3.5" />
                                {team?.teamMembers.length} team member{(team?.teamMembers.length ?? 0) !== 1 ? "s" : ""}
                            </div>
                            {fileUrl && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                    <Paperclip className="w-3.5 h-3.5" />
                                    Attached file: {fileName || "Uploaded file"}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={actionLoading}
                            onClick={handleLockAndSubmit}
                        >
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            Lock &amp; Submit
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
                                Your team&apos;s proposal has been submitted and is awaiting review.
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

            {/* ─── Leave Team Dialog ──────────────────────────── */}
            <Dialog open={leaveOpen} onOpenChange={(open) => { if (!actionLoading) setLeaveOpen(open) }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            {isLeader ? "Disband Team" : "Leave Team"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-3 space-y-3">
                        {isLeader ? (
                            <p className="text-sm text-slate-600">
                                As the team leader, leaving will <strong>disband the entire team</strong> and remove all members. This cannot be undone.
                            </p>
                        ) : (
                            <p className="text-sm text-slate-600">
                                Are you sure you want to leave this team? You can join another team after leaving.
                            </p>
                        )}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild><Button variant="outline" disabled={actionLoading}>Cancel</Button></DialogClose>
                        <Button
                            className="gap-1.5 bg-red-600 hover:bg-red-700 text-white"
                            disabled={actionLoading}
                            onClick={handleLeaveTeam}
                        >
                            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            <LogOut className="w-4 h-4" />
                            {isLeader ? "Disband Team" : "Leave Team"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Edit Proposal Dialog ────────────────────── */}
            <Dialog open={editOpen} onOpenChange={(open) => { if (!editSaving) setEditOpen(open) }}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <Edit3 className="w-5 h-5 text-blue-600" />
                            Edit Proposal
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="font-semibold text-sm text-slate-700">Project Title</Label>
                            <Input className="bg-white" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-sm text-slate-700">Project Description</Label>
                            <textarea
                                rows={5}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild><Button variant="outline" disabled={editSaving}>Cancel</Button></DialogClose>
                        <Button className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white" disabled={editSaving || !editTitle.trim() || editDescription.trim().length < 20} onClick={handleEditSave}>
                            {editSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                            <CheckCircle2 className="w-4 h-4" /> Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Delete Proposal Dialog ─────────────────────── */}
            <Dialog open={deleteOpen} onOpenChange={(open) => { if (!deleteDeleting) setDeleteOpen(open) }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Delete Proposal
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-3 space-y-3">
                        <p className="text-sm text-slate-600">Are you sure you want to delete this proposal? This action cannot be undone.</p>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild><Button variant="outline" disabled={deleteDeleting}>Cancel</Button></DialogClose>
                        <Button className="gap-1.5 bg-red-600 hover:bg-red-700 text-white" disabled={deleteDeleting} onClick={handleDelete}>
                            {deleteDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                            <Trash2 className="w-4 h-4" /> Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
