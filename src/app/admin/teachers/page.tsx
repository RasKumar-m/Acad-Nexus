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
interface Teacher {
    id: number
    name: string
    email: string
    department: string
    expertise: string
    maxStudents: number
    joinDate: string
}

const departmentMap: Record<string, string> = {
    cs: "Computer Science",
    ee: "Electrical Engineering",
    se: "Software Engineering",
    ds: "Data Science",
    me: "Mechanical Engineering",
}

const expertiseMap: Record<string, string> = {
    db: "Database Systems",
    ml: "Machine Learning",
    web: "Web Development",
    ai: "Artificial Intelligence",
    cyber: "Cybersecurity",
    blockchain: "Blockchain Technology",
}

const initialTeachers: Teacher[] = [
    { id: 1, name: "Dr. Aneela", email: "aneela@gmail.com", department: "Electrical Engineering", expertise: "Database Systems", maxStudents: 5, joinDate: "1/9/2026, 3:55:22 PM" },
    { id: 2, name: "Dr. Usman Ali", email: "usman.ali@university.edu", department: "Data Science", expertise: "Artificial Intelligence", maxStudents: 3, joinDate: "1/8/2026, 7:01:56 PM" },
    { id: 3, name: "Ms. Ayesha Malik", email: "ayesha.malik@university.edu", department: "Electrical Engineering", expertise: "Cybersecurity", maxStudents: 10, joinDate: "1/8/2026, 7:00:10 PM" },
    { id: 4, name: "Mr. Bilal Hussain", email: "bilal.hussain@university.edu", department: "Mechanical Engineering", expertise: "Blockchain Technology", maxStudents: 5, joinDate: "1/8/2026, 6:59:21 PM" },
]

// ─── Page Component ─────────────────────────────────────────────────
export default function ManageTeachersPage() {
    const [teachers, setTeachers] = React.useState<Teacher[]>(initialTeachers)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterDept, setFilterDept] = React.useState("all")

    // Add dialog
    const [addOpen, setAddOpen] = React.useState(false)
    const [addName, setAddName] = React.useState("")
    const [addEmail, setAddEmail] = React.useState("")
    const [addPassword, setAddPassword] = React.useState("")
    const [addDept, setAddDept] = React.useState("ee")
    const [addExpertise, setAddExpertise] = React.useState("db")
    const [addMaxStudents, setAddMaxStudents] = React.useState(1)

    // Edit dialog
    const [editOpen, setEditOpen] = React.useState(false)
    const [editTeacher, setEditTeacher] = React.useState<Teacher | null>(null)
    const [editName, setEditName] = React.useState("")
    const [editEmail, setEditEmail] = React.useState("")
    const [editDept, setEditDept] = React.useState("ee")
    const [editExpertise, setEditExpertise] = React.useState("db")
    const [editMaxStudents, setEditMaxStudents] = React.useState(1)

    // Delete dialog
    const [deleteOpen, setDeleteOpen] = React.useState(false)
    const [deleteTarget, setDeleteTarget] = React.useState<Teacher | null>(null)

    // Computed metrics
    const totalTeachers = teachers.length
    const departments = new Set(teachers.map((t) => t.department)).size

    // Filtering
    const filteredTeachers = teachers.filter((t) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch = t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
        if (!matchesSearch) return false
        if (filterDept !== "all") {
            const deptLabel = departmentMap[filterDept]
            if (t.department !== deptLabel) return false
        }
        return true
    })

    // ─── Helpers ─────────────────────────────────────────
    function getDeptKey(label: string) {
        return Object.entries(departmentMap).find(([, v]) => v === label)?.[0] ?? "ee"
    }
    function getExpKey(label: string) {
        return Object.entries(expertiseMap).find(([, v]) => v === label)?.[0] ?? "db"
    }

    // ─── Handlers ────────────────────────────────────────
    function handleAddTeacher() {
        if (!addName.trim() || !addEmail.trim()) return
        const newTeacher: Teacher = {
            id: Date.now(),
            name: addName.trim(),
            email: addEmail.trim(),
            department: departmentMap[addDept] ?? "Computer Science",
            expertise: expertiseMap[addExpertise] ?? "Database Systems",
            maxStudents: addMaxStudents,
            joinDate: new Date().toLocaleString(),
        }
        setTeachers((prev) => [...prev, newTeacher])
        setAddName("")
        setAddEmail("")
        setAddPassword("")
        setAddDept("ee")
        setAddExpertise("db")
        setAddMaxStudents(1)
        setAddOpen(false)
    }

    function openEditDialog(teacher: Teacher) {
        setEditTeacher(teacher)
        setEditName(teacher.name)
        setEditEmail(teacher.email)
        setEditDept(getDeptKey(teacher.department))
        setEditExpertise(getExpKey(teacher.expertise))
        setEditMaxStudents(teacher.maxStudents)
        setEditOpen(true)
    }

    function handleEditTeacher() {
        if (!editTeacher || !editName.trim() || !editEmail.trim()) return
        setTeachers((prev) =>
            prev.map((t) =>
                t.id === editTeacher.id
                    ? {
                          ...t,
                          name: editName.trim(),
                          email: editEmail.trim(),
                          department: departmentMap[editDept] ?? t.department,
                          expertise: expertiseMap[editExpertise] ?? t.expertise,
                          maxStudents: editMaxStudents,
                      }
                    : t
            )
        )
        setEditOpen(false)
        setEditTeacher(null)
    }

    function openDeleteDialog(teacher: Teacher) {
        setDeleteTarget(teacher)
        setDeleteOpen(true)
    }

    function handleDeleteTeacher() {
        if (!deleteTarget) return
        setTeachers((prev) => prev.filter((t) => t.id !== deleteTarget.id))
        setDeleteOpen(false)
        setDeleteTarget(null)
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Teachers</h1>
                    <p className="text-sm text-slate-500 mt-1">Add, edit, and manage teacher accounts</p>
                </div>

                <Button onClick={() => setAddOpen(true)} className="bg-blue-500 hover:bg-blue-600 font-semibold gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> Add New Teacher
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
                            <p className="text-sm text-slate-500 font-medium">Total Teachers</p>
                            <h3 className="font-bold text-2xl text-slate-900">{totalTeachers}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-violet-50 text-violet-600 rounded-xl shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Showing</p>
                            <h3 className="font-bold text-2xl text-slate-900">{filteredTeachers.length}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-500 rounded-xl shrink-0">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Departments</p>
                            <h3 className="font-bold text-2xl text-slate-900">{departments}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mb-8">
                {/* Search & Filters */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-end bg-slate-50/50">
                    <div className="w-full md:max-w-sm space-y-1.5">
                        <Label htmlFor="search-teachers" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Teachers</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                id="search-teachers"
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
                                <SelectItem value="ds">Data Science</SelectItem>
                                <SelectItem value="me">Mechanical Engineering</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table Content */}
                <div className="p-0">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-slate-800">Teachers List</h2>
                        <span className="text-xs text-slate-400 font-medium">{filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="min-w-56 text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Teacher Info</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Department</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Expertise</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Join Date</TableHead>
                                    <TableHead className="text-right text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider w-28">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTeachers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-slate-400">No teachers found.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTeachers.map((teacher) => (
                                        <TableRow key={teacher.id} className="hover:bg-slate-50 border-slate-100">
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-slate-900">{teacher.name}</span>
                                                    <span className="text-xs text-slate-500">{teacher.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="text-sm text-slate-700">{teacher.department}</span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="text-sm text-slate-700">{teacher.expertise}</span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="text-sm text-slate-500">{teacher.joinDate}</span>
                                            </TableCell>
                                            <TableCell className="text-right py-4">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => openEditDialog(teacher)}>
                                                        <Pencil className="w-4 h-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-600 hover:text-rose-800 hover:bg-rose-50" onClick={() => openDeleteDialog(teacher)}>
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

            {/* ─── Add Teacher Dialog ─────────────────────────── */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Teacher</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                        <div className="grid gap-2">
                            <Label htmlFor="add-t-name">Full Name</Label>
                            <Input id="add-t-name" placeholder="Dr. Aneela" value={addName} onChange={(e) => setAddName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-t-email">Email</Label>
                            <Input id="add-t-email" type="email" placeholder="aneela@gmail.com" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-t-pass">Password</Label>
                            <Input id="add-t-pass" type="password" placeholder="••••••••" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-t-dept">Department</Label>
                            <Select value={addDept} onValueChange={setAddDept}>
                                <SelectTrigger id="add-t-dept"><SelectValue placeholder="Select Department" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cs">Computer Science</SelectItem>
                                    <SelectItem value="ee">Electrical Engineering</SelectItem>
                                    <SelectItem value="se">Software Engineering</SelectItem>
                                    <SelectItem value="ds">Data Science</SelectItem>
                                    <SelectItem value="me">Mechanical Engineering</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-t-exp">Expertise</Label>
                            <Select value={addExpertise} onValueChange={setAddExpertise}>
                                <SelectTrigger id="add-t-exp"><SelectValue placeholder="Select Expertise" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="db">Database Systems</SelectItem>
                                    <SelectItem value="ml">Machine Learning</SelectItem>
                                    <SelectItem value="web">Web Development</SelectItem>
                                    <SelectItem value="ai">Artificial Intelligence</SelectItem>
                                    <SelectItem value="cyber">Cybersecurity</SelectItem>
                                    <SelectItem value="blockchain">Blockchain Technology</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-t-max">Max Students</Label>
                            <Input id="add-t-max" type="number" value={addMaxStudents} onChange={(e) => setAddMaxStudents(Number(e.target.value))} min={1} />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="button" className="bg-blue-500 hover:bg-blue-600 text-white font-medium" onClick={handleAddTeacher}>Add Teacher</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Edit Teacher Dialog ────────────────────────── */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Teacher</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-t-name">Full Name</Label>
                            <Input id="edit-t-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-t-email">Email</Label>
                            <Input id="edit-t-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-t-dept">Department</Label>
                            <Select value={editDept} onValueChange={setEditDept}>
                                <SelectTrigger id="edit-t-dept"><SelectValue placeholder="Select Department" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cs">Computer Science</SelectItem>
                                    <SelectItem value="ee">Electrical Engineering</SelectItem>
                                    <SelectItem value="se">Software Engineering</SelectItem>
                                    <SelectItem value="ds">Data Science</SelectItem>
                                    <SelectItem value="me">Mechanical Engineering</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-t-exp">Expertise</Label>
                            <Select value={editExpertise} onValueChange={setEditExpertise}>
                                <SelectTrigger id="edit-t-exp"><SelectValue placeholder="Select Expertise" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="db">Database Systems</SelectItem>
                                    <SelectItem value="ml">Machine Learning</SelectItem>
                                    <SelectItem value="web">Web Development</SelectItem>
                                    <SelectItem value="ai">Artificial Intelligence</SelectItem>
                                    <SelectItem value="cyber">Cybersecurity</SelectItem>
                                    <SelectItem value="blockchain">Blockchain Technology</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-t-max">Max Students</Label>
                            <Input id="edit-t-max" type="number" value={editMaxStudents} onChange={(e) => setEditMaxStudents(Number(e.target.value))} min={1} />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="button" className="bg-blue-500 hover:bg-blue-600 text-white font-medium" onClick={handleEditTeacher}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Delete Confirmation Dialog ──────────────────── */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Teacher</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-600 py-2">
                        Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteTarget?.name}</span>? This action cannot be undone.
                    </p>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDeleteTeacher}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
