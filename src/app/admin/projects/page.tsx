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
} from "lucide-react"

// ─── Mock Data ──────────────────────────────────────────────────────
type ProjectStatus = "pending" | "approved" | "completed" | "rejected"

interface ProjectFile {
    name: string
    url: string
}

interface Project {
    id: number
    title: string
    description: string
    student: string
    studentEmail: string
    lastUpdate: string
    supervisor: string | null
    deadline: string | null
    status: ProjectStatus
    files: ProjectFile[]
}

const projectsData: Project[] = [
    {
        id: 1,
        title: "Smart Deadline & Project Tracking System",
        description:
            "This project is a web-based system designed to help universities manage student projects and their deadlines efficiently. Supervisors can assign deadlines to approved projects, while students can easily view their project status and submission dates. The system provides real-time updates, role-based access, and a clear overview of project progress, making project management simple, transparent, and organized.",
        student: "Ahmed Saeed",
        studentEmail: "ahmed.saeed.student.edu@gmail.com",
        lastUpdate: "1/9/2026",
        supervisor: null,
        deadline: null,
        status: "pending",
        files: [{ name: "Zeeshan Khan (1).docx", url: "#" }],
    },
    {
        id: 2,
        title: "Online Examination & Result Portal",
        description:
            "Hello World. A comprehensive portal for conducting online exams and managing student results efficiently with real-time grading, analytics and reporting capabilities.",
        student: "Muhammad Zeeshan",
        studentEmail: "zeeshan.khan@student.edu",
        lastUpdate: "1/9/2026",
        supervisor: "Ms. Ayesha Malik",
        deadline: "2026-03-10",
        status: "approved",
        files: [{ name: "Proposal_OEP.pdf", url: "#" }],
    },
    {
        id: 3,
        title: "Crime Reporting & Analysis Web App",
        description:
            "Hello World. A web application for reporting crimes and analyzing crime data to assist law enforcement agencies with pattern detection and resource allocation.",
        student: "Areeba Fatima",
        studentEmail: "areeba.fatima@student.edu",
        lastUpdate: "1/9/2026",
        supervisor: "Dr. Ahmed Raza",
        deadline: "2020-01-20",
        status: "approved",
        files: [{ name: "Crime_App_Spec.pdf", url: "#" }],
    },
    {
        id: 4,
        title: "Inventory Management System for SMEs",
        description:
            "Hello Sir this is a great project. An inventory management platform tailored for small & medium enterprises to track stock levels, manage orders and generate automated reports.",
        student: "Maryam Iqbal",
        studentEmail: "maryam.iqbal@student.edu",
        lastUpdate: "1/9/2026",
        supervisor: "Ms. Ayesha Malik",
        deadline: "2029-10-10",
        status: "approved",
        files: [{ name: "IMS_Requirements.docx", url: "#" }],
    },
    {
        id: 5,
        title: "E-Learning Management System (LMS)",
        description:
            "This project is an online learning platform designed to facilitate course management, student assessments, progress tracking and analytics for educational institutions.",
        student: "Hira Aslam",
        studentEmail: "hira.aslam@student.edu",
        lastUpdate: "1/9/2026",
        supervisor: "Dr. Ahmed Raza",
        deadline: "2050-10-10",
        status: "approved",
        files: [{ name: "LMS_Proposal.pdf", url: "#" }],
    },
    {
        id: 6,
        title: "Online Auction Management Platform",
        description:
            "This project is a web-based online auction system that enables users to list items, place bids in real-time and manage auction events with a transparent and secure bidding mechanism.",
        student: "Laiba Noor",
        studentEmail: "laiba.noor@student.edu",
        lastUpdate: "1/8/2026",
        supervisor: "Dr. Ahmed Raza",
        deadline: "2029-10-10",
        status: "completed",
        files: [{ name: "Auction_Final.pdf", url: "#" }],
    },
]

const supervisorsList = [
    "Dr. Ahmed Raza",
    "Ms. Ayesha Malik",
    "Dr. Aneela",
    "Dr. Usman Ali",
    "Mr. Bilal Hussain",
]

// ─── Helpers ────────────────────────────────────────────────────────
function statusBadge(status: ProjectStatus) {
    switch (status) {
        case "pending":
            return (
                <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold"
                >
                    Pending
                </Badge>
            )
        case "approved":
            return (
                <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold"
                >
                    Approved
                </Badge>
            )
        case "completed":
            return (
                <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold"
                >
                    Completed
                </Badge>
            )
        case "rejected":
            return (
                <Badge
                    variant="outline"
                    className="border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold"
                >
                    Rejected
                </Badge>
            )
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
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterStatus, setFilterStatus] = React.useState("all")
    const [filterSupervisor, setFilterSupervisor] = React.useState("all")

    // View dialog
    const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
    const [selectedProject, setSelectedProject] = React.useState<Project | null>(null)

    // Local project state (to allow approve/reject)
    const [projects, setProjects] = React.useState<Project[]>(projectsData)

    // Computed metrics
    const totalProjects = projects.length
    const approvedCount = projects.filter((p) => p.status === "approved").length
    const pendingCount = projects.filter((p) => p.status === "pending").length
    const completedCount = projects.filter((p) => p.status === "completed").length

    // Filtering
    const filteredProjects = projects.filter((p) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch =
            p.title.toLowerCase().includes(q) ||
            p.student.toLowerCase().includes(q) ||
            p.studentEmail.toLowerCase().includes(q)
        if (!matchesSearch) return false

        if (filterStatus !== "all" && p.status !== filterStatus) return false

        if (filterSupervisor !== "all") {
            if (!p.supervisor) return false
            if (p.supervisor !== filterSupervisor) return false
        }

        return true
    })

    function handleView(project: Project) {
        setSelectedProject(project)
        setViewDialogOpen(true)
    }

    function handleApprove(id: number) {
        setProjects((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: "approved" as ProjectStatus } : p))
        )
    }

    function handleReject(id: number) {
        setProjects((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: "rejected" as ProjectStatus } : p))
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Projects
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        View, approve, and manage all student projects
                    </p>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                            <FolderKanban className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium truncate">
                                Total Projects
                            </p>
                            <h3 className="font-bold text-xl text-slate-900">
                                {totalProjects}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium truncate">
                                Approved
                            </p>
                            <h3 className="font-bold text-xl text-slate-900">
                                {approvedCount}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium truncate">
                                Pending
                            </p>
                            <h3 className="font-bold text-xl text-slate-900">
                                {pendingCount}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium truncate">
                                Completed
                            </p>
                            <h3 className="font-bold text-xl text-slate-900">
                                {completedCount}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mb-8">
                {/* Search & Filters */}
                <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-end bg-slate-50/50">
                    <div className="w-full lg:flex-1 lg:max-w-md space-y-1.5">
                        <Label
                            htmlFor="search-projects"
                            className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                            Search Projects
                        </Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                id="search-projects"
                                placeholder="Search by project title or student name..."
                                className="pl-9 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="w-full sm:w-48 space-y-1.5">
                            <Label
                                htmlFor="filter-project-status"
                                className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                            >
                                Filter by Status
                            </Label>
                            <Select
                                value={filterStatus}
                                onValueChange={setFilterStatus}
                            >
                                <SelectTrigger
                                    id="filter-project-status"
                                    className="bg-white"
                                >
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full sm:w-48 space-y-1.5">
                            <Label
                                htmlFor="filter-supervisor"
                                className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                            >
                                Filter Supervisor
                            </Label>
                            <Select
                                value={filterSupervisor}
                                onValueChange={setFilterSupervisor}
                            >
                                <SelectTrigger
                                    id="filter-supervisor"
                                    className="bg-white"
                                >
                                    <SelectValue placeholder="All Supervisors" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Supervisors</SelectItem>
                                    {supervisorsList.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="p-0">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-slate-800">
                            Projects Overview
                        </h2>
                        <span className="text-xs text-slate-400 font-medium">
                            {filteredProjects.length} project
                            {filteredProjects.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="min-w-55 text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">
                                        Project Details
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">
                                        Student
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider hidden md:table-cell">
                                        Supervisor
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider hidden lg:table-cell">
                                        Deadline
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider min-w-40">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProjects.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-32 text-center text-slate-400"
                                        >
                                            No projects found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProjects.map((project) => (
                                        <TableRow
                                            key={project.id}
                                            className="hover:bg-slate-50 border-slate-100"
                                        >
                                            {/* Project Details */}
                                            <TableCell className="py-3.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-semibold text-sm text-slate-900 leading-snug">
                                                        {project.title}
                                                    </span>
                                                    <span className="text-xs text-slate-500 line-clamp-1">
                                                        {truncateText(project.description, 45)}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 mt-0.5">
                                                        Due: {project.deadline ?? "—"}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Student */}
                                            <TableCell className="py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-slate-800 font-medium">
                                                        {project.student}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400">
                                                        Last Update: {project.lastUpdate}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Supervisor */}
                                            <TableCell className="py-3.5 hidden md:table-cell">
                                                {project.supervisor ? (
                                                    <span className="text-sm font-medium text-emerald-700">
                                                        {project.supervisor}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Deadline */}
                                            <TableCell className="py-3.5 hidden lg:table-cell">
                                                <span className="text-sm text-slate-700">
                                                    {formatDeadline(project.deadline)}
                                                </span>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="py-3.5">
                                                {statusBadge(project.status)}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                                    <Button
                                                        size="sm"
                                                        className="h-8 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold gap-1 px-3"
                                                        onClick={() => handleView(project)}
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        View
                                                    </Button>
                                                    {project.status === "pending" && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold gap-1 px-3"
                                                                onClick={() => handleApprove(project.id)}
                                                            >
                                                                <ThumbsUp className="w-3.5 h-3.5" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold gap-1 px-3"
                                                                onClick={() => handleReject(project.id)}
                                                            >
                                                                <ThumbsDown className="w-3.5 h-3.5" />
                                                                Reject
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

            {/* ─── Project Details Dialog ──────────────────────── */}
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
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Title
                                </Label>
                                <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                                    <p className="text-sm font-medium text-slate-800">
                                        {selectedProject.title}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Description
                                </Label>
                                <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 max-h-40 overflow-y-auto">
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {selectedProject.description}
                                    </p>
                                </div>
                            </div>

                            {/* Student & Supervisor row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Student
                                    </Label>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                                        <p className="text-sm text-slate-800">
                                            {selectedProject.student}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Supervisor
                                    </Label>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                                        <p className="text-sm text-slate-800">
                                            {selectedProject.supervisor ?? "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Deadline row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Status
                                    </Label>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                                        <p className="text-sm text-slate-800 capitalize">
                                            {selectedProject.status}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Deadline
                                    </Label>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
                                        <p className="text-sm text-slate-800">
                                            {formatDeadline(selectedProject.deadline)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Files */}
                            <div className="grid gap-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Files
                                </Label>
                                {selectedProject.files.length > 0 ? (
                                    <ul className="space-y-2">
                                        {selectedProject.files.map((file, idx) => (
                                            <li key={idx}>
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors bg-blue-50 border border-blue-100 rounded-lg px-3 py-2"
                                                >
                                                    <Download className="w-4 h-4 shrink-0" />
                                                    <span className="truncate">
                                                        {file.name}
                                                    </span>
                                                    <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-400">
                                        No files uploaded yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
