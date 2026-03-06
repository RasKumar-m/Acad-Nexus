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

interface TeacherDoc {
    _id: string
    name: string
    email: string
    department?: string
    expertise?: string
    maxStudents?: number
    createdAt: string
}

export default function ManageTeachersPage() {
    const [teachers, setTeachers] = React.useState<TeacherDoc[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterDept, setFilterDept] = React.useState("all")

    const [addOpen, setAddOpen] = React.useState(false)
    const [addName, setAddName] = React.useState("")
    const [addEmail, setAddEmail] = React.useState("")
    const [addPassword, setAddPassword] = React.useState("")
    const [addDept, setAddDept] = React.useState("Electrical Engineering")
    const [addExpertise, setAddExpertise] = React.useState("Database Systems")
    const [addMaxStudents, setAddMaxStudents] = React.useState(5)
    const [saving, setSaving] = React.useState(false)

    const [editOpen, setEditOpen] = React.useState(false)
    const [editTeacher, setEditTeacher] = React.useState<TeacherDoc | null>(null)
    const [editName, setEditName] = React.useState("")
    const [editEmail, setEditEmail] = React.useState("")
    const [editDept, setEditDept] = React.useState("Electrical Engineering")
    const [editExpertise, setEditExpertise] = React.useState("Database Systems")
    const [editMaxStudents, setEditMaxStudents] = React.useState(5)

    const [deleteOpen, setDeleteOpen] = React.useState(false)
    const [deleteTarget, setDeleteTarget] = React.useState<TeacherDoc | null>(null)

    React.useEffect(() => {
        fetch("/api/users?role=guide")
            .then((r) => r.json())
            .then(setTeachers)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const totalTeachers = teachers.length
    const departments = new Set(teachers.map((t) => t.department).filter(Boolean)).size

    const filteredTeachers = teachers.filter((t) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch = t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
        if (!matchesSearch) return false
        if (filterDept !== "all" && t.department !== filterDept) return false
        return true
    })

    async function handleAddTeacher() {
        if (!addName.trim() || !addEmail.trim() || !addPassword.trim()) return
        setSaving(true)
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: addName.trim(), email: addEmail.trim(), password: addPassword, role: "guide", department: addDept, expertise: addExpertise, maxStudents: addMaxStudents }),
            })
            if (res.ok) {
                const newUser = await res.json()
                setTeachers((prev) => [newUser, ...prev])
                setAddName(""); setAddEmail(""); setAddPassword(""); setAddDept("Electrical Engineering"); setAddExpertise("Database Systems"); setAddMaxStudents(5)
                setAddOpen(false)
            }
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    function openEditDialog(teacher: TeacherDoc) {
        setEditTeacher(teacher)
        setEditName(teacher.name)
        setEditEmail(teacher.email)
        setEditDept(teacher.department || "Electrical Engineering")
        setEditExpertise(teacher.expertise || "Database Systems")
        setEditMaxStudents(teacher.maxStudents || 5)
        setEditOpen(true)
    }

    async function handleEditTeacher() {
        if (!editTeacher || !editName.trim() || !editEmail.trim()) return
        setSaving(true)
        try {
            const res = await fetch(`/api/users/${editTeacher._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName.trim(), email: editEmail.trim(), department: editDept, expertise: editExpertise, maxStudents: editMaxStudents }),
            })
            if (res.ok) {
                const updated = await res.json()
                setTeachers((prev) => prev.map((t) => t._id === editTeacher._id ? updated : t))
                setEditOpen(false); setEditTeacher(null)
            }
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    async function handleDeleteTeacher() {
        if (!deleteTarget) return
        try {
            const res = await fetch(`/api/users/${deleteTarget._id}`, { method: "DELETE" })
            if (res.ok) {
                setTeachers((prev) => prev.filter((t) => t._id !== deleteTarget._id))
                setDeleteOpen(false); setDeleteTarget(null)
            }
        } catch (err) { console.error(err) }
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-96"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Teachers</h1>
                    <p className="text-sm text-slate-500 mt-1">Add, edit, and manage teacher accounts</p>
                </div>
                <Button onClick={() => setAddOpen(true)} className="bg-blue-500 hover:bg-blue-600 font-semibold gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> Add New Teacher
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Users className="w-6 h-6" /></div>
                        <div><p className="text-sm text-slate-500 font-medium">Total Teachers</p><h3 className="font-bold text-2xl text-slate-900">{totalTeachers}</h3></div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-violet-50 text-violet-600 rounded-xl shrink-0"><CheckCircle2 className="w-6 h-6" /></div>
                        <div><p className="text-sm text-slate-500 font-medium">Showing</p><h3 className="font-bold text-2xl text-slate-900">{filteredTeachers.length}</h3></div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-500 rounded-xl shrink-0"><AlertTriangle className="w-6 h-6" /></div>
                        <div><p className="text-sm text-slate-500 font-medium">Departments</p><h3 className="font-bold text-2xl text-slate-900">{departments}</h3></div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-end bg-slate-50/50">
                    <div className="w-full md:max-w-sm space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Teachers</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search by name or email..." className="pl-9 bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="w-full md:w-64 space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Department</Label>
                        <Select value={filterDept} onValueChange={setFilterDept}>
                            <SelectTrigger className="bg-white"><SelectValue placeholder="All Departments" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                <SelectItem value="Computer Science">Computer Science</SelectItem>
                                <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                                <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                                <SelectItem value="Data Science">Data Science</SelectItem>
                                <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

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
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Joined</TableHead>
                                    <TableHead className="text-right text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider w-28">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTeachers.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400">No teachers found.</TableCell></TableRow>
                                ) : (
                                    filteredTeachers.map((teacher) => (
                                        <TableRow key={teacher._id} className="hover:bg-slate-50 border-slate-100">
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm text-slate-900">{teacher.name}</span>
                                                    <span className="text-xs text-slate-500">{teacher.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4"><span className="text-sm text-slate-700">{teacher.department || "-"}</span></TableCell>
                                            <TableCell className="py-4"><span className="text-sm text-slate-700">{teacher.expertise || "-"}</span></TableCell>
                                            <TableCell className="py-4"><span className="text-sm text-slate-500">{new Date(teacher.createdAt).toLocaleDateString()}</span></TableCell>
                                            <TableCell className="text-right py-4">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => openEditDialog(teacher)}>
                                                        <Pencil className="w-4 h-4" /><span className="sr-only">Edit</span>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-600 hover:text-rose-800 hover:bg-rose-50" onClick={() => { setDeleteTarget(teacher); setDeleteOpen(true) }}>
                                                        <Trash2 className="w-4 h-4" /><span className="sr-only">Delete</span>
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

            {/* Add Teacher Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Add Teacher</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                        <div className="grid gap-2"><Label>Full Name</Label><Input placeholder="Dr. Aneela" value={addName} onChange={(e) => setAddName(e.target.value)} /></div>
                        <div className="grid gap-2"><Label>Email</Label><Input type="email" placeholder="aneela@gmail.com" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} /></div>
                        <div className="grid gap-2"><Label>Password</Label><Input type="password" placeholder="••••••••" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} /></div>
                        <div className="grid gap-2">
                            <Label>Department</Label>
                            <Select value={addDept} onValueChange={setAddDept}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                                    <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                                    <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                                    <SelectItem value="Data Science">Data Science</SelectItem>
                                    <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Expertise</Label>
                            <Select value={addExpertise} onValueChange={setAddExpertise}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Database Systems">Database Systems</SelectItem>
                                    <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                                    <SelectItem value="Web Development">Web Development</SelectItem>
                                    <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                                    <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                                    <SelectItem value="Blockchain Technology">Blockchain Technology</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2"><Label>Max Students</Label><Input type="number" value={addMaxStudents} onChange={(e) => setAddMaxStudents(Number(e.target.value))} min={1} /></div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium" onClick={handleAddTeacher} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Add Teacher
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Teacher Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Edit Teacher</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                        <div className="grid gap-2"><Label>Full Name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
                        <div className="grid gap-2"><Label>Email</Label><Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} /></div>
                        <div className="grid gap-2">
                            <Label>Department</Label>
                            <Select value={editDept} onValueChange={setEditDept}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                                    <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                                    <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                                    <SelectItem value="Data Science">Data Science</SelectItem>
                                    <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Expertise</Label>
                            <Select value={editExpertise} onValueChange={setEditExpertise}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Database Systems">Database Systems</SelectItem>
                                    <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                                    <SelectItem value="Web Development">Web Development</SelectItem>
                                    <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                                    <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                                    <SelectItem value="Blockchain Technology">Blockchain Technology</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2"><Label>Max Students</Label><Input type="number" value={editMaxStudents} onChange={(e) => setEditMaxStudents(Number(e.target.value))} min={1} /></div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium" onClick={handleEditTeacher} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader><DialogTitle>Delete Teacher</DialogTitle></DialogHeader>
                    <p className="text-sm text-slate-600 py-2">Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteTarget?.name}</span>? This action cannot be undone.</p>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button variant="destructive" onClick={handleDeleteTeacher}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
