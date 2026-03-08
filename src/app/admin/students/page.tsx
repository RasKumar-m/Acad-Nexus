"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, CheckCircle2, AlertTriangle, Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react"
import { useProposals } from "@/lib/proposal-context"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { validateName, validateEmail, validatePassword } from "@/lib/validation"

interface UserDoc {
    _id: string
    name: string
    email: string
    assignedGuideId?: string | null
    assignedGuideName?: string | null
    department?: string
    createdAt: string
}

export default function ManageStudentsPage() {
    const { proposals } = useProposals()
    const [students, setStudents] = React.useState<UserDoc[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterDept, setFilterDept] = React.useState("all")

    // Add dialog
    const [addOpen, setAddOpen] = React.useState(false)
    const [addName, setAddName] = React.useState("")
    const [addEmail, setAddEmail] = React.useState("")
    const [addPassword, setAddPassword] = React.useState("")
    const [addDept, setAddDept] = React.useState("Computer Science")
    const [saving, setSaving] = React.useState(false)
    const [formError, setFormError] = React.useState("")

    // Edit dialog
    const [editOpen, setEditOpen] = React.useState(false)
    const [editStudent, setEditStudent] = React.useState<UserDoc | null>(null)
    const [editName, setEditName] = React.useState("")
    const [editEmail, setEditEmail] = React.useState("")
    const [editDept, setEditDept] = React.useState("Computer Science")

    // Delete dialog
    const [deleteOpen, setDeleteOpen] = React.useState(false)
    const [deleteTarget, setDeleteTarget] = React.useState<UserDoc | null>(null)
    const [activityOpen, setActivityOpen] = React.useState(false)
    const [activityTarget, setActivityTarget] = React.useState<UserDoc | null>(null)
    const [activityMap, setActivityMap] = React.useState<Record<string, number>>({})
    const [activityStreak, setActivityStreak] = React.useState({ current: 0, longest: 0, totalActiveDays: 0 })
    const [activityLoading, setActivityLoading] = React.useState(false)

    React.useEffect(() => {
        fetch("/api/users?role=student")
            .then((r) => r.json())
            .then(setStudents)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    // Helper: get proposal info for a student
    function getStudentProposal(email: string) {
        return proposals.find((p) => p.studentEmail === email)
    }

    const totalStudents = students.length
    const assignedCount = students.filter((s) => s.assignedGuideName || getStudentProposal(s.email)?.supervisor).length
    const unassignedCount = totalStudents - assignedCount

    const filteredStudents = students.filter((s) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch = s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
        if (!matchesSearch) return false
        if (filterDept !== "all" && s.department !== filterDept) return false
        return true
    })

    async function handleAddStudent() {
        if (!addName.trim() || !addEmail.trim() || !addPassword.trim()) {
            setFormError("All fields are required")
            return
        }
        const nameErr = validateName(addName)
        if (nameErr) { setFormError(nameErr); return }
        const emailErr = validateEmail(addEmail)
        if (emailErr) { setFormError(emailErr); return }
        const passErr = validatePassword(addPassword, addName, addEmail)
        if (passErr) { setFormError(passErr); return }
        setFormError("")
        setSaving(true)
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: addName.trim(), email: addEmail.trim(), password: addPassword, role: "student", department: addDept }),
            })
            if (res.ok) {
                const newUser = await res.json()
                setStudents((prev) => [newUser, ...prev])
                setAddName(""); setAddEmail(""); setAddPassword(""); setAddDept("Computer Science")
                setAddOpen(false)
            } else {
                const payload = await res.json().catch(() => ({}))
                setFormError(payload.error ?? "Failed to add student")
            }
        } catch (err) { console.error(err); setFormError("Network error. Please try again.") }
        finally { setSaving(false) }
    }

    function openEditDialog(student: UserDoc) {
        setEditStudent(student)
        setEditName(student.name)
        setEditEmail(student.email)
        setEditDept(student.department || "Computer Science")
        setEditOpen(true)
    }

    async function handleEditStudent() {
        if (!editStudent || !editName.trim() || !editEmail.trim()) {
            setFormError("Name and email are required")
            return
        }
        const nameErr = validateName(editName)
        if (nameErr) { setFormError(nameErr); return }
        const emailErr = validateEmail(editEmail)
        if (emailErr) { setFormError(emailErr); return }
        setFormError("")
        setSaving(true)
        try {
            const res = await fetch(`/api/users/${editStudent._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName.trim(), email: editEmail.trim(), department: editDept }),
            })
            if (res.ok) {
                const updated = await res.json()
                setStudents((prev) => prev.map((s) => s._id === editStudent._id ? updated : s))
                setEditOpen(false); setEditStudent(null)
            } else {
                const payload = await res.json().catch(() => ({}))
                setFormError(payload.error ?? "Failed to update student")
            }
        } catch (err) { console.error(err); setFormError("Network error. Please try again.") }
        finally { setSaving(false) }
    }

    function openDeleteDialog(student: UserDoc) {
        setDeleteTarget(student)
        setDeleteOpen(true)
    }

    async function handleDeleteStudent() {
        if (!deleteTarget) return
        try {
            const res = await fetch(`/api/users/${deleteTarget._id}`, { method: "DELETE" })
            if (res.ok) {
                setStudents((prev) => prev.filter((s) => s._id !== deleteTarget._id))
                setDeleteOpen(false); setDeleteTarget(null)
            }
        } catch (err) { console.error(err) }
    }

    async function openActivity(student: UserDoc) {
        setActivityTarget(student)
        setActivityMap({})
        setActivityStreak({ current: 0, longest: 0, totalActiveDays: 0 })
        setActivityLoading(true)
        setActivityOpen(true)

        try {
            const res = await fetch(`/api/activity?studentEmail=${encodeURIComponent(student.email)}&days=120`)
            if (!res.ok) return
            const data = await res.json()
            setActivityMap(data.activity ?? {})
            setActivityStreak({
                current: data.currentStreak ?? 0,
                longest: data.longestStreak ?? 0,
                totalActiveDays: data.totalActiveDays ?? 0,
            })
        } catch (error) {
            console.error("Failed to load activity", error)
        } finally {
            setActivityLoading(false)
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-96"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Students</h1>
                    <p className="text-sm text-slate-500 mt-1">Add, edit, and manage student accounts</p>
                </div>
                <Button onClick={() => setAddOpen(true)} className="bg-blue-500 hover:bg-blue-600 font-semibold gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> Add New Student
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Users className="w-6 h-6" /></div>
                        <div><p className="text-sm text-slate-500 font-medium">Total Students</p><h3 className="font-bold text-2xl text-slate-900">{totalStudents}</h3></div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-violet-50 text-violet-600 rounded-xl shrink-0"><CheckCircle2 className="w-6 h-6" /></div>
                        <div><p className="text-sm text-slate-500 font-medium">Assigned</p><h3 className="font-bold text-2xl text-slate-900">{assignedCount}</h3></div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-500 rounded-xl shrink-0"><AlertTriangle className="w-6 h-6" /></div>
                        <div><p className="text-sm text-slate-500 font-medium">Unassigned</p><h3 className="font-bold text-2xl text-slate-900">{unassignedCount}</h3></div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-end bg-slate-50/50">
                    <div className="w-full md:max-w-sm space-y-1.5">
                        <Label htmlFor="search-students" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Students</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input id="search-students" placeholder="Search by name or email..." className="pl-9 bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="w-full md:w-64 space-y-1.5">
                        <Label htmlFor="filter-dept" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Department</Label>
                        <Select value={filterDept} onValueChange={setFilterDept}>
                            <SelectTrigger id="filter-dept" className="bg-white"><SelectValue placeholder="All Departments" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                                <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                                <SelectItem value="Computer Science">Computer Science</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

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
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Department</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Guide</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Project Title</TableHead>
                                    <TableHead className="text-right text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider w-36">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400">No students found.</TableCell></TableRow>
                                ) : (
                                    filteredStudents.map((student) => {
                                        const proposal = getStudentProposal(student.email)
                                        const supervisor = student.assignedGuideName || proposal?.supervisor
                                        return (
                                            <TableRow key={student._id} className="hover:bg-slate-50 border-slate-100">
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm text-slate-900">{student.name}</span>
                                                        <span className="text-xs text-slate-500">{student.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4"><span className="text-sm text-slate-700">{student.department || "-"}</span></TableCell>
                                                <TableCell className="py-4">
                                                    {supervisor ? (
                                                        <span className="inline-flex items-center text-xs font-medium text-emerald-700">{supervisor}</span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700">Not Assigned</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-4"><span className="text-sm text-slate-700">{proposal?.title || "-"}</span></TableCell>
                                                <TableCell className="text-right py-4">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100" onClick={() => openActivity(student)}>
                                                            Activity
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => openEditDialog(student)}>
                                                            <Pencil className="w-4 h-4" /><span className="sr-only">Edit</span>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-600 hover:text-rose-800 hover:bg-rose-50" onClick={() => openDeleteDialog(student)}>
                                                            <Trash2 className="w-4 h-4" /><span className="sr-only">Delete</span>
                                                        </Button>
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

            {/* Add Student Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Add Student</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-1.5">
                            <Label>Full Name</Label>
                            <Input placeholder="Ahmed Saeed" value={addName} onChange={(e) => { setAddName(e.target.value); setFormError("") }} />
                            <p className="text-[11px] text-slate-400">Letters, spaces, apostrophes, and hyphens only (3-60 chars)</p>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Email</Label>
                            <Input type="email" placeholder="ahmed@example.com" value={addEmail} onChange={(e) => { setAddEmail(e.target.value); setFormError("") }} />
                            <p className="text-[11px] text-slate-400">Must be a valid email (e.g. user@domain.com)</p>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Password</Label>
                            <Input type="password" placeholder="••••••••" value={addPassword} onChange={(e) => { setAddPassword(e.target.value); setFormError("") }} />
                            <p className="text-[11px] text-slate-400">8-64 chars with uppercase, lowercase, number, and special character</p>
                        </div>
                        <div className="grid gap-2">
                            <Label>Department</Label>
                            <Select value={addDept} onValueChange={setAddDept}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                                    <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                                    <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formError && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">{formError}</p>}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium" onClick={handleAddStudent} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Add Student
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Student Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-1.5">
                            <Label>Full Name</Label>
                            <Input value={editName} onChange={(e) => { setEditName(e.target.value); setFormError("") }} />
                            <p className="text-[11px] text-slate-400">Letters, spaces, apostrophes, and hyphens only (3-60 chars)</p>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Email</Label>
                            <Input type="email" value={editEmail} onChange={(e) => { setEditEmail(e.target.value); setFormError("") }} />
                            <p className="text-[11px] text-slate-400">Must be a valid email (e.g. user@domain.com)</p>
                        </div>
                        <div className="grid gap-2">
                            <Label>Department</Label>
                            <Select value={editDept} onValueChange={setEditDept}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                                    <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                                    <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formError && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">{formError}</p>}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium" onClick={handleEditStudent} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader><DialogTitle>Delete Student</DialogTitle></DialogHeader>
                    <p className="text-sm text-slate-600 py-2">Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteTarget?.name}</span>? This action cannot be undone.</p>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button variant="destructive" onClick={handleDeleteStudent}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader><DialogTitle>Student Activity: {activityTarget?.name}</DialogTitle></DialogHeader>
                    {activityLoading ? (
                        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                    ) : (
                        <div className="space-y-3">
                            <ActivityHeatmap activity={activityMap} days={120} title="Submission Consistency" />
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                                    <p className="text-slate-500">Current Streak</p>
                                    <p className="font-semibold text-slate-800">{activityStreak.current} day{activityStreak.current === 1 ? "" : "s"}</p>
                                </div>
                                <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                                    <p className="text-slate-500">Longest Streak</p>
                                    <p className="font-semibold text-slate-800">{activityStreak.longest} day{activityStreak.longest === 1 ? "" : "s"}</p>
                                </div>
                                <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                                    <p className="text-slate-500">Active Days</p>
                                    <p className="font-semibold text-slate-800">{activityStreak.totalActiveDays} day{activityStreak.totalActiveDays === 1 ? "" : "s"}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
