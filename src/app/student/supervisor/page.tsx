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
    UserCheck,
    Mail,
    GraduationCap,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    Clock,
    FileText,
    CalendarDays,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────
interface Supervisor {
    id: number
    name: string
    initials: string
    department: string
    email: string
    expertise: string
    avatarColor: string
}

type ProjectStatus = "pending" | "approved" | "rejected"

interface ProjectDetails {
    title: string
    description: string
    status: ProjectStatus
    deadline: string | null
    createdDate: string
}

// ─── Mock Data ──────────────────────────────────────────────────────
const avatarColors = [
    "bg-blue-600", "bg-teal-600", "bg-violet-600",
    "bg-emerald-600", "bg-indigo-600", "bg-slate-500",
]

const availableSupervisors: Supervisor[] = [
    {
        id: 1,
        name: "Dr. Ahmed Raza",
        initials: "A",
        department: "Computer Science",
        email: "ahmed.raza@university.edu",
        expertise: "Computer Networks",
        avatarColor: avatarColors[0],
    },
    {
        id: 2,
        name: "Prof. Sana Khan",
        initials: "S",
        department: "Data Science",
        email: "sana.khan@university.edu",
        expertise: "Machine Learning",
        avatarColor: avatarColors[1],
    },
    {
        id: 3,
        name: "Mr. Bilal Hussain",
        initials: "B",
        department: "Mechanical Engineering",
        email: "bilal.hussain@university.edu",
        expertise: "Blockchain Technology",
        avatarColor: avatarColors[2],
    },
    {
        id: 4,
        name: "Ms. Ayesha Malik",
        initials: "A",
        department: "Electrical Engineering",
        email: "ayesha.malik@university.edu",
        expertise: "Cybersecurity",
        avatarColor: avatarColors[3],
    },
    {
        id: 5,
        name: "Dr. Usman Ali",
        initials: "U",
        department: "Data Science",
        email: "usman.ali@university.edu",
        expertise: "Artificial Intelligence",
        avatarColor: avatarColors[4],
    },
    {
        id: 6,
        name: "Dr. Aneela",
        initials: "A",
        department: "Electrical Engineering",
        email: "aneela@gmail.com",
        expertise: "Database Systems",
        avatarColor: avatarColors[5],
    },
]

const projectDetails: ProjectDetails = {
    title: "Smart Deadline & Project Tracking System",
    description:
        "This project is a web-based system designed to help universities manage student projects and their deadlines efficiently. Supervisors can assign deadlines to approved projects, while students can easily view their project status and submission dates. The system provides real-time updates, role-based access, and a clear overview of project progress, making project management simple, transparent, and organized.",
    status: "pending",
    deadline: null,
    createdDate: "9th January 2026",
}

// ─── Helpers ────────────────────────────────────────────────────────
function statusConfig(status: ProjectStatus) {
    switch (status) {
        case "pending":
            return { label: "Pending", color: "border-amber-300 bg-amber-50 text-amber-700" }
        case "approved":
            return { label: "Approved", color: "border-emerald-300 bg-emerald-50 text-emerald-700" }
        case "rejected":
            return { label: "Rejected", color: "border-red-300 bg-red-50 text-red-700" }
    }
}

// ─── Page ───────────────────────────────────────────────────────────
export default function SupervisorPage() {
    const [assignedSupervisor, setAssignedSupervisor] = React.useState<Supervisor | null>(null)
    const [project, setProject] = React.useState<ProjectDetails>(projectDetails)
    const [requestOpen, setRequestOpen] = React.useState(false)
    const [requestTarget, setRequestTarget] = React.useState<Supervisor | null>(null)
    const [successOpen, setSuccessOpen] = React.useState(false)
    const [pendingRequest, setPendingRequest] = React.useState<Supervisor | null>(null)

    function handleRequestClick(supervisor: Supervisor) {
        setRequestTarget(supervisor)
        setRequestOpen(true)
    }

    function handleConfirmRequest() {
        if (!requestTarget) return
        setPendingRequest(requestTarget)
        setRequestOpen(false)
        setSuccessOpen(true)
    }

    // Simulate accepting the request (for demo)
    function handleSimulateAccept() {
        if (!pendingRequest) return
        setAssignedSupervisor(pendingRequest)
        setPendingRequest(null)
        setProject((prev) => ({
            ...prev,
            status: "approved",
            deadline: "10th December 2027",
        }))
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
            {/* ─── Current Supervisor Section ─────────────────── */}
            <Card className="shadow-sm border-slate-100">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-lg text-slate-900">Current Supervisor</h2>
                        {assignedSupervisor && (
                            <Badge variant="outline" className="text-xs font-semibold border-emerald-300 bg-emerald-50 text-emerald-700">
                                Assigned
                            </Badge>
                        )}
                        {pendingRequest && !assignedSupervisor && (
                            <Badge variant="outline" className="text-xs font-semibold border-amber-300 bg-amber-50 text-amber-700">
                                Request Pending
                            </Badge>
                        )}
                    </div>

                    <Separator className="mb-5" />

                    {assignedSupervisor ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            {/* Avatar */}
                            <div className={`${assignedSupervisor.avatarColor} w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0`}>
                                {assignedSupervisor.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-slate-900">{assignedSupervisor.name}</h3>
                                <p className="text-sm text-slate-500">{assignedSupervisor.department}</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</p>
                                        <p className="text-sm text-slate-800 mt-0.5">{assignedSupervisor.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expertise</p>
                                        <p className="text-sm text-slate-800 mt-0.5">{assignedSupervisor.expertise}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : pendingRequest ? (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="p-3 bg-amber-50 rounded-full">
                                <Clock className="w-8 h-8 text-amber-500" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-slate-700">
                                    Request sent to <span className="font-bold">{pendingRequest.name}</span>
                                </p>
                                <p className="text-sm text-slate-500 mt-1">Waiting for supervisor to accept your request.</p>
                            </div>
                            {/* Demo button */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                onClick={handleSimulateAccept}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Simulate Accept (Demo)
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <UserCheck className="w-10 h-10 mb-3 text-slate-300" />
                            <p className="font-medium text-lg text-slate-500">Supervisor not assigned yet.</p>
                            <p className="text-sm mt-1">Browse available supervisors below to send a request.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ─── Project Details Section ─────────────────────── */}
            <Card className="shadow-sm border-slate-100">
                <CardContent className="p-6">
                    <h2 className="font-bold text-lg text-slate-900 mb-4">Project Details</h2>
                    <Separator className="mb-5" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Title</p>
                            <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Deadline</p>
                            <p className="text-sm text-slate-800">{project.deadline ?? "No deadline set"}</p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</p>
                            <Badge variant="outline" className={`text-xs font-semibold ${statusConfig(project.status).color}`}>
                                {statusConfig(project.status).label}
                            </Badge>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</p>
                            <p className="text-sm text-slate-800">{project.createdDate}</p>
                        </div>
                    </div>

                    <div className="space-y-1.5 mt-6">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{project.description}</p>
                    </div>
                </CardContent>
            </Card>

            {/* ─── Available Supervisors ───────────────────────── */}
            {!assignedSupervisor && (
                <Card className="shadow-sm border-slate-100 mb-8">
                    <CardContent className="p-6">
                        <div className="mb-4">
                            <h2 className="font-bold text-lg text-slate-900">Available Supervisors</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Browse and request supervision from available faculty members</p>
                        </div>
                        <Separator className="mb-5" />

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {availableSupervisors.map((sup) => {
                                const isPending = pendingRequest?.id === sup.id

                                return (
                                    <Card
                                        key={sup.id}
                                        className="shadow-sm border-slate-100 hover:shadow-md transition-shadow"
                                    >
                                        <CardContent className="p-5 flex flex-col gap-4">
                                            {/* Top: Avatar + Name */}
                                            <div className="flex items-center gap-3">
                                                <div className={`${sup.avatarColor} w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                                    {sup.initials}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-sm text-slate-900 truncate">
                                                        {sup.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500">{sup.department}</p>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="space-y-2.5">
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500">Email</p>
                                                    <p className="text-sm text-slate-800 truncate">{sup.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500">Expertise</p>
                                                    <p className="text-sm text-slate-800">{sup.expertise}</p>
                                                </div>
                                            </div>

                                            {/* Request Button */}
                                            <Button
                                                className="w-full gap-2 bg-blue-500 hover:bg-blue-600 text-white mt-auto"
                                                disabled={!!pendingRequest}
                                                onClick={() => handleRequestClick(sup)}
                                            >
                                                {isPending ? (
                                                    <>
                                                        <Clock className="w-4 h-4" />
                                                        Request Pending
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserCheck className="w-4 h-4" />
                                                        Request Supervisor
                                                    </>
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ─── Request Confirmation Dialog ────────────────── */}
            <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-blue-600" />
                            Request Supervisor
                        </DialogTitle>
                    </DialogHeader>

                    {requestTarget && (
                        <div className="py-3 space-y-4">
                            <p className="text-sm text-slate-600">
                                Are you sure you want to send a supervision request to:
                            </p>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`${requestTarget.avatarColor} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                        {requestTarget.initials}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-900">{requestTarget.name}</p>
                                        <p className="text-xs text-slate-500">{requestTarget.department}</p>
                                    </div>
                                </div>
                                <Separator className="my-2" />
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <p className="text-xs text-slate-500">Email</p>
                                        <p className="text-xs font-medium text-slate-800 truncate">{requestTarget.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Expertise</p>
                                        <p className="text-xs font-medium text-slate-800">{requestTarget.expertise}</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-amber-600 font-medium">
                                You can only have one pending request at a time.
                            </p>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleConfirmRequest}
                        >
                            <UserCheck className="w-4 h-4" />
                            Send Request
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
                            <h3 className="font-bold text-lg text-slate-900">Request Sent!</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Your supervision request has been sent to{" "}
                                <span className="font-semibold">{requestTarget?.name}</span>.
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
