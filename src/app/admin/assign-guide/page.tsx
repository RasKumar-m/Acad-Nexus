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

interface GuideDoc { _id: string; name: string; email: string; department?: string; expertise?: string; maxStudents?: number }

export default function AssignGuidePage() {
    const { proposals, refreshProposals } = useProposals()
    const [guides, setGuides] = React.useState<GuideDoc[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterStatus, setFilterStatus] = React.useState("all")
    const [rowSelections, setRowSelections] = React.useState<Record<string, string>>({})
    const [savedRows, setSavedRows] = React.useState<Set<string>>(new Set())
    const [savingRows, setSavingRows] = React.useState<Set<string>>(new Set())

    React.useEffect(() => {
        fetch("/api/users?role=guide")
            .then((r) => r.json())
            .then(setGuides)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    // Initialize selections from existing proposals
    React.useEffect(() => {
        const init: Record<string, string> = {}
        for (const p of proposals) {
            if (p.supervisor) {
                const g = guides.find((g) => g.name === p.supervisor)
                if (g) init[p._id] = g._id
            }
        }
        setRowSelections(init)
    }, [proposals, guides])

    // Only show approved/pending proposals (ones that should have guides)
    const assignable = proposals.filter((p) => p.status === "approved" || p.status === "pending")

    const assignedCount = assignable.filter((p) => p.supervisor !== null).length
    const unassignedCount = assignable.length - assignedCount

    const filtered = assignable.filter((p) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch = p.studentName.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.studentEmail.toLowerCase().includes(q)
        if (!matchesSearch) return false
        if (filterStatus === "assigned") return p.supervisor !== null
        if (filterStatus === "unassigned") return p.supervisor === null
        return true
    })

    function handleSelectGuide(proposalId: string, guideId: string) {
        setRowSelections((prev) => ({ ...prev, [proposalId]: guideId }))
        setSavedRows((prev) => { const next = new Set(prev); next.delete(proposalId); return next })
    }

    async function handleAssign(proposalId: string) {
        const guideId = rowSelections[proposalId]
        if (!guideId) return
        const guide = guides.find((g) => g._id === guideId)
        if (!guide) return

        setSavingRows((prev) => new Set(prev).add(proposalId))
        try {
            const res = await fetch(`/api/proposals/${proposalId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ supervisor: guide.name, guideId: guide._id }),
            })
            if (res.ok) {
                await refreshProposals()
                setSavedRows((prev) => new Set(prev).add(proposalId))
                setTimeout(() => setSavedRows((prev) => { const next = new Set(prev); next.delete(proposalId); return next }), 2000)
            }
        } catch (err) { console.error(err) }
        finally { setSavingRows((prev) => { const next = new Set(prev); next.delete(proposalId); return next }) }
    }

    async function handleUnassign(proposalId: string) {
        setSavingRows((prev) => new Set(prev).add(proposalId))
        try {
            const res = await fetch(`/api/proposals/${proposalId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ supervisor: null, guideId: null }),
            })
            if (res.ok) {
                await refreshProposals()
                setRowSelections((prev) => { const next = { ...prev }; delete next[proposalId]; return next })
            }
        } catch (err) { console.error(err) }
        finally { setSavingRows((prev) => { const next = new Set(prev); next.delete(proposalId); return next }) }
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-96"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assign Supervisor</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage supervisor assignments for students and projects</p>
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
                            <Input placeholder="Search by student name or project title..." className="pl-9 bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="w-full md:w-64 space-y-1.5">
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
                                    <TableHead className="min-w-48 text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Student</TableHead>
                                    <TableHead className="min-w-56 text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Project Title</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Current Supervisor</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Deadline</TableHead>
                                    <TableHead className="min-w-52 text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Assign Supervisor</TableHead>
                                    <TableHead className="text-right text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider w-28">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="h-32 text-center text-slate-400">No students found.</TableCell></TableRow>
                                ) : (
                                    filtered.map((p) => {
                                        const isSaved = savedRows.has(p._id)
                                        const isSaving = savingRows.has(p._id)
                                        const currentSelection = rowSelections[p._id] ?? ""
                                        const currentGuide = guides.find((g) => g.name === p.supervisor)
                                        const hasChanged = currentSelection !== (currentGuide?._id ?? "")

                                        return (
                                            <TableRow key={p._id} className="hover:bg-slate-50 border-slate-100">
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm text-slate-900">{p.studentName}</span>
                                                        <span className="text-xs text-slate-500">{p.studentEmail}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4"><span className="text-sm text-slate-700">{p.title}</span></TableCell>
                                                <TableCell className="py-4">
                                                    {p.supervisor ? (
                                                        <span className="inline-flex items-center text-xs font-medium text-emerald-700">{p.supervisor}</span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700">Not Assigned</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-4"><span className="text-sm text-slate-700">{p.deadline ?? "-"}</span></TableCell>
                                                <TableCell className="py-4">
                                                    <Select value={currentSelection} onValueChange={(v) => handleSelectGuide(p._id, v)}>
                                                        <SelectTrigger className="w-full h-8 text-xs bg-white"><SelectValue placeholder="Select Supervisor" /></SelectTrigger>
                                                        <SelectContent>
                                                            {guides.map((g) => (
                                                                <SelectItem key={g._id} value={g._id}>{g.name} ({g.department || "N/A"})</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-right py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            className={`w-full text-xs ${isSaved ? "bg-emerald-500 hover:bg-emerald-600" : "bg-blue-500 hover:bg-blue-600"}`}
                                                            onClick={() => handleAssign(p._id)}
                                                            disabled={!currentSelection || isSaving}
                                                        >
                                                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                                                            {isSaved ? (<><Check className="w-3.5 h-3.5 mr-1" /> Saved</>) : p.supervisor && !hasChanged ? "Assigned" : "Assign"}
                                                        </Button>
                                                        {p.supervisor && (
                                                            <Button size="sm" variant="outline" className="w-full text-xs text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => handleUnassign(p._id)} disabled={isSaving}>
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
