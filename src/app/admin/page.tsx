"use client"

import * as React from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
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
    Users,
    GraduationCap,
    FileText,
    AlertCircle,
    Clock,
    Plus,
    Search,
    Download,
    CheckCircle2,
    Loader2,
} from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useProposals } from "@/lib/proposal-context"
import { useRouter } from "next/navigation"
import { validateName, validateEmail, validatePassword } from "@/lib/validation"

interface UserDoc {
    _id: string
    name: string
    email: string
    role: string
    department?: string
}

interface FileDoc {
    _id: string
    fileName: string
    fileUrl: string
    studentName: string
    category: string
    createdAt: string
}

export default function AdminDashboard() {
    const { proposals } = useProposals()
    const router = useRouter()

    const [students, setStudents] = React.useState<UserDoc[]>([])
    const [teachers, setTeachers] = React.useState<UserDoc[]>([])
    const [files, setFiles] = React.useState<FileDoc[]>([])
    const [loading, setLoading] = React.useState(true)

    // Add Student dialog
    const [addStudentOpen, setAddStudentOpen] = React.useState(false)
    const [sName, setSName] = React.useState("")
    const [sEmail, setSEmail] = React.useState("")
    const [sPass, setSPass] = React.useState("")
    const [sDept, setSDept] = React.useState("Computer Science")
    const [studentAdded, setStudentAdded] = React.useState(false)
    const [studentSaving, setStudentSaving] = React.useState(false)
    const [studentError, setStudentError] = React.useState("")

    // Add Teacher dialog
    const [addTeacherOpen, setAddTeacherOpen] = React.useState(false)
    const [tName, setTName] = React.useState("")
    const [tEmail, setTEmail] = React.useState("")
    const [tPass, setTPass] = React.useState("")
    const [tDept, setTDept] = React.useState("Electrical Engineering")
    const [tExp, setTExp] = React.useState("Database Systems")
    const [tMax, setTMax] = React.useState(5)
    const [teacherAdded, setTeacherAdded] = React.useState(false)
    const [teacherSaving, setTeacherSaving] = React.useState(false)
    const [teacherError, setTeacherError] = React.useState("")

    // View Reports dialog
    const [reportsOpen, setReportsOpen] = React.useState(false)
    const [fileSearch, setFileSearch] = React.useState("")

    React.useEffect(() => {
        async function fetchAll() {
            try {
                const [studRes, teachRes, fileRes] = await Promise.all([
                    fetch("/api/users?role=student"),
                    fetch("/api/users?role=guide"),
                    fetch("/api/files"),
                ])
                if (studRes.ok) setStudents(await studRes.json())
                if (teachRes.ok) setTeachers(await teachRes.json())
                if (fileRes.ok) setFiles(await fileRes.json())
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    const studentCount = students.length
    const teacherCount = teachers.length
    const pendingCount = proposals.filter((p) => p.status === "pending").length
    const projectCount = proposals.length
    const overdueCount = proposals.filter((p) => {
        if (!p.deadline) return false
        return new Date(p.deadline) < new Date()
    }).length

    const supervisorMap: Record<string, number> = {}
    for (const p of proposals) {
        const sup = p.supervisor || "Unassigned"
        supervisorMap[sup] = (supervisorMap[sup] || 0) + 1
    }
    const chartData = Object.entries(supervisorMap).map(([name, total]) => ({ name, total }))

    const recentActivity = [...proposals]
        .sort((a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime())
        .slice(0, 5)

    const filteredFiles = files.filter((f) => {
        const q = fileSearch.toLowerCase()
        return f.fileName.toLowerCase().includes(q) || f.studentName.toLowerCase().includes(q)
    })

    async function handleAddStudent() {
        if (!sName.trim() || !sEmail.trim() || !sPass.trim()) {
            setStudentError("All fields are required")
            return
        }
        const nameErr = validateName(sName)
        if (nameErr) { setStudentError(nameErr); return }
        const emailErr = validateEmail(sEmail)
        if (emailErr) { setStudentError(emailErr); return }
        const passErr = validatePassword(sPass, sName, sEmail)
        if (passErr) { setStudentError(passErr); return }
        setStudentError("")
        setStudentSaving(true)
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: sName.trim(), email: sEmail.trim(), password: sPass, role: "student", department: sDept }),
            })
            if (res.ok) {
                const newUser = await res.json()
                setStudents((prev) => [newUser, ...prev])
                setStudentAdded(true)
                setTimeout(() => {
                    setStudentAdded(false)
                    setSName(""); setSEmail(""); setSPass(""); setSDept("Computer Science")
                    setAddStudentOpen(false)
                }, 1200)
            } else {
                const payload = await res.json().catch(() => ({}))
                setStudentError(payload.error ?? "Failed to add student")
            }
        } catch (err) {
            console.error("Failed to add student:", err)
            setStudentError("Network error. Please try again.")
        } finally {
            setStudentSaving(false)
        }
    }

    async function handleAddTeacher() {
        if (!tName.trim() || !tEmail.trim() || !tPass.trim()) {
            setTeacherError("All fields are required")
            return
        }
        const nameErr = validateName(tName)
        if (nameErr) { setTeacherError(nameErr); return }
        const emailErr = validateEmail(tEmail)
        if (emailErr) { setTeacherError(emailErr); return }
        const passErr = validatePassword(tPass, tName, tEmail)
        if (passErr) { setTeacherError(passErr); return }
        setTeacherError("")
        setTeacherSaving(true)
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: tName.trim(), email: tEmail.trim(), password: tPass, role: "guide", department: tDept, expertise: tExp, maxStudents: tMax }),
            })
            if (res.ok) {
                const newUser = await res.json()
                setTeachers((prev) => [newUser, ...prev])
                setTeacherAdded(true)
                setTimeout(() => {
                    setTeacherAdded(false)
                    setTName(""); setTEmail(""); setTPass(""); setTDept("Electrical Engineering"); setTExp("Database Systems"); setTMax(5)
                    setAddTeacherOpen(false)
                }, 1200)
            } else {
                const payload = await res.json().catch(() => ({}))
                setTeacherError(payload.error ?? "Failed to add teacher")
            }
        } catch (err) {
            console.error("Failed to add teacher:", err)
            setTeacherError("Network error. Please try again.")
        } finally {
            setTeacherSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            <div className="bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-violet-200 text-sm font-medium mb-1">Welcome back, Admin</p>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
                    <p className="text-violet-200/80 max-w-xl text-sm">Manage the entire Acad Nexus platform — oversee students, teachers, projects, and deadlines.</p>
                </div>
                <div className="absolute -right-10 -top-10 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute -right-5 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-xl" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow bg-white cursor-pointer" onClick={() => router.push("/admin/students")}>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0"><GraduationCap className="w-5 h-5" /></div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Students</p>
                            <h3 className="font-bold text-xl text-slate-900">{studentCount}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow bg-white cursor-pointer" onClick={() => router.push("/admin/teachers")}>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0"><Users className="w-5 h-5" /></div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Teachers</p>
                            <h3 className="font-bold text-xl text-slate-900">{teacherCount}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow bg-white cursor-pointer" onClick={() => router.push("/admin/projects?status=pending")}>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0"><Clock className="w-5 h-5" /></div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Pending</p>
                            <h3 className="font-bold text-xl text-slate-900">{pendingCount}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow bg-white cursor-pointer" onClick={() => router.push("/admin/projects")}>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0"><FileText className="w-5 h-5" /></div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Projects</p>
                            <h3 className="font-bold text-xl text-slate-900">{projectCount}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow bg-white col-span-2 md:col-span-1 cursor-pointer" onClick={() => router.push("/admin/deadlines?status=overdue")}>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0"><AlertCircle className="w-5 h-5" /></div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Overdue</p>
                            <h3 className="font-bold text-xl text-slate-900">{overdueCount}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <Card className="shadow-sm border-slate-100 lg:col-span-2 bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-slate-800">Project Distribution by Supervisor</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-70 w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)', fontSize: '13px' }} />
                                        <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={80} />
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6366f1" />
                                                <stop offset="100%" stopColor="#818cf8" />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm text-slate-400">No projects yet</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100 bg-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-slate-800">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5">
                            {recentActivity.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-6">No recent activity</p>
                            ) : (
                                recentActivity.map((p, idx) => (
                                    <div key={p._id} className="flex gap-4 relative">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 relative z-10 ${p.status === "approved" ? "bg-emerald-400" : p.status === "rejected" ? "bg-rose-400" : "bg-amber-400"}`} />
                                        {idx < recentActivity.length - 1 && <div className="absolute left-1 top-3 -bottom-6 w-px bg-slate-100" />}
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-700 leading-snug">
                                                <span className="font-semibold text-slate-900">{p.studentName}</span>{" "}
                                                {p.status === "pending" ? "submitted a new proposal" : p.status === "approved" ? "proposal was approved" : "proposal was rejected"}: <span className="text-slate-600">{p.title}</span>
                                            </p>
                                            <div className="flex gap-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.status === "approved" ? "bg-emerald-100 text-emerald-700" : p.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                                                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                                </span>
                                                <span className="text-xs text-slate-400">{p.submittedDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-slate-100 mb-6 bg-white">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-800">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button onClick={() => setAddStudentOpen(true)} className="w-full h-11 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 font-semibold gap-2 shadow-sm text-sm rounded-xl" size="lg">
                            <Plus className="w-4 h-4" /> Add Student
                        </Button>
                        <Button onClick={() => setAddTeacherOpen(true)} className="w-full h-11 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 font-semibold gap-2 shadow-sm text-sm rounded-xl" size="lg">
                            <Plus className="w-4 h-4" /> Add Teacher
                        </Button>
                        <Button onClick={() => { setReportsOpen(true); setFileSearch("") }} variant="outline" className="w-full h-11 font-semibold gap-2 text-indigo-600 hover:text-indigo-700 text-sm shadow-sm border-indigo-200 hover:bg-indigo-50 rounded-xl" size="lg">
                            <FileText className="w-4 h-4" /> View Reports
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Add Student</DialogTitle></DialogHeader>
                    {studentAdded ? (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            <p className="text-sm font-semibold text-emerald-700">Student added successfully!</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="qs-name">Full Name</Label>
                                    <Input id="qs-name" placeholder="Ahmed Saeed" value={sName} onChange={(e) => { setSName(e.target.value); setStudentError("") }} />
                                    <p className="text-[11px] text-slate-400">Letters, spaces, apostrophes, and hyphens only (3-60 chars)</p>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="qs-email">Email</Label>
                                    <Input id="qs-email" type="email" placeholder="ahmed@example.com" value={sEmail} onChange={(e) => { setSEmail(e.target.value); setStudentError("") }} />
                                    <p className="text-[11px] text-slate-400">Must be a valid email (e.g. user@domain.com)</p>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="qs-pass">Password</Label>
                                    <Input id="qs-pass" type="password" placeholder="••••••••" value={sPass} onChange={(e) => { setSPass(e.target.value); setStudentError("") }} />
                                    <p className="text-[11px] text-slate-400">8-64 chars with uppercase, lowercase, number, and special character</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qs-dept">Department</Label>
                                    <Select value={sDept} onValueChange={setSDept}>
                                        <SelectTrigger id="qs-dept"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                                            <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                                            <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {studentError && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">{studentError}</p>}
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium" onClick={handleAddStudent} disabled={studentSaving}>
                                    {studentSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Add Student
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={addTeacherOpen} onOpenChange={setAddTeacherOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Add Teacher</DialogTitle></DialogHeader>
                    {teacherAdded ? (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            <p className="text-sm font-semibold text-emerald-700">Teacher added successfully!</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="qt-name">Full Name</Label>
                                    <Input id="qt-name" placeholder="Dr. Aneela" value={tName} onChange={(e) => { setTName(e.target.value); setTeacherError("") }} />
                                    <p className="text-[11px] text-slate-400">Letters, spaces, apostrophes, and hyphens only (3-60 chars)</p>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="qt-email">Email</Label>
                                    <Input id="qt-email" type="email" placeholder="aneela@gmail.com" value={tEmail} onChange={(e) => { setTEmail(e.target.value); setTeacherError("") }} />
                                    <p className="text-[11px] text-slate-400">Must be a valid email (e.g. user@domain.com)</p>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="qt-pass">Password</Label>
                                    <Input id="qt-pass" type="password" placeholder="••••••••" value={tPass} onChange={(e) => { setTPass(e.target.value); setTeacherError("") }} />
                                    <p className="text-[11px] text-slate-400">8-64 chars with uppercase, lowercase, number, and special character</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qt-dept">Department</Label>
                                    <Select value={tDept} onValueChange={setTDept}>
                                        <SelectTrigger id="qt-dept"><SelectValue /></SelectTrigger>
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
                                    <Label htmlFor="qt-exp">Expertise</Label>
                                    <Select value={tExp} onValueChange={setTExp}>
                                        <SelectTrigger id="qt-exp"><SelectValue /></SelectTrigger>
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
                                <div className="grid gap-2"><Label htmlFor="qt-max">Max Students</Label><Input id="qt-max" type="number" value={tMax} onChange={(e) => setTMax(Number(e.target.value))} min={1} /></div>
                                {teacherError && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">{teacherError}</p>}
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0 mt-2">
                                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium" onClick={handleAddTeacher} disabled={teacherSaving}>
                                    {teacherSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Add Teacher
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={reportsOpen} onOpenChange={setReportsOpen}>
                <DialogContent className="sm:max-w-150">
                    <DialogHeader><DialogTitle>All Files</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search by file name or student name" className="pl-9 bg-white" value={fileSearch} onChange={(e) => setFileSearch(e.target.value)} />
                        </div>
                        <div className="space-y-3 pt-2 max-h-80 overflow-y-auto">
                            {filteredFiles.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-6">No files found.</p>
                            ) : (
                                filteredFiles.map((file) => (
                                    <div key={file._id} className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-3 rounded-lg justify-between hover:bg-slate-100 transition-colors">
                                        <div className="space-y-1 overflow-hidden">
                                            <p className="font-medium text-sm text-slate-800 truncate">{file.fileName}</p>
                                            <p className="text-xs text-slate-500 truncate">{file.category} - {file.studentName}</p>
                                        </div>
                                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm" className="h-8 shrink-0 text-blue-600 border-blue-200 hover:bg-blue-50 gap-1.5">
                                                <Download className="w-3.5 h-3.5" />Download
                                            </Button>
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
