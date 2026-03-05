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
} from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const chartData = [
    { name: "Dr. Ahmed Raza", total: 3 },
    { name: "Ms. Ayesha Malik", total: 2 },
]

const allFiles = [
    { name: "Solar Hybrid Invertor Parts List (1) (1) (3).pdf", project: "E-Learning Management System (LMS)", student: "Hira Aslam" },
    { name: "Solar Hybrid Invertor Parts List (1) (1).pdf", project: "Online Auction Management Platform", student: "Laiba Noor" },
    { name: "Zeeshan Khan (1).docx", project: "Smart Deadline & Project Tracking System", student: "Ahmed Saeed" },
    { name: "Proposal_OEP.pdf", project: "Online Examination & Result Portal", student: "Muhammad Zeeshan" },
    { name: "Crime_App_Spec.pdf", project: "Crime Reporting & Analysis Web App", student: "Areeba Fatima" },
    { name: "IMS_Requirements.docx", project: "Inventory Management System for SMEs", student: "Maryam Iqbal" },
]

export default function AdminDashboard() {
    // Add Student dialog
    const [addStudentOpen, setAddStudentOpen] = React.useState(false)
    const [sName, setSName] = React.useState("")
    const [sEmail, setSEmail] = React.useState("")
    const [sPass, setSPass] = React.useState("")
    const [sDept, setSDept] = React.useState("cs")
    const [studentAdded, setStudentAdded] = React.useState(false)

    // Add Teacher dialog
    const [addTeacherOpen, setAddTeacherOpen] = React.useState(false)
    const [tName, setTName] = React.useState("")
    const [tEmail, setTEmail] = React.useState("")
    const [tPass, setTPass] = React.useState("")
    const [tDept, setTDept] = React.useState("ee")
    const [tExp, setTExp] = React.useState("db")
    const [tMax, setTMax] = React.useState(1)
    const [teacherAdded, setTeacherAdded] = React.useState(false)

    // View Reports dialog
    const [reportsOpen, setReportsOpen] = React.useState(false)
    const [fileSearch, setFileSearch] = React.useState("")

    const filteredFiles = allFiles.filter((f) => {
        const q = fileSearch.toLowerCase()
        return f.name.toLowerCase().includes(q) || f.project.toLowerCase().includes(q) || f.student.toLowerCase().includes(q)
    })

    function handleAddStudent() {
        if (!sName.trim() || !sEmail.trim()) return
        // Mock: show success and reset
        setStudentAdded(true)
        setTimeout(() => {
            setStudentAdded(false)
            setSName("")
            setSEmail("")
            setSPass("")
            setSDept("cs")
            setAddStudentOpen(false)
        }, 1500)
    }

    function handleAddTeacher() {
        if (!tName.trim() || !tEmail.trim()) return
        setTeacherAdded(true)
        setTimeout(() => {
            setTeacherAdded(false)
            setTName("")
            setTEmail("")
            setTPass("")
            setTDept("ee")
            setTExp("db")
            setTMax(1)
            setAddTeacherOpen(false)
        }, 1500)
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">

            {/* Welcome Banner */}
            <div className="bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-violet-200 text-sm font-medium mb-1">Welcome back, Admin</p>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
                    <p className="text-violet-200/80 max-w-xl text-sm">Manage the entire Acad Nexus platform — oversee students, teachers, projects, and deadlines.</p>
                </div>
                <div className="absolute -right-10 -top-10 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute -right-5 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-xl" />
            </div>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Students</p>
                            <h3 className="font-bold text-xl text-slate-900">6</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Teachers</p>
                            <h3 className="font-bold text-xl text-slate-900">5</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Pending</p>
                            <h3 className="font-bold text-xl text-slate-900">2</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Projects</p>
                            <h3 className="font-bold text-xl text-slate-900">5</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow bg-white col-span-2 md:col-span-1">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5 uppercase tracking-wider">Overdue</p>
                            <h3 className="font-bold text-xl text-slate-900">0</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Project Distribution Chart */}
                <Card className="shadow-sm border-slate-100 lg:col-span-2 bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-slate-800">Project Distribution by Supervisor</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-70 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)', fontSize: '13px' }}
                                    />
                                    <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={80} />
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#818cf8" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="shadow-sm border-slate-100 bg-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-slate-800">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5">

                            <div className="flex gap-4 relative">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-amber-400 shrink-0 relative z-10" />
                                <div className="absolute left-1 top-3 -bottom-6 w-px bg-slate-100" />
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-700 leading-snug">
                                        <span className="font-semibold text-slate-900">Maryam Iqbal</span> has requested Prof. Sana Khan to be their supervisor.
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Request</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">Medium</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 relative">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-amber-400 shrink-0 relative z-10" />
                                <div className="absolute left-1 top-3 -bottom-6 w-px bg-slate-100" />
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-700 leading-snug">
                                        <span className="font-semibold text-slate-900">Hira Aslam</span> has requested Ms. Ayesha Malik to be their supervisor.
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Request</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">Medium</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 relative">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-amber-400 shrink-0 relative z-10" />
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-700 leading-snug">
                                        <span className="font-semibold text-slate-900">Laiba Noor</span> has requested Mr. Bilal Hussain to be their supervisor.
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Request</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">Medium</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
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

            {/* ─── Add Student Dialog ──────────────────────────── */}
            <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Student</DialogTitle>
                    </DialogHeader>
                    {studentAdded ? (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            <p className="text-sm font-semibold text-emerald-700">Student added successfully!</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="qs-name">Full Name</Label>
                                    <Input id="qs-name" placeholder="Ahmed Saeed" value={sName} onChange={(e) => setSName(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qs-email">Email</Label>
                                    <Input id="qs-email" type="email" placeholder="ahmed@example.com" value={sEmail} onChange={(e) => setSEmail(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qs-pass">Password</Label>
                                    <Input id="qs-pass" type="password" placeholder="••••••••" value={sPass} onChange={(e) => setSPass(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qs-dept">Department</Label>
                                    <Select value={sDept} onValueChange={setSDept}>
                                        <SelectTrigger id="qs-dept"><SelectValue placeholder="Select Department" /></SelectTrigger>
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
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* ─── Add Teacher Dialog ─────────────────────────── */}
            <Dialog open={addTeacherOpen} onOpenChange={setAddTeacherOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Teacher</DialogTitle>
                    </DialogHeader>
                    {teacherAdded ? (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            <p className="text-sm font-semibold text-emerald-700">Teacher added successfully!</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                                <div className="grid gap-2">
                                    <Label htmlFor="qt-name">Full Name</Label>
                                    <Input id="qt-name" placeholder="Dr. Aneela" value={tName} onChange={(e) => setTName(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qt-email">Email</Label>
                                    <Input id="qt-email" type="email" placeholder="aneela@gmail.com" value={tEmail} onChange={(e) => setTEmail(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qt-pass">Password</Label>
                                    <Input id="qt-pass" type="password" placeholder="••••••••" value={tPass} onChange={(e) => setTPass(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qt-dept">Department</Label>
                                    <Select value={tDept} onValueChange={setTDept}>
                                        <SelectTrigger id="qt-dept"><SelectValue placeholder="Select Department" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cs">Computer Science</SelectItem>
                                            <SelectItem value="ee">Electrical Engineering</SelectItem>
                                            <SelectItem value="se">Software Engineering</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qt-exp">Expertise</Label>
                                    <Select value={tExp} onValueChange={setTExp}>
                                        <SelectTrigger id="qt-exp"><SelectValue placeholder="Select Expertise" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="db">Database Systems</SelectItem>
                                            <SelectItem value="ml">Machine Learning</SelectItem>
                                            <SelectItem value="web">Web Development</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qt-max">Max Students</Label>
                                    <Input id="qt-max" type="number" value={tMax} onChange={(e) => setTMax(Number(e.target.value))} min={1} />
                                </div>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0 mt-2">
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="button" className="bg-blue-500 hover:bg-blue-600 text-white font-medium" onClick={handleAddTeacher}>Add Teacher</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* ─── View Reports Dialog ────────────────────────── */}
            <Dialog open={reportsOpen} onOpenChange={setReportsOpen}>
                <DialogContent className="sm:max-w-150">
                    <DialogHeader>
                        <DialogTitle>All Files</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by file name, project title, or student name"
                                className="pl-9 bg-white"
                                value={fileSearch}
                                onChange={(e) => setFileSearch(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3 pt-2 max-h-80 overflow-y-auto">
                            {filteredFiles.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-6">No files found.</p>
                            ) : (
                                filteredFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-3 rounded-lg justify-between hover:bg-slate-100 transition-colors">
                                        <div className="space-y-1 overflow-hidden">
                                            <p className="font-medium text-sm text-slate-800 truncate">{file.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{file.project} - {file.student}</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-8 shrink-0 text-blue-600 border-blue-200 hover:bg-blue-50 gap-1.5">
                                            <Download className="w-3.5 h-3.5" />
                                            Download
                                        </Button>
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
