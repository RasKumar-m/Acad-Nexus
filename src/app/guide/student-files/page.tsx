"use client"

import * as React from "react"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
    ExternalLink,
    Search,
    AlertTriangle,
    FileText,
    FileCode,
    LayoutGrid,
    List,
    Presentation,
    Loader2,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────
type FileCategory = "report" | "presentation" | "code"

interface StudentFileItem {
    _id: string
    fileName: string
    studentName: string
    category: FileCategory
    uploadDate: string
    url: string
}

// ─── Helpers ────────────────────────────────────────────────────────
function getFileExtension(name: string): string {
    const parts = name.split(".")
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "FILE"
}

function getFileIconColor(fileName: string): string {
    const ext = getFileExtension(fileName).toLowerCase()
    switch (ext) {
        case "pdf": return "text-red-500"
        case "docx": case "doc": return "text-blue-600"
        case "pptx": case "ppt": return "text-orange-500"
        case "zip": case "rar": case "gz": case "7z": return "text-purple-600"
        default: return "text-slate-400"
    }
}

function getFileIcon(fileName: string, size: "sm" | "lg" = "sm") {
    const ext = getFileExtension(fileName).toLowerCase()
    const cls = size === "lg" ? "w-8 h-8" : "w-5 h-5"
    switch (ext) {
        case "pdf": case "docx": case "doc": return <FileText className={cls} />
        case "pptx": case "ppt": return <Presentation className={cls} />
        case "zip": case "rar": case "gz": case "7z": return <FileCode className={cls} />
        default: return <FileText className={cls} />
    }
}

// ─── Metric Card Config ─────────────────────────────────────────────
interface MetricConfig {
    label: string
    borderColor: string
    textColor: string
    bgColor: string
}

const metricCards: MetricConfig[] = [
    { label: "Total Files", borderColor: "border-l-blue-500", textColor: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "Reports", borderColor: "border-l-green-500", textColor: "text-green-600", bgColor: "bg-green-50" },
    { label: "Presentations", borderColor: "border-l-orange-500", textColor: "text-orange-600", bgColor: "bg-orange-50" },
    { label: "Code Files", borderColor: "border-l-purple-500", textColor: "text-purple-600", bgColor: "bg-purple-50" },
]

// ─── Page ───────────────────────────────────────────────────────────
export default function StudentFilesPage() {
    const [allFiles, setAllFiles] = React.useState<StudentFileItem[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterType, setFilterType] = React.useState("all")
    const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")

    // ── Fetch all files from MongoDB ────────────────────────────────
    React.useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/files")
                if (!res.ok) return
                const data = await res.json()
                setAllFiles(
                    data.map((f: Record<string, unknown>) => ({
                        _id: String(f._id),
                        fileName: String(f.fileName),
                        studentName: String(f.studentName),
                        category: String(f.category) as FileCategory,
                        uploadDate: new Date(f.createdAt as string).toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                        }),
                        url: String(f.fileUrl),
                    }))
                )
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Filtering
    const filtered = allFiles.filter((f) => {
        const q = searchQuery.toLowerCase()
        const matchSearch =
            f.fileName.toLowerCase().includes(q) ||
            f.studentName.toLowerCase().includes(q)
        if (!matchSearch) return false
        if (filterType === "all") return true
        return f.category === filterType
    })

    // Metrics
    const totalCount = filtered.length
    const reportCount = filtered.filter((f) => f.category === "report").length
    const presentationCount = filtered.filter((f) => f.category === "presentation").length
    const codeCount = filtered.filter((f) => f.category === "code").length
    const metricValues = [totalCount, reportCount, presentationCount, codeCount]

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* ─── Header ─────────────────────────────────────── */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Student Files
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        View and download files uploaded by students
                    </p>
                </div>
            </div>

            {/* ─── Filter Row ─────────────────────────────────── */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Type Filter */}
                    <div className="w-full sm:w-44">
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="All Files" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Files</SelectItem>
                                <SelectItem value="report">Reports</SelectItem>
                                <SelectItem value="presentation">Presentations</SelectItem>
                                <SelectItem value="code">Code Files</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search files..."
                            className="pl-9 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Spacer */}
                    <div className="hidden sm:block flex-1" />

                    {/* View Toggle */}
                    <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 rounded-md transition-colors ${viewMode === "grid" ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
                            onClick={() => setViewMode("grid")}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 rounded-md transition-colors ${viewMode === "list" ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
                            onClick={() => setViewMode("list")}
                            title="List View"
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* ─── Metric Cards ───────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {metricCards.map((mc, idx) => (
                    <Card
                        key={mc.label}
                        className={`shadow-sm border-slate-100 border-l-4 ${mc.borderColor} ${mc.bgColor}`}
                    >
                        <CardContent className="p-4">
                            <p className={`text-xs font-semibold ${mc.textColor}`}>
                                {mc.label}
                            </p>
                            <h3 className="font-bold text-2xl text-slate-900 mt-1">
                                {metricValues[idx]}
                            </h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ─── Content Area ────────────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-16 flex flex-col items-center gap-3 text-slate-400">
                    <AlertTriangle className="w-10 h-10" />
                    <p className="font-semibold text-lg">No files found</p>
                    <p className="text-sm">Try adjusting your search or filter criteria.</p>
                </div>
            ) : viewMode === "grid" ? (
                /* ─── Grid View ──────────────────────────────── */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                    {filtered.map((file) => {
                        const iconColor = getFileIconColor(file.fileName)
                        const icon = getFileIcon(file.fileName, "lg")

                        return (
                            <Card
                                key={file._id}
                                className="shadow-sm border-slate-100 hover:shadow-md transition-shadow"
                            >
                                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                                    <div className={`${iconColor} mt-2`}>{icon}</div>
                                    <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 leading-snug min-h-10">
                                        {file.fileName}
                                    </h3>
                                    <p className="text-xs text-slate-500">{file.studentName}</p>
                                    <p className="text-xs text-slate-400">{file.uploadDate}</p>
                                    <Button
                                        className="w-full mt-2 gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                                        asChild
                                    >
                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-4 h-4" />
                                            View File
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                /* ─── List View ──────────────────────────────── */
                <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">
                                        File Name
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">
                                        Student
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider hidden sm:table-cell">
                                        Type
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider hidden md:table-cell">
                                        Upload Date
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider text-center">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((file) => {
                                    const iconColor = getFileIconColor(file.fileName)
                                    const icon = getFileIcon(file.fileName, "sm")
                                    const ext = getFileExtension(file.fileName)

                                    return (
                                        <TableRow key={file._id} className="hover:bg-slate-50 border-slate-100">
                                            <TableCell className="py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <span className={`${iconColor} shrink-0`}>{icon}</span>
                                                    <span className="text-sm font-medium text-slate-800 truncate max-w-xs">
                                                        {file.fileName}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3.5">
                                                <span className="text-sm text-slate-700">{file.studentName}</span>
                                            </TableCell>
                                            <TableCell className="py-3.5 hidden sm:table-cell">
                                                <span className="text-sm text-slate-600 font-medium">{ext}</span>
                                            </TableCell>
                                            <TableCell className="py-3.5 hidden md:table-cell">
                                                <span className="text-sm text-slate-600">{file.uploadDate}</span>
                                            </TableCell>
                                            <TableCell className="py-3.5 text-center">
                                                <Button
                                                    size="sm"
                                                    className="h-8 gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4"
                                                    asChild
                                                >
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        View
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    )
}
