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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Users,
    CheckCircle2,
    AlertTriangle,
    Search,
    Check,
} from "lucide-react"

// ─── Types & Initial Data ───────────────────────────────────────────
interface Assignment {
    id: number
    name: string
    email: string
    projectTitle: string
    supervisor: string | null
    deadline: string
    updated: string
}

const supervisorsList = [
    { key: "aneela", name: "Dr. Aneela", slots: 5 },
    { key: "usman", name: "Dr. Usman Ali", slots: 2 },
    { key: "ayesha", name: "Ms. Ayesha Malik", slots: 8 },
    { key: "bilal", name: "Mr. Bilal Hussain", slots: 5 },
    { key: "sana", name: "Prof. Sana Khan", slots: 3 },
    { key: "ahmed", name: "Dr. Ahmed Raza", slots: 5 },
]

const initialAssignments: Assignment[] = [
    { id: 1, name: "Ahmed Saeed", email: "ahmed.saeed.student.edu@gmail.com", projectTitle: "Smart Deadline & Project Tracking System", supervisor: null, deadline: "-", updated: "1/9/2026, 4:03:54 PM" },
    { id: 2, name: "Muhammad Zeeshan", email: "zeeshan.khan@student.edu", projectTitle: "Online Examination & Result Portal", supervisor: "Ms. Ayesha Malik", deadline: "2026-03-10", updated: "1/9/2026, 3:22:16 PM" },
    { id: 3, name: "Areeba Fatima", email: "areeba.fatima@student.edu", projectTitle: "Crime Reporting & Analysis Web App", supervisor: "Dr. Ahmed Raza", deadline: "2027-01-20", updated: "1/9/2026, 3:31:32 PM" },
    { id: 4, name: "Maryam Iqbal", email: "maryam.iqbal@student.edu", projectTitle: "Inventory Management System for SMEs", supervisor: "Ms. Ayesha Malik", deadline: "2029-10-10", updated: "1/9/2026, 3:38:46 PM" },
    { id: 5, name: "Hira Aslam", email: "hira.aslam@student.edu", projectTitle: "E-Learning Management System (LMS)", supervisor: "Dr. Ahmed Raza", deadline: "2050-10-10", updated: "1/9/2026, 3:43:22 PM" },
    { id: 6, name: "Laiba Noor", email: "laiba.noor@student.edu", projectTitle: "Online Auction Management Platform", supervisor: "Dr. Ahmed Raza", deadline: "2029-10-10", updated: "1/8/2026, 7:34:25 PM" },
]

// ─── Page Component ─────────────────────────────────────────────────
export default function AssignGuidePage() {
    const [assignments, setAssignments] = React.useState<Assignment[]>(initialAssignments)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterStatus, setFilterStatus] = React.useState("all")

    // Track per-row supervisor selection (key from supervisorsList)
    const [rowSelections, setRowSelections] = React.useState<Record<number, string>>(() => {
        const init: Record<number, string> = {}
        for (const a of initialAssignments) {
            const found = supervisorsList.find((s) => s.name === a.supervisor)
            if (found) init[a.id] = found.key
        }
        return init
    })

    // Track which rows just got saved (for visual feedback)
    const [savedRows, setSavedRows] = React.useState<Set<number>>(new Set())

    // Computed metrics
    const assignedCount = assignments.filter((a) => a.supervisor !== null).length
    const unassignedCount = assignments.length - assignedCount

    // Filtering
    const filteredAssignments = assignments.filter((a) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch = a.name.toLowerCase().includes(q) || a.projectTitle.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
        if (!matchesSearch) return false
        if (filterStatus === "assigned") return a.supervisor !== null
        if (filterStatus === "unassigned") return a.supervisor === null
        return true
    })

    // ─── Handlers ────────────────────────────────────────
    function handleSelectSupervisor(assignmentId: number, supervisorKey: string) {
        setRowSelections((prev) => ({ ...prev, [assignmentId]: supervisorKey }))
        // Remove saved feedback when user changes selection
        setSavedRows((prev) => {
            const next = new Set(prev)
            next.delete(assignmentId)
            return next
        })
    }

    function handleAssign(assignmentId: number) {
        const selectedKey = rowSelections[assignmentId]
        if (!selectedKey) return

        const supervisor = supervisorsList.find((s) => s.key === selectedKey)
        if (!supervisor) return

        setAssignments((prev) =>
            prev.map((a) =>
                a.id === assignmentId
                    ? { ...a, supervisor: supervisor.name, updated: new Date().toLocaleString() }
                    : a
            )
        )

        // Show saved feedback
        setSavedRows((prev) => new Set(prev).add(assignmentId))
        setTimeout(() => {
            setSavedRows((prev) => {
                const next = new Set(prev)
                next.delete(assignmentId)
                return next
            })
        }, 2000)
    }

    function handleUnassign(assignmentId: number) {
        setAssignments((prev) =>
            prev.map((a) =>
                a.id === assignmentId
                    ? { ...a, supervisor: null, updated: new Date().toLocaleString() }
                    : a
            )
        )
        setRowSelections((prev) => {
            const next = { ...prev }
            delete next[assignmentId]
            return next
        })
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assign Supervisor</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage supervisor assignments for students and projects</p>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Assigned Students</p>
                            <h3 className="font-bold text-2xl text-slate-900">{assignedCount}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-rose-50 text-rose-500 rounded-xl shrink-0">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Unassigned Students</p>
                            <h3 className="font-bold text-2xl text-slate-900">{unassignedCount}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Available Teachers</p>
                            <h3 className="font-bold text-2xl text-slate-900">{supervisorsList.length}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mb-8">
                {/* Search & Filters */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-end bg-slate-50/50">
                    <div className="w-full md:max-w-md space-y-1.5">
                        <Label htmlFor="search-assignments" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Students</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                id="search-assignments"
                                placeholder="Search by student name or project title..."
                                className="pl-9 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-64 space-y-1.5">
                        <Label htmlFor="filter-assign-status" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Status</Label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger id="filter-assign-status" className="bg-white">
                                <SelectValue placeholder="All Students" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Students</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table Content */}
                <div className="p-0">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-slate-800">Student Assignments</h2>
                        <span className="text-xs text-slate-400 font-medium">{filteredAssignments.length} student{filteredAssignments.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="min-w-48 text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Student</TableHead>
                                    <TableHead className="min-w-56 text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Project Title</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Current Supervisor</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Deadline</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider hidden lg:table-cell">Updated</TableHead>
                                    <TableHead className="min-w-52 text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Assign Supervisor</TableHead>
                                    <TableHead className="text-right text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider w-28">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssignments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-slate-400">No students found.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAssignments.map((data) => {
                                        const isSaved = savedRows.has(data.id)
                                        const currentKey = rowSelections[data.id] ?? ""
                                        const currentSup = supervisorsList.find((s) => s.name === data.supervisor)
                                        const hasChanged = currentKey !== (currentSup?.key ?? "")

                                        return (
                                            <TableRow key={data.id} className="hover:bg-slate-50 border-slate-100">
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm text-slate-900">{data.name}</span>
                                                        <span className="text-xs text-slate-500">{data.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <span className="text-sm text-slate-700">{data.projectTitle}</span>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    {data.supervisor ? (
                                                        <span className="inline-flex items-center text-xs font-medium text-emerald-700">{data.supervisor}</span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700">Not Assigned</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <span className="text-sm text-slate-700">{data.deadline}</span>
                                                </TableCell>
                                                <TableCell className="py-4 hidden lg:table-cell">
                                                    <span className="text-xs text-slate-500">{data.updated}</span>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Select value={currentKey} onValueChange={(v) => handleSelectSupervisor(data.id, v)}>
                                                        <SelectTrigger className="w-full h-8 text-xs bg-white">
                                                            <SelectValue placeholder="Select Supervisor" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {supervisorsList.map((s) => (
                                                                <SelectItem key={s.key} value={s.key}>
                                                                    {s.name} ({s.slots} slots)
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-right py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            className={`w-full text-xs ${
                                                                isSaved
                                                                    ? "bg-emerald-500 hover:bg-emerald-600"
                                                                    : hasChanged
                                                                    ? "bg-blue-500 hover:bg-blue-600"
                                                                    : "bg-blue-500 hover:bg-blue-600"
                                                            }`}
                                                            onClick={() => handleAssign(data.id)}
                                                            disabled={!currentKey}
                                                        >
                                                            {isSaved ? (
                                                                <><Check className="w-3.5 h-3.5 mr-1" /> Saved</>
                                                            ) : data.supervisor && !hasChanged ? (
                                                                "Assigned"
                                                            ) : (
                                                                "Assign"
                                                            )}
                                                        </Button>
                                                        {data.supervisor && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="w-full text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                                                                onClick={() => handleUnassign(data.id)}
                                                            >
                                                                Unassign
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    )
}
