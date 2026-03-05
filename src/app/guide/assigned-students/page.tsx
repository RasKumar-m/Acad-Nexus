"use client"

import * as React from "react"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    Users,
    CheckCircle2,
    Clock,
    Search,
    MessageSquare,
    FolderKanban,
    CalendarDays,
    AlertTriangle,
    Send,
} from "lucide-react"

// ─── Mock Data ──────────────────────────────────────────────────────
type StudentStatus = "approved" | "in-progress" | "completed" | "pending"

interface AssignedStudent {
    id: number
    name: string
    initials: string
    email: string
    department: string
    projectTitle: string
    projectDescription: string
    status: StudentStatus
    lastUpdate: string
    avatarColor: string
}

const avatarColors = [
    "bg-blue-600",
    "bg-emerald-600",
    "bg-violet-600",
    "bg-rose-600",
    "bg-amber-600",
    "bg-teal-600",
]

const initialStudents: AssignedStudent[] = [
    {
        id: 1,
        name: "Ahmed Saeed",
        initials: "AS",
        email: "ahmed.saeed@student.edu",
        department: "Software Engineering",
        projectTitle: "E-Learning Management System (LMS)",
        projectDescription:
            "An online learning platform designed to facilitate course management, student assessments, progress tracking and analytics for educational institutions.",
        status: "approved",
        lastUpdate: "2025-03-01",
        avatarColor: avatarColors[0],
    },
    {
        id: 2,
        name: "Fatima Noor",
        initials: "FN",
        email: "fatima.noor@student.edu",
        department: "Computer Science",
        projectTitle: "Crime Reporting & Analysis Web App",
        projectDescription:
            "A web application for reporting crimes and analyzing crime data to assist law enforcement agencies with pattern detection and resource allocation.",
        status: "in-progress",
        lastUpdate: "2025-02-28",
        avatarColor: avatarColors[1],
    },
    {
        id: 3,
        name: "Bilal Khan",
        initials: "BK",
        email: "bilal.khan@student.edu",
        department: "Software Engineering",
        projectTitle: "Online Auction Management Platform",
        projectDescription:
            "A web-based online auction system that enables users to list items, place bids in real-time and manage auction events with a transparent and secure bidding mechanism.",
        status: "completed",
        lastUpdate: "2025-02-25",
        avatarColor: avatarColors[2],
    },
    {
        id: 4,
        name: "Hira Aslam",
        initials: "HA",
        email: "hira.aslam@student.edu",
        department: "Electrical Engineering",
        projectTitle: "Online Examination & Result Portal",
        projectDescription:
            "A comprehensive portal for conducting online exams and managing student results efficiently with real-time grading, analytics and reporting.",
        status: "approved",
        lastUpdate: "2025-02-20",
        avatarColor: avatarColors[3],
    },
    {
        id: 5,
        name: "Maryam Iqbal",
        initials: "MI",
        email: "maryam.iqbal@student.edu",
        department: "Software Engineering",
        projectTitle: "Inventory Management System for SMEs",
        projectDescription:
            "An inventory management platform tailored for small & medium enterprises to track stock levels, manage orders and generate automated reports.",
        status: "in-progress",
        lastUpdate: "2025-03-03",
        avatarColor: avatarColors[4],
    },
    {
        id: 6,
        name: "Zeeshan Ali",
        initials: "ZA",
        email: "zeeshan.ali@student.edu",
        department: "Computer Science",
        projectTitle: "AI-Powered Resume Screening Tool",
        projectDescription:
            "An AI-based platform that automates resume screening for HR departments, using NLP to rank and filter candidates based on job requirements.",
        status: "pending",
        lastUpdate: "2025-03-05",
        avatarColor: avatarColors[5],
    },
]

// ─── Helpers ────────────────────────────────────────────────────────
function statusConfig(status: StudentStatus) {
    switch (status) {
        case "approved":
            return { label: "Approved", color: "border-emerald-300 bg-emerald-50 text-emerald-700" }
        case "in-progress":
            return { label: "In Progress", color: "border-blue-300 bg-blue-50 text-blue-700" }
        case "completed":
            return { label: "Completed", color: "border-violet-300 bg-violet-50 text-violet-700" }
        case "pending":
            return { label: "Pending", color: "border-amber-300 bg-amber-50 text-amber-700" }
    }
}

// ─── Page ───────────────────────────────────────────────────────────
export default function AssignedStudentsPage() {
    const [students, setStudents] = React.useState<AssignedStudent[]>(initialStudents)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterStatus, setFilterStatus] = React.useState("all")

    // Feedback dialog
    const [feedbackOpen, setFeedbackOpen] = React.useState(false)
    const [feedbackStudent, setFeedbackStudent] = React.useState<AssignedStudent | null>(null)
    const [feedbackText, setFeedbackText] = React.useState("")

    // Mark Complete dialog
    const [completeOpen, setCompleteOpen] = React.useState(false)
    const [completeStudent, setCompleteStudent] = React.useState<AssignedStudent | null>(null)

    // Metrics
    const total = students.length
    const completedCount = students.filter((s) => s.status === "completed").length
    const inProgressCount = students.filter((s) => s.status === "in-progress").length
    const totalProjects = students.length

    // Filtering
    const filtered = students.filter((s) => {
        const q = searchQuery.toLowerCase()
        const matchSearch =
            s.name.toLowerCase().includes(q) ||
            s.projectTitle.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)
        if (!matchSearch) return false
        if (filterStatus === "all") return true
        return s.status === filterStatus
    })

    function openFeedback(student: AssignedStudent) {
        setFeedbackStudent(student)
        setFeedbackText("")
        setFeedbackOpen(true)
    }

    function handleSendFeedback() {
        // In a real app this would send to an API
        setFeedbackOpen(false)
        setFeedbackStudent(null)
        setFeedbackText("")
    }

    function openMarkComplete(student: AssignedStudent) {
        setCompleteStudent(student)
        setCompleteOpen(true)
    }

    function handleMarkComplete() {
        if (!completeStudent) return
        setStudents((prev) =>
            prev.map((s) =>
                s.id === completeStudent.id ? { ...s, status: "completed" as StudentStatus } : s
            )
        )
        setCompleteOpen(false)
        setCompleteStudent(null)
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Assigned Students
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Manage your assigned students and their projects
                </p>
            </div>

            {/* ─── Metric Cards ───────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm border-slate-100 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-3 p-4">
                            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 font-medium">Total Students</p>
                                <h3 className="font-bold text-2xl text-slate-900">{total}</h3>
                            </div>
                        </div>
                        <div className="h-1 bg-blue-500" />
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-3 p-4">
                            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 font-medium">Projects Completed</p>
                                <h3 className="font-bold text-2xl text-slate-900">{completedCount}</h3>
                            </div>
                        </div>
                        <div className="h-1 bg-emerald-500" />
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-3 p-4">
                            <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 font-medium">In Progress</p>
                                <h3 className="font-bold text-2xl text-slate-900">{inProgressCount}</h3>
                            </div>
                        </div>
                        <div className="h-1 bg-amber-500" />
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-3 p-4">
                            <div className="p-2.5 bg-violet-100 text-violet-600 rounded-xl shrink-0">
                                <FolderKanban className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 font-medium">Total Projects</p>
                                <h3 className="font-bold text-2xl text-slate-900">{totalProjects}</h3>
                            </div>
                        </div>
                        <div className="h-1 bg-violet-500" />
                    </CardContent>
                </Card>
            </div>

            {/* ─── Search & Filter ────────────────────────────── */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="w-full sm:flex-1 space-y-1.5">
                        <Label htmlFor="search-students" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Search Students
                        </Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                id="search-students"
                                placeholder="Search by name, email, or project..."
                                className="pl-9 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="w-full sm:w-48 space-y-1.5">
                        <Label htmlFor="filter-status" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Filter Status
                        </Label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger id="filter-status" className="bg-white">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* ─── Student Cards ──────────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-16 flex flex-col items-center gap-3 text-slate-400">
                    <AlertTriangle className="w-10 h-10" />
                    <p className="font-semibold text-lg">No assigned students found</p>
                    <p className="text-sm">Try adjusting your search or filter criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
                    {filtered.map((student) => {
                        const cfg = statusConfig(student.status)
                        const isCompleted = student.status === "completed"

                        return (
                            <Card
                                key={student.id}
                                className="shadow-sm border-slate-100 hover:shadow-md transition-shadow"
                            >
                                <CardContent className="p-5 flex flex-col gap-4">
                                    {/* Top Row: Avatar + Info + Badge */}
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`${student.avatarColor} w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}
                                        >
                                            {student.initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-sm text-slate-900 truncate">
                                                        {student.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {student.email}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs font-semibold shrink-0 ${cfg.color}`}
                                                >
                                                    {cfg.label}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Project Info */}
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <FolderKanban className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                            <p className="text-sm font-medium text-slate-800 line-clamp-1">
                                                {student.projectTitle}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                                            <p className="text-xs text-slate-500">
                                                Last Update: {student.lastUpdate}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {isCompleted ? (
                                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            <span className="text-sm font-medium text-emerald-700">
                                                Project Completed
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 pt-1">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 gap-1.5 border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                                                onClick={() => openFeedback(student)}
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                Feedback
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                onClick={() => openMarkComplete(student)}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Mark Complete
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* ─── Feedback Dialog ────────────────────────────── */}
            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-teal-600" />
                            Send Feedback
                        </DialogTitle>
                    </DialogHeader>

                    {feedbackStudent && (
                        <div className="grid gap-4 py-2">
                            {/* Student Info */}
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                                <div
                                    className={`${feedbackStudent.avatarColor} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}
                                >
                                    {feedbackStudent.initials}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-slate-900">{feedbackStudent.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{feedbackStudent.projectTitle}</p>
                                </div>
                            </div>

                            {/* Feedback Textarea */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="feedback-text" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Your Feedback
                                </Label>
                                <textarea
                                    id="feedback-text"
                                    rows={5}
                                    placeholder="Enter your feedback for the student..."
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
                            disabled={!feedbackText.trim()}
                            onClick={handleSendFeedback}
                        >
                            <Send className="w-4 h-4" />
                            Send Feedback
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Mark Complete Confirmation Dialog ──────────── */}
            <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            Mark as Complete
                        </DialogTitle>
                    </DialogHeader>

                    {completeStudent && (
                        <div className="grid gap-4 py-2">
                            <p className="text-sm text-slate-600">
                                Are you sure you want to mark the following project as completed?
                            </p>

                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`${completeStudent.avatarColor} w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0`}
                                    >
                                        {completeStudent.initials}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-slate-900">{completeStudent.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{completeStudent.email}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-start gap-2">
                                    <FolderKanban className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                    <p className="text-sm text-slate-700">{completeStudent.projectTitle}</p>
                                </div>
                            </div>

                            <p className="text-xs text-amber-600 font-medium">
                                This action cannot be undone.
                            </p>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={handleMarkComplete}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Confirm Complete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
