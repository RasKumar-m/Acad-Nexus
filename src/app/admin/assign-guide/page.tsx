"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, CheckCircle2, AlertTriangle, Search, Check, Loader2 } from "lucide-react"
import { useProposals } from "@/lib/proposal-context"

interface GuideDoc {
    _id: string
    name: string
    email: string
    department?: string
    maxStudents?: number
}

interface StudentDoc {
    _id: string
    name: string
    email: string
    department?: string
    assignedGuideId?: string | null
    assignedGuideName?: string | null
}

export default function AssignGuidePage() {
    const { proposals, refreshProposals } = useProposals()
    const [guides, setGuides] = React.useState<GuideDoc[]>([])
    const [students, setStudents] = React.useState<StudentDoc[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterStatus, setFilterStatus] = React.useState("all")
    const [filterGuide, setFilterGuide] = React.useState("all")
    const [rowSelections, setRowSelections] = React.useState<Record<string, string>>({})
    const [savedRows, setSavedRows] = React.useState<Set<string>>(new Set())
    const [savingRows, setSavingRows] = React.useState<Set<string>>(new Set())
    const [loadError, setLoadError] = React.useState("")

    const loadData = React.useCallback(async () => {
        setLoading(true)
        setLoadError("")
        try {
            const [guideRes, studentRes] = await Promise.all([
                fetch("/api/users?role=guide"),
                fetch("/api/users?role=student"),
            ])

            if (guideRes.ok) {
                const g: GuideDoc[] = await guideRes.json()
                setGuides(g)
            } else {
                setLoadError("Failed to load guides")
            }
            if (studentRes.ok) {
                const s: StudentDoc[] = await studentRes.json()
                setStudents(s)
            } else {
                setLoadError("Failed to load students")
            }
        } catch (error) {
            console.error("Failed to load assignment data:", error)
            setLoadError("Network error. Please check your connection and try again.")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        loadData()
    }, [loadData])

    const proposalsByEmail = React.useMemo(() => {
        const map: Record<string, typeof proposals> = {}
        for (const p of proposals) {
            const key = p.studentEmail.toLowerCase()
            if (!map[key]) map[key] = []
            map[key].push(p)
        }
        return map
    }, [proposals])

    React.useEffect(() => {
        const init: Record<string, string> = {}
        for (const s of students) {
            if (s.assignedGuideId) {
                init[s._id] = s.assignedGuideId
                continue
            }
            const studentProposals = proposalsByEmail[s.email.toLowerCase()] ?? []
            const firstWithGuide = studentProposals.find((p) => p.supervisor)
            if (firstWithGuide?.supervisor) {
                const g = guides.find((guide) => guide.name === firstWithGuide.supervisor)
                if (g) init[s._id] = g._id
            }
        }
        setRowSelections(init)
    }, [students, guides, proposalsByEmail])

    const guideLoadMap = React.useMemo(() => {
        const counts: Record<string, number> = {}
        for (const s of students) {
            const gid = s.assignedGuideId
            if (gid) counts[gid] = (counts[gid] ?? 0) + 1
        }
        return counts
    }, [students])

    const assignedCount = students.filter((s) => s.assignedGuideId || s.assignedGuideName).length
    const unassignedCount = students.length - assignedCount

    const filtered = students.filter((s) => {
        const q = searchQuery.toLowerCase()
        const proposalsForStudent = proposalsByEmail[s.email.toLowerCase()] ?? []
        const latestProposal = proposalsForStudent[0]
        const matchesSearch =
            s.name.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            (latestProposal?.title ?? "").toLowerCase().includes(q)

        if (!matchesSearch) return false

        const hasGuide = Boolean(s.assignedGuideId || s.assignedGuideName)
        if (filterStatus === "assigned" && !hasGuide) return false
        if (filterStatus === "unassigned" && hasGuide) return false

        if (filterGuide !== "all") {
            if ((s.assignedGuideId ?? "") !== filterGuide) return false
        }

        return true
    })

    function handleSelectGuide(studentId: string, guideId: string) {
        setRowSelections((prev) => ({ ...prev, [studentId]: guideId }))
        setSavedRows((prev) => {
            const next = new Set(prev)
            next.delete(studentId)
            return next
        })
    }

    async function syncStudentProposals(student: StudentDoc, guide: GuideDoc | null) {
        const studentProposals = proposalsByEmail[student.email.toLowerCase()] ?? []
        if (studentProposals.length === 0) return

        await Promise.all(
            studentProposals.map((p) =>
                fetch(`/api/proposals/${p._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        supervisor: guide ? guide.name : null,
                        guideId: guide ? guide._id : null,
                    }),
                })
            )
        )
    }

    async function handleAssign(student: StudentDoc) {
        const guideId = rowSelections[student._id]
        if (!guideId) return
        const guide = guides.find((g) => g._id === guideId)
        if (!guide) return

        setSavingRows((prev) => new Set(prev).add(student._id))
        try {
            const res = await fetch(`/api/users/${student._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignedGuideId: guide._id,
                    assignedGuideName: guide.name,
                }),
            })

            if (res.ok) {
                await syncStudentProposals(student, guide)
                await refreshProposals()
                setStudents((prev) =>
                    prev.map((s) =>
                        s._id === student._id
                            ? { ...s, assignedGuideId: guide._id, assignedGuideName: guide.name }
                            : s
                    )
                )
                setSavedRows((prev) => new Set(prev).add(student._id))
                setTimeout(() => {
                    setSavedRows((prev) => {
                        const next = new Set(prev)
                        next.delete(student._id)
                        return next
                    })
                }, 2000)
            }
        } catch (error) {
            console.error("Failed to assign guide:", error)
        } finally {
            setSavingRows((prev) => {
                const next = new Set(prev)
                next.delete(student._id)
                return next
            })
        }
    }

    async function handleUnassign(student: StudentDoc) {
        setSavingRows((prev) => new Set(prev).add(student._id))
        try {
            const res = await fetch(`/api/users/${student._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignedGuideId: null,
                    assignedGuideName: null,
                }),
            })

            if (res.ok) {
                await syncStudentProposals(student, null)
                await refreshProposals()
                setStudents((prev) =>
                    prev.map((s) =>
                        s._id === student._id
                            ? { ...s, assignedGuideId: null, assignedGuideName: null }
                            : s
                    )
                )
                setRowSelections((prev) => {
                    const next = { ...prev }
                    delete next[student._id]
                    return next
                })
            }
        } catch (error) {
            console.error("Failed to unassign guide:", error)
        } finally {
            setSavingRows((prev) => {
                const next = new Set(prev)
                next.delete(student._id)
                return next
            })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        )
    }

    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96 gap-4">
                <AlertTriangle className="w-10 h-10 text-rose-400" />
                <p className="text-sm text-slate-600">{loadError}</p>
                <Button onClick={loadData} className="bg-blue-500 hover:bg-blue-600 text-white">
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assign Supervisor</h1>
                    <p className="text-sm text-slate-500 mt-1">Assign or reassign guides for every student from one place.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0"><CheckCircle2 className="w-6 h-6" /></div>
                        <div><p className="text-sm text-slate-500 font-medium">Assigned Students</p><h3 className="font-bold text-2xl text-slate-900">{assignedCount}</h3></div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-rose-50 text-rose-500 rounded-xl shrink-0"><AlertTriangle className="w-6 h-6" /></div>
                        <div><p className="text-sm text-slate-500 font-medium">Unassigned Students</p><h3 className="font-bold text-2xl text-slate-900">{unassignedCount}</h3></div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Users className="w-6 h-6" /></div>
                        <div><p className="text-sm text-slate-500 font-medium">Available Teachers</p><h3 className="font-bold text-2xl text-slate-900">{guides.length}</h3></div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-end bg-slate-50/50">
                    <div className="w-full md:max-w-md space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Students</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search by student, email, or project title..." className="pl-9 bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="w-full md:w-56 space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Status</Label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="bg-white"><SelectValue placeholder="All Students" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Students</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full md:w-64 space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Guide</Label>
                        <Select value={filterGuide} onValueChange={setFilterGuide}>
                            <SelectTrigger className="bg-white"><SelectValue placeholder="All Guides" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Guides</SelectItem>
                                {guides.map((guide) => (
                                    <SelectItem key={guide._id} value={guide._id}>{guide.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="p-0">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-slate-800">Student Assignments</h2>
                        <span className="text-xs text-slate-400 font-medium">{filtered.length} student{filtered.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="min-w-56 text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Student</TableHead>
                                    <TableHead className="min-w-56 text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Project Title</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Current Supervisor</TableHead>
                                    <TableHead className="min-w-56 text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Assign Supervisor</TableHead>
                                    <TableHead className="text-right text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider w-32">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400">No students found.</TableCell></TableRow>
                                ) : (
                                    filtered.map((student) => {
                                        const isSaved = savedRows.has(student._id)
                                        const isSaving = savingRows.has(student._id)
                                        const currentSelection = rowSelections[student._id] ?? ""
                                        const currentGuide = student.assignedGuideId ? guides.find((g) => g._id === student.assignedGuideId) : null
                                        const hasChanged = currentSelection !== (currentGuide?._id ?? "")
                                        const studentProposals = proposalsByEmail[student.email.toLowerCase()] ?? []
                                        const latestProposal = studentProposals[0]

                                        return (
                                            <TableRow key={student._id} className="hover:bg-slate-50 border-slate-100">
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm text-slate-900">{student.name}</span>
                                                        <span className="text-xs text-slate-500">{student.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4"><span className="text-sm text-slate-700">{latestProposal?.title ?? "No proposal yet"}</span></TableCell>
                                                <TableCell className="py-4">
                                                    {student.assignedGuideName ? (
                                                        <span className="inline-flex items-center text-xs font-medium text-emerald-700">{student.assignedGuideName}</span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700">Not Assigned</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Select value={currentSelection} onValueChange={(v) => handleSelectGuide(student._id, v)}>
                                                        <SelectTrigger className="w-full h-8 text-xs bg-white"><SelectValue placeholder="Select Supervisor" /></SelectTrigger>
                                                        <SelectContent>
                                                            {guides.map((guide) => {
                                                                const count = guideLoadMap[guide._id] ?? 0
                                                                const max = guide.maxStudents ?? 5
                                                                const isAtCapacity = count >= max && guide._id !== student.assignedGuideId
                                                                return (
                                                                    <SelectItem key={guide._id} value={guide._id} disabled={isAtCapacity}>
                                                                        {guide.name} ({count}/{max})
                                                                    </SelectItem>
                                                                )
                                                            })}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-right py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            className={`w-full text-xs ${isSaved ? "bg-emerald-500 hover:bg-emerald-600" : "bg-blue-500 hover:bg-blue-600"}`}
                                                            onClick={() => handleAssign(student)}
                                                            disabled={!currentSelection || isSaving || !hasChanged}
                                                        >
                                                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                                                            {isSaved ? (<><Check className="w-3.5 h-3.5 mr-1" /> Saved</>) : "Assign"}
                                                        </Button>
                                                        {student.assignedGuideId && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="w-full text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                                                                onClick={() => handleUnassign(student)}
                                                                disabled={isSaving}
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
