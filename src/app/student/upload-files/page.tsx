"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    FileText,
    Presentation,
    FileCode,
    Upload,
    CheckCircle2,
    Trash2,
    AlertTriangle,
    FilePlus2,
    ExternalLink,
    Loader2,
    Download,
    CloudUpload,
    X,
    Link2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useUploadThing } from "@/lib/uploadthing"

// ─── Types ──────────────────────────────────────────────────────────
type FileCategory = "report" | "presentation" | "code"

interface UploadedFile {
    _id: string
    fileName: string
    fileUrl: string
    category: FileCategory
    fileSize: string
    uploadDate: string
}

// ─── Config ─────────────────────────────────────────────────────────
const categoryConfig: Record<FileCategory, {
    label: string
    icon: React.ReactNode
    color: string
    bgColor: string
}> = {
    report: {
        label: "Report",
        icon: <FileText className="w-5 h-5" />,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
    },
    presentation: {
        label: "Presentation",
        icon: <Presentation className="w-5 h-5" />,
        color: "text-orange-500",
        bgColor: "bg-orange-50",
    },
    code: {
        label: "Code Files",
        icon: <FileCode className="w-5 h-5" />,
        color: "text-cyan-500",
        bgColor: "bg-cyan-50",
    },
}

function getCategoryBadge(cat: FileCategory) {
    switch (cat) {
        case "report": return "border-blue-200 bg-blue-50 text-blue-700"
        case "presentation": return "border-orange-200 bg-orange-50 text-orange-700"
        case "code": return "border-cyan-200 bg-cyan-50 text-cyan-700"
    }
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

const ACCEPTED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-rar-compressed",
    "application/gzip",
].join(",")

// ─── Page ───────────────────────────────────────────────────────────
export default function UploadFilesPage() {
    const { user } = useAuth()
    const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([])
    const [loading, setLoading] = React.useState(true)
    const [category, setCategory] = React.useState<FileCategory>("report")
    const [successOpen, setSuccessOpen] = React.useState(false)
    const [deleteOpen, setDeleteOpen] = React.useState(false)
    const [deleteTarget, setDeleteTarget] = React.useState<UploadedFile | null>(null)
    const [deleting, setDeleting] = React.useState(false)

    // Custom upload state
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = React.useState(0)
    const [uploadError, setUploadError] = React.useState("")
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Link submission state
    const [linkUrl, setLinkUrl] = React.useState("")
    const [linkType, setLinkType] = React.useState<"github" | "drive" | "figma" | "other">("github")
    const [submittingLink, setSubmittingLink] = React.useState(false)

    const { startUpload, isUploading } = useUploadThing("projectFile", {
        onUploadProgress: (p) => setUploadProgress(p),
        onUploadError: (err) => {
            setUploadError(err.message)
            setSelectedFile(null)
            setUploadProgress(0)
        },
    })

    // ── Fetch files from MongoDB ────────────────────────────────────
    const fetchFiles = React.useCallback(async () => {
        if (!user?.email) return
        try {
            const res = await fetch(`/api/files?email=${encodeURIComponent(user.email)}`)
            if (!res.ok) return
            const data = await res.json()
            setUploadedFiles(
                data.map((f: Record<string, unknown>) => ({
                    _id: String(f._id),
                    fileName: String(f.fileName),
                    fileUrl: String(f.fileUrl),
                    category: String(f.category) as FileCategory,
                    fileSize: String(f.fileSize ?? ""),
                    uploadDate: new Date(f.createdAt as string).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                    }),
                }))
            )
        } finally {
            setLoading(false)
        }
    }, [user?.email])

    React.useEffect(() => {
        fetchFiles()
    }, [fetchFiles])

    // ── Handle file selection ───────────────────────────────────────
    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setSelectedFile(file)
        setUploadError("")
        setUploadProgress(0)
    }

    // ── Handle upload ───────────────────────────────────────────────
    async function handleUpload() {
        if (!selectedFile || !user) return
        setUploadError("")
        setUploadProgress(0)

        try {
            const res = await startUpload([selectedFile])
            if (!res?.[0]) {
                setUploadError("Upload failed. Please try again.")
                return
            }
            const uploaded = res[0]

            // Save to MongoDB
            await fetch("/api/files", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: uploaded.name,
                    fileUrl: uploaded.ufsUrl,
                    category,
                    fileSize: formatFileSize(uploaded.size),
                    studentId: user.id,
                    studentName: user.name,
                    studentEmail: user.email,
                }),
            })

            setSelectedFile(null)
            setUploadProgress(0)
            if (fileInputRef.current) fileInputRef.current.value = ""
            fetchFiles()
            setSuccessOpen(true)
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.")
        }
    }

    function clearSelectedFile() {
        setSelectedFile(null)
        setUploadProgress(0)
        setUploadError("")
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    // ── Handle link submission ───────────────────────────────────────
    async function handleLinkSubmit() {
        if (!linkUrl.trim() || !user) return
        setUploadError("")
        setSubmittingLink(true)

        try {
            const linkTypeLabels: Record<string, string> = { github: "GitHub", drive: "Google Drive", figma: "Figma", other: "Link" }
            const res = await fetch("/api/files", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: `${linkTypeLabels[linkType]} - ${linkUrl.trim().slice(0, 60)}`,
                    fileUrl: linkUrl.trim(),
                    category,
                    fileSize: linkTypeLabels[linkType],
                    studentId: user.id,
                    studentName: user.name,
                    studentEmail: user.email,
                }),
            })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                setUploadError(err.error ?? "Failed to save link.")
                return
            }
            setLinkUrl("")
            setLinkType("github")
            fetchFiles()
            setSuccessOpen(true)
        } catch {
            setUploadError("Network error. Please try again.")
        } finally {
            setSubmittingLink(false)
        }
    }

    // ── Delete ──────────────────────────────────────────────────────
    function openDelete(file: UploadedFile) {
        setDeleteTarget(file)
        setDeleteOpen(true)
    }

    async function handleDelete() {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/files/${deleteTarget._id}`, { method: "DELETE" })
            if (res.ok) {
                setUploadedFiles((prev) => prev.filter((f) => f._id !== deleteTarget._id))
            }
        } finally {
            setDeleting(false)
            setDeleteOpen(false)
            setDeleteTarget(null)
        }
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
            {/* ─── Header ─────────────────────────────────────── */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-100 shadow-sm">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    Upload Project Files
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Upload your project documents including reports, presentations, and code files — or submit a link.
                </p>
            </div>

            {/* ─── Upload Area ─────────────────────────────────── */}
            <Card className="shadow-sm border-slate-100">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    {/* Category selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <label className="text-sm font-medium text-slate-700">File Category</label>
                        <Select value={category} onValueChange={(v) => setCategory(v as FileCategory)}>
                            <SelectTrigger className="w-full sm:w-48 bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="report">Report (PDF, DOC)</SelectItem>
                                <SelectItem value="presentation">Presentation (PPT)</SelectItem>
                                <SelectItem value="code">Code (ZIP, RAR)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Side-by-side: File Upload | Link Submit */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* ── File Upload Panel ── */}
                        <div className="border border-slate-200 rounded-xl p-4 sm:p-6 space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <CloudUpload className="w-4 h-4 text-blue-500" />
                                Upload File
                            </div>

                            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 sm:p-6 transition-colors text-center">
                                {!selectedFile && !isUploading ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 bg-blue-50 rounded-full">
                                            <CloudUpload className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm font-medium text-slate-700">Choose a file</p>
                                            <p className="text-xs text-slate-400 mt-1">PDF, DOC, PPT, ZIP &middot; Max 32MB</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50 text-xs"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            Browse Files
                                        </Button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept={ACCEPTED_TYPES}
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-full">
                                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                            <div className="min-w-0 flex-1 text-left">
                                                <p className="text-xs font-medium text-slate-800 truncate">{selectedFile?.name}</p>
                                                <p className="text-xs text-slate-500">{selectedFile ? formatFileSize(selectedFile.size) : ""}</p>
                                            </div>
                                            {!isUploading && (
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-red-500" onClick={clearSelectedFile}>
                                                    <X className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>

                                        {isUploading && (
                                            <div className="w-full space-y-1.5">
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                                </div>
                                                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    Uploading... {uploadProgress}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Button
                                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                                onClick={handleUpload}
                                disabled={!selectedFile || isUploading || submittingLink}
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                Upload File
                            </Button>
                        </div>

                        {/* ── Link Submission Panel ── */}
                        <div className="border border-slate-200 rounded-xl p-4 sm:p-6 space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Link2 className="w-4 h-4 text-emerald-500" />
                                Submit Link
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-600">Link Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(["github", "drive", "figma", "other"] as const).map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setLinkType(t)}
                                                className={`text-xs py-1.5 px-2 rounded-lg border transition-all capitalize ${
                                                    linkType === t
                                                        ? "border-emerald-400 bg-emerald-50 text-emerald-700 font-medium"
                                                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                                                }`}
                                            >
                                                {t === "drive" ? "Google Drive" : t === "github" ? "GitHub" : t === "figma" ? "Figma" : "Other"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-600">URL</label>
                                    <input
                                        type="url"
                                        value={linkUrl}
                                        onChange={(e) => { setLinkUrl(e.target.value); setUploadError("") }}
                                        placeholder="https://github.com/user/repo"
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleLinkSubmit}
                                disabled={!linkUrl.trim() || submittingLink || isUploading}
                                variant="outline"
                                className="w-full gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs sm:text-sm"
                            >
                                {submittingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                                Submit Link
                            </Button>
                        </div>
                    </div>

                    {/* Error display */}
                    {uploadError && (
                        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {uploadError}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ─── Uploaded Files ──────────────────────────────── */}
            <Card className="shadow-sm border-slate-100 mb-8">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-bold text-base sm:text-lg text-slate-900">Uploaded Files</h2>
                            <p className="text-xs sm:text-sm text-slate-500">Manage your uploaded project files</p>
                        </div>
                        {uploadedFiles.length > 0 && (
                            <Badge variant="outline" className="text-xs font-semibold border-slate-300">
                                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""}
                            </Badge>
                        )}
                    </div>

                    <Separator className="mb-5" />

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : uploadedFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <FilePlus2 className="w-12 h-12 mb-3 text-slate-300" />
                            <p className="font-medium text-lg text-slate-500">No files uploaded yet</p>
                            <p className="text-sm mt-1">Upload your project documents above to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {uploadedFiles.map((file) => (
                                <div
                                    key={file._id}
                                    className="flex items-center justify-between gap-3 p-4 rounded-lg border border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/20 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className={`p-2 rounded-lg ${categoryConfig[file.category].bgColor} group-hover:bg-blue-50 transition-colors shrink-0 ${categoryConfig[file.category].color}`}>
                                            {categoryConfig[file.category].icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-slate-800 truncate">{file.fileName}</p>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs font-semibold ${getCategoryBadge(file.category)}`}
                                                >
                                                    {categoryConfig[file.category].label}
                                                </Badge>
                                                <span className="text-xs text-slate-400">{file.fileSize}</span>
                                                <span className="text-xs text-slate-400 hidden sm:inline">
                                                    · {file.uploadDate}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-100"
                                            title="Download"
                                            asChild
                                        >
                                            <a href={file.fileUrl} download>
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                                            title="View"
                                            asChild
                                        >
                                            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-100"
                                            title="Delete"
                                            onClick={() => openDelete(file)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ─── Success Dialog ─────────────────────────────── */}
            <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
                <DialogContent className="sm:max-w-sm text-center">
                    <div className="flex flex-col items-center gap-4 py-6">
                        <div className="p-3 bg-emerald-100 rounded-full">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">File Uploaded!</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Your file has been uploaded and saved successfully.
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

            {/* ─── Delete Confirmation ─────────────────────────── */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Delete File
                        </DialogTitle>
                    </DialogHeader>
                    {deleteTarget && (
                        <div className="py-3 space-y-3">
                            <p className="text-sm text-slate-600">
                                Are you sure you want to delete this file?
                            </p>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-3">
                                <span className={categoryConfig[deleteTarget.category].color}>
                                    {categoryConfig[deleteTarget.category].icon}
                                </span>
                                <div className="min-w-0">
                                    <p className="font-medium text-sm text-slate-800 truncate">{deleteTarget.fileName}</p>
                                    <p className="text-xs text-slate-500">{deleteTarget.fileSize}</p>
                                </div>
                            </div>
                            <p className="text-xs text-red-500 font-medium">This action cannot be undone.</p>
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            className="gap-1.5 bg-red-600 hover:bg-red-700 text-white"
                            disabled={deleting}
                            onClick={handleDelete}
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
