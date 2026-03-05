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
    FileText,
    Presentation,
    FileCode,
    Upload,
    CheckCircle2,
    Trash2,
    AlertTriangle,
    FilePlus2,
    Download,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────
type FileCategory = "report" | "presentation" | "code"

interface UploadedFile {
    id: number
    name: string
    category: FileCategory
    size: string
    uploadDate: string
}

// ─── Config ─────────────────────────────────────────────────────────
const categoryConfig: Record<FileCategory, {
    label: string
    description: string
    formats: string
    icon: React.ReactNode
    color: string
    bgColor: string
    borderColor: string
}> = {
    report: {
        label: "Report",
        description: "Upload your project report (PDF, DOC)",
        formats: ".pdf,.doc,.docx",
        icon: <FileText className="w-10 h-10" />,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200 hover:border-blue-400",
    },
    presentation: {
        label: "Presentation",
        description: "Upload your presentation (PPT, PPTX, PDF)",
        formats: ".ppt,.pptx,.pdf",
        icon: <Presentation className="w-10 h-10" />,
        color: "text-slate-500",
        bgColor: "bg-slate-50",
        borderColor: "border-slate-200 hover:border-slate-400",
    },
    code: {
        label: "Code Files",
        description: "Upload your source code (ZIP, RAR, TAR)",
        formats: ".zip,.rar,.tar,.gz,.7z",
        icon: <FileCode className="w-10 h-10" />,
        color: "text-cyan-500",
        bgColor: "bg-cyan-50",
        borderColor: "border-cyan-200 hover:border-cyan-400",
    },
}

// ─── Page ───────────────────────────────────────────────────────────
export default function UploadFilesPage() {
    const [selectedFiles, setSelectedFiles] = React.useState<Record<FileCategory, File | null>>({
        report: null,
        presentation: null,
        code: null,
    })
    const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([])
    const [successOpen, setSuccessOpen] = React.useState(false)
    const [deleteOpen, setDeleteOpen] = React.useState(false)
    const [deleteTarget, setDeleteTarget] = React.useState<UploadedFile | null>(null)

    const fileInputRefs: Record<FileCategory, React.RefObject<HTMLInputElement | null>> = {
        report: React.useRef<HTMLInputElement>(null),
        presentation: React.useRef<HTMLInputElement>(null),
        code: React.useRef<HTMLInputElement>(null),
    }

    const hasSelectedFiles = Object.values(selectedFiles).some((f) => f !== null)

    function handleFileSelect(category: FileCategory, e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null
        setSelectedFiles((prev) => ({ ...prev, [category]: file }))
    }

    function formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + " B"
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
        return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    }

    function handleUpload() {
        const newFiles: UploadedFile[] = []
        const categories: FileCategory[] = ["report", "presentation", "code"]
        categories.forEach((cat) => {
            const file = selectedFiles[cat]
            if (file) {
                newFiles.push({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    category: cat,
                    size: formatFileSize(file.size),
                    uploadDate: new Date().toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                    }),
                })
            }
        })
        setUploadedFiles((prev) => [...newFiles, ...prev])
        setSelectedFiles({ report: null, presentation: null, code: null })
        // Reset file inputs
        Object.values(fileInputRefs).forEach((ref) => {
            if (ref.current) ref.current.value = ""
        })
        setSuccessOpen(true)
    }

    function openDelete(file: UploadedFile) {
        setDeleteTarget(file)
        setDeleteOpen(true)
    }

    function handleDelete() {
        if (!deleteTarget) return
        setUploadedFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id))
        setDeleteOpen(false)
        setDeleteTarget(null)
    }

    function getCategoryIcon(cat: FileCategory) {
        switch (cat) {
            case "report": return <FileText className="w-5 h-5 text-blue-500" />
            case "presentation": return <Presentation className="w-5 h-5 text-orange-500" />
            case "code": return <FileCode className="w-5 h-5 text-cyan-500" />
        }
    }

    function getCategoryBadge(cat: FileCategory) {
        switch (cat) {
            case "report": return "border-blue-200 bg-blue-50 text-blue-700"
            case "presentation": return "border-orange-200 bg-orange-50 text-orange-700"
            case "code": return "border-cyan-200 bg-cyan-50 text-cyan-700"
        }
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
            {/* ─── Header ─────────────────────────────────────── */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Upload Project Files
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Upload your project documents including reports, presentations, and code files.
                </p>
            </div>

            {/* ─── Upload Cards ────────────────────────────────── */}
            <Card className="shadow-sm border-slate-100">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(Object.keys(categoryConfig) as FileCategory[]).map((cat) => {
                            const cfg = categoryConfig[cat]
                            const file = selectedFiles[cat]

                            return (
                                <div
                                    key={cat}
                                    className={`relative rounded-xl border-2 border-dashed p-6 flex flex-col items-center text-center gap-3 transition-colors cursor-pointer ${cfg.borderColor} ${file ? cfg.bgColor : "bg-white"}`}
                                    onClick={() => fileInputRefs[cat].current?.click()}
                                >
                                    <input
                                        ref={fileInputRefs[cat]}
                                        type="file"
                                        accept={cfg.formats}
                                        className="hidden"
                                        onChange={(e) => handleFileSelect(cat, e)}
                                    />

                                    <div className={cfg.color}>
                                        {cfg.icon}
                                    </div>

                                    <h3 className="font-semibold text-sm text-slate-900">
                                        {cfg.label}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {cfg.description}
                                    </p>

                                    {file ? (
                                        <div className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 mt-1">
                                            <p className="text-xs font-medium text-slate-800 truncate">{file.name}</p>
                                            <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-1 gap-1.5 border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                fileInputRefs[cat].current?.click()
                                            }}
                                        >
                                            Choose File
                                        </Button>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Upload Button */}
                    <div className="flex justify-end mt-6">
                        <Button
                            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6"
                            disabled={!hasSelectedFiles}
                            onClick={handleUpload}
                        >
                            <Upload className="w-4 h-4" />
                            Upload Selected Files
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ─── Uploaded Files ──────────────────────────────── */}
            <Card className="shadow-sm border-slate-100 mb-8">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-bold text-lg text-slate-900">Uploaded Files</h2>
                            <p className="text-sm text-slate-500">Manage your uploaded project files</p>
                        </div>
                        {uploadedFiles.length > 0 && (
                            <Badge variant="outline" className="text-xs font-semibold border-slate-300">
                                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""}
                            </Badge>
                        )}
                    </div>

                    <Separator className="mb-5" />

                    {uploadedFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <FilePlus2 className="w-12 h-12 mb-3 text-slate-300" />
                            <p className="font-medium text-lg text-slate-500">No files uploaded yet</p>
                            <p className="text-sm mt-1">Upload your project documents above to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {uploadedFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between gap-3 p-4 rounded-lg border border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/20 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-blue-50 transition-colors shrink-0">
                                            {getCategoryIcon(file.category)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs font-semibold ${getCategoryBadge(file.category)}`}
                                                >
                                                    {categoryConfig[file.category].label}
                                                </Badge>
                                                <span className="text-xs text-slate-400">{file.size}</span>
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
                                            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" />
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
                            <h3 className="font-bold text-lg text-slate-900">Files Uploaded!</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Your files have been uploaded successfully.
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
                                {getCategoryIcon(deleteTarget.category)}
                                <div className="min-w-0">
                                    <p className="font-medium text-sm text-slate-800 truncate">{deleteTarget.name}</p>
                                    <p className="text-xs text-slate-500">{deleteTarget.size}</p>
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
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
