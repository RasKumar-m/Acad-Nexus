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
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
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
    Plus,
    Search,
    Pencil,
    Trash2,
} from "lucide-react"

// ─── Types & Initial Data ───────────────────────────────────────────
interface Student {
    id: number
    name: string
    email: string
    department: string
    year: string
    supervisor: string | null
    projectTitle: string
}

const departmentMap: Record<string, string> = {
    cs: "Computer Science",
    ee: "Electrical Engineering",
    se: "Software Engineering",
}

const initialStudents: Student[] = [
    { id: 1, name: "Ahmed Saeed", email: "ahmed.saeed.student.edu@gmail.com", department: "Software Engineering", year: "2026", supervisor: null, projectTitle: "-" },
    { id: 2, name: "Hira Aslam", email: "hira.aslam@student.edu", department: "Electrical Engineering", year: "2026", supervisor: "Dr. Ahmed Raza", projectTitle: "E-Learning Management System (LMS)" },
    { id: 3, name: "Maryam Iqbal", email: "maryam.iqbal@student.edu", department: "Software Engineering", year: "2026", supervisor: "Ms. Ayesha Malik", projectTitle: "Inventory Management System for SMEs" },
    { id: 4, name: "Laiba Noor", email: "laiba.noor@student.edu", department: "Software Engineering", year: "2026", supervisor: "Dr. Ahmed Raza", projectTitle: "Online Auction Management Platform" },
    { id: 5, name: "Areeba Fatima", email: "areeba.fatima@student.edu", department: "Electrical Engineering", year: "2026", supervisor: "Dr. Ahmed Raza", projectTitle: "Crime Reporting & Analysis Web App" },
    { id: 6, name: "Muhammad Zeeshan", email: "zeeshan.khan@student.edu", department: "Software Engineering", year: "2026", supervisor: "Ms. Ayesha Malik", projectTitle: "Online Examination & Result Portal" },
    { id: 7, name: "Ali Hamza", email: "ali.hamza@student.edu", department: "Computer Science", year: "2026", supervisor: null, projectTitle: "-" },
]

// ─── Page Component ─────────────────────────────────────────────────
export default function ManageStudentsPage() {
    const [students, setStudents] = React.useState<Student[]>(initialStudents)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterDept, setFilterDept] = React.useState("all")

    // Add dialog
    const [addOpen, setAddOpen] = React.useState(false)
    const [addName, setAddName] = React.useState("")
    const [addEmail, setAddEmail] = React.useState("")
    const [addPassword, setAddPassword] = React.useState("")
    const [addDept, setAddDept] = React.useState("cs")

    // Edit dialog
    const [editOpen, setEditOpen] = React.useState(false)
    const [editStudent, setEditStudent] = React.useState<Student | null>(null)
    const [editName, setEditName] = React.useState("")
    const [editEmail, setEditEmail] = React.useState("")
    const [editDept, setEditDept] = React.useState("cs")

    // Delete dialog
    const [deleteOpen, setDeleteOpen] = React.useState(false)
    const [deleteTarget, setDeleteTarget] = React.useState<Student | null>(null)

    // Computed metrics
    const totalStudents = students.length
    const assignedCount = students.filter((s) => s.supervisor !== null).length
    const unassignedCount = totalStudents - assignedCount

    // Filtering
    const filteredStudents = students.filter((s) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch = s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
        if (!matchesSearch) return false
        if (filterDept !== "all") {
            const deptLabel = departmentMap[filterDept]
            if (s.department !== deptLabel) return false
        }
        return true
    })

    // ─── Handlers ────────────────────────────────────────
    function getDeptKey(deptLabel: string) {
        return Object.entries(departmentMap).find(([, v]) => v === deptLabel)?.[0] ?? "cs"
    }

    function handleAddStudent() {
        if (!addName.trim() || !addEmail.trim()) return
        const newStudent: Student = {
            id: Date.now(),
            name: addName.trim(),
            email: addEmail.trim(),
            department: departmentMap[addDept] ?? "Computer Science",
            year: new Date().getFullYear().toString(),
            supervisor: null,
            projectTitle: "-",
        }
        setStudents((prev) => [...prev, newStudent])
        setAddName("")
        setAddEmail("")
        setAddPassword("")
        setAddDept("cs")
        setAddOpen(false)
    }

    function openEditDialog(student: Student) {
        setEditStudent(student)
        setEditName(student.name)
        setEditEmail(student.email)
        setEditDept(getDeptKey(student.department))
        setEditOpen(true)
    }

    function handleEditStudent() {
        if (!editStudent || !editName.trim() || !editEmail.trim()) return
        setStudents((prev) =>
            prev.map((s) =>
                s.id === editStudent.id
                    ? { ...s, name: editName.trim(), email: editEmail.trim(), department: departmentMap[editDept] ?? s.department }
                    : s
            )
        )
        setEditOpen(false)
        setEditStudent(null)
    }

    function openDeleteDialog(student: Student) {
        setDeleteTarget(student)
        setDeleteOpen(true)
    }

    function handleDeleteStudent() {
        if (!deleteTarget) return
        setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id))
        setDeleteOpen(false)
        setDeleteTarget(null)
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Students</h1>
                    <p className="text-sm text-slate-500 mt-1">Add, edit, and manage student accounts</p>
                </div>

                <Button onClick={() => setAddOpen(true)} className="bg-blue-500 hover:bg-blue-600 font-semibold gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> Add New Student
                </Button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Students</p>
                            <h3 className="font-bold text-2xl text-slate-900">{totalStudents}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-violet-50 text-violet-600 rounded-xl shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Assigned</p>
                            <h3 className="font-bold text-2xl text-slate-900">{assignedCount}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-500 rounded-xl shrink-0">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Unassigned</p>
                            <h3 className="font-bold text-2xl text-slate-900">{unassignedCount}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mb-8">
                {/* Search & Filters */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-end bg-slate-50/50">
                    <div className="w-full md:max-w-sm space-y-1.5">
                        <Label htmlFor="search-students" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Students</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                id="search-students"
                                placeholder="Search by name or email..."
                                className="pl-9 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-64 space-y-1.5">
                        <Label htmlFor="filter-dept" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Department</Label>
                        <Select value={filterDept} onValueChange={setFilterDept}>
                            <SelectTrigger id="filter-dept" className="bg-white">
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                <SelectItem value="se">Software Engineering</SelectItem>
                                <SelectItem value="ee">Electrical Engineering</SelectItem>
                                <SelectItem value="cs">Computer Science</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table Content */}
                <div className="p-0">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-slate-800">Students List</h2>
                        <span className="text-xs text-slate-400 font-medium">{filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="min-w-56 text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Student Info</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Department & Year</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Supervisor</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Project Title</TableHead>
                                    <TableHead className="text-right text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider w-28">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-slate-400">No students found.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.id} className="hover:bg-slate-50 border-slate-100">
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-slate-900">{student.name}</span>
                                                    <span className="text-xs text-slate-500">{student.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-slate-700">{student.department}</span>
                                                    <span className="text-xs text-slate-500">{student.year}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {student.supervisor ? (
                                                    <span className="inline-flex items-center text-xs font-medium text-emerald-700">{student.supervisor}</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700">Not Assigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="text-sm text-slate-700">{student.projectTitle}</span>
                                            </TableCell>
                                            <TableCell className="text-right py-4">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => openEditDialog(student)}>
                                                        <Pencil className="w-4 h-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-600 hover:text-rose-800 hover:bg-rose-50" onClick={() => openDeleteDialog(student)}>
                                                        <Trash2 className="w-4 h-4" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
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

            {/* ─── Add Student Dialog ──────────────────────────── */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Student</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="add-s-name">Full Name</Label>
                            <Input id="add-s-name" placeholder="Ahmed Saeed" value={addName} onChange={(e) => setAddName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-s-email">Email</Label>
                            <Input id="add-s-email" type="email" placeholder="ahmed@example.com" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-s-pass">Password</Label>
                            <Input id="add-s-pass" type="password" placeholder="••••••••" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-s-dept">Department</Label>
                            <Select value={addDept} onValueChange={setAddDept}>
                                <SelectTrigger id="add-s-dept">
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cs">Computer Science</SelectItem>
                                    <SelectItem value="ee">Electrical Engineering</SelectItem>
                                    <SelectItem value="se">Software Engineering</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="button" className="bg-blue-500 hover:bg-blue-600 text-white font-medium" onClick={handleAddStudent}>Add Student</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Edit Student Dialog ─────────────────────────── */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Student</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-s-name">Full Name</Label>
                            <Input id="edit-s-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-s-email">Email</Label>
                            <Input id="edit-s-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-s-dept">Department</Label>
                            <Select value={editDept} onValueChange={setEditDept}>
                                <SelectTrigger id="edit-s-dept">
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cs">Computer Science</SelectItem>
                                    <SelectItem value="ee">Electrical Engineering</SelectItem>
                                    <SelectItem value="se">Software Engineering</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="button" className="bg-blue-500 hover:bg-blue-600 text-white font-medium" onClick={handleEditStudent}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Delete Confirmation Dialog ──────────────────── */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Student</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-600 py-2">
                        Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteTarget?.name}</span>? This action cannot be undone.
                    </p>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDeleteStudent}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
