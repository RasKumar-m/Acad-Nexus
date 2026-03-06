"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarClock, Clock, AlertTriangle, CheckCircle2, Search, CalendarDays, FileText, User, Users, Edit, Loader2 } from "lucide-react"
import { useProposals, type Proposal } from "@/lib/proposal-context"
import { useSearchParams } from "next/navigation"

function getDeadlineStatus(deadline: string | null) {
    if (!deadline) return { label: "Not Set", color: "bg-slate-100 text-slate-600" }
    const d = new Date(deadline)
    const now = new Date()
    if (d < now) return { label: "Overdue", color: "bg-rose-100 text-rose-700" }
    const diff = d.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days <= 30) return { label: "Due Soon", color: "bg-amber-100 text-amber-700" }
    return { label: "On Track", color: "bg-emerald-100 text-emerald-700" }
}

export default function ManageDeadlinesPage() {
    const { proposals, refreshProposals } = useProposals()
    const searchParams = useSearchParams()
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filterStatus, setFilterStatus] = React.useState(searchParams.get("status") ?? "all")

    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [projectSearch, setProjectSearch] = React.useState("")
    const [showSuggestions, setShowSuggestions] = React.useState(false)
    const [selectedProject, setSelectedProject] = React.useState<Proposal | null>(null)
    const [deadlineValue, setDeadlineValue] = React.useState("")
    const [saving, setSaving] = React.useState(false)
    const suggestionsRef = React.useRef<HTMLDivElement>(null)

    const totalDeadlines = proposals.length
    const setDeadlinesCount = proposals.filter((p) => p.deadline).length
    const overdueCount = proposals.filter((p) => getDeadlineStatus(p.deadline).label === "Overdue").length
    const dueSoonCount = proposals.filter((p) => getDeadlineStatus(p.deadline).label === "Due Soon").length

    const filtered = proposals.filter((p) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch = p.studentName.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.studentEmail.toLowerCase().includes(q)
        if (!matchesSearch) return false
        if (filterStatus === "all") return true
        const status = getDeadlineStatus(p.deadline).label
        if (filterStatus === "overdue") return status === "Overdue"
        if (filterStatus === "due-soon") return status === "Due Soon"
        if (filterStatus === "on-track") return status === "On Track"
        if (filterStatus === "not-set") return status === "Not Set"
        return true
    })

    const suggestions = projectSearch.length >= 1
        ? proposals.filter((p) => p.title.toLowerCase().includes(projectSearch.toLowerCase()) || p.studentName.toLowerCase().includes(projectSearch.toLowerCase()))
        : []

    React.useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) setShowSuggestions(false)
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    function openCreateDialog() {
        setProjectSearch(""); setSelectedProject(null); setDeadlineValue(""); setDialogOpen(true)
    }

    function openEditDialog(proposal: Proposal) {
        setSelectedProject(proposal)
        setProjectSearch(proposal.title)
        setDeadlineValue(proposal.deadline || "")
        setDialogOpen(true)
    }

    function handleSelectProject(project: Proposal) {
        setSelectedProject(project); setProjectSearch(project.title); setShowSuggestions(false)
    }

    async function handleSaveDeadline() {
        if (!selectedProject) return
        setSaving(true)
        try {
            const res = await fetch(`/api/proposals/${selectedProject._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deadline: deadlineValue || null }),
            })
            if (res.ok) {
                await refreshProposals()
                setDialogOpen(false)
            }
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Deadlines</h1>
                    <p className="text-sm text-slate-500 mt-1">Create and monitor project deadlines</p>
                </div>
                <Button onClick={openCreateDialog} className="bg-blue-500 hover:bg-blue-600 font-semibold gap-2 shadow-sm">
                    <CalendarDays className="w-4 h-4" /> Create / Update Deadline
                </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0"><CalendarClock className="w-5 h-5" /></div>
                        <div className="min-w-0"><p className="text-xs text-slate-500 font-medium truncate">Total Projects</p><h3 className="font-bold text-xl text-slate-900">{totalDeadlines}</h3></div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0"><CheckCircle2 className="w-5 h-5" /></div>
                        <div className="min-w-0"><p className="text-xs text-slate-500 font-medium truncate">Deadlines Set</p><h3 className="font-bold text-xl text-slate-900">{setDeadlinesCount}</h3></div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0"><AlertTriangle className="w-5 h-5" /></div>
                        <div className="min-w-0"><p className="text-xs text-slate-500 font-medium truncate">Overdue</p><h3 className="font-bold text-xl text-slate-900">{overdueCount}</h3></div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0"><Clock className="w-5 h-5" /></div>
                        <div className="min-w-0"><p className="text-xs text-slate-500 font-medium truncate">Due Soon</p><h3 className="font-bold text-xl text-slate-900">{dueSoonCount}</h3></div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-end bg-slate-50/50">
                    <div className="w-full md:max-w-sm space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Deadlines</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search by project or student..." className="pl-9 bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="w-full md:w-56 space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Status</Label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="bg-white"><SelectValue placeholder="All Deadlines" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Deadlines</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                                <SelectItem value="due-soon">Due Soon</SelectItem>
                                <SelectItem value="on-track">On Track</SelectItem>
                                <SelectItem value="not-set">Not Set</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="p-0">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-slate-800">Project Deadlines</h2>
                        <span className="text-xs text-slate-400 font-medium">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-50 text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Student</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Project Title</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider hidden md:table-cell">Supervisor</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider">Deadline</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider hidden lg:table-cell">Submitted</TableHead>
                                    <TableHead className="text-right text-xs font-semibold text-slate-500 h-10 uppercase tracking-wider w-24">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="h-32 text-center text-slate-400">No deadlines found.</TableCell></TableRow>
                                ) : (
                                    filtered.map((p) => {
                                        const status = getDeadlineStatus(p.deadline)
                                        return (
                                            <TableRow key={p._id} className="hover:bg-slate-50 border-slate-100">
                                                <TableCell className="py-3.5">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm text-slate-900">{p.studentName}</span>
                                                        <span className="text-xs text-slate-500 truncate max-w-45">{p.studentEmail}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3.5"><span className="text-sm text-slate-700 line-clamp-1">{p.title}</span></TableCell>
                                                <TableCell className="py-3.5 hidden md:table-cell">
                                                    {p.supervisor ? (
                                                        <span className="text-sm font-medium text-emerald-700">{p.supervisor}</span>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs border-rose-200 text-rose-600 bg-rose-50">Not Assigned</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-3.5">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm text-slate-700">{p.deadline || "-"}</span>
                                                        <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.color}`}>{status.label}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3.5 hidden lg:table-cell">
                                                    <span className="text-xs text-slate-500">{p.submittedDate || new Date(p.createdAt || "").toLocaleDateString()}</span>
                                                </TableCell>
                                                <TableCell className="text-right py-3.5">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => openEditDialog(p)}>
                                                        <Edit className="w-4 h-4" /><span className="sr-only">Edit deadline</span>
                                                    </Button>
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

            {/* Create / Update Deadline Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="text-lg">Create or Update Deadline</DialogTitle></DialogHeader>
                    <div className="grid gap-5 py-2">
                        <div className="grid gap-2 relative" ref={suggestionsRef}>
                            <Label className="text-sm font-medium text-slate-700">Project Title</Label>
                            <div className="relative">
                                <Input placeholder="Start typing to search projects..." value={projectSearch} onChange={(e) => { setProjectSearch(e.target.value); setShowSuggestions(true); if (!e.target.value) setSelectedProject(null) }} onFocus={() => { if (projectSearch.length >= 1) setShowSuggestions(true) }} className="pr-9" autoComplete="off" />
                                <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {suggestions.map((project) => (
                                        <button key={project._id} type="button" onClick={() => handleSelectProject(project)} className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{project.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{project.studentName} &middot; {project.supervisor || "No supervisor"}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {showSuggestions && projectSearch.length >= 1 && suggestions.length === 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center">
                                    <p className="text-sm text-slate-400">No projects found</p>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-sm font-medium text-slate-700">Deadline</Label>
                            <Input type="date" value={deadlineValue} onChange={(e) => setDeadlineValue(e.target.value)} className="w-full" />
                        </div>

                        {selectedProject && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50/60 overflow-hidden">
                                <div className="px-4 py-3 bg-slate-100/80 border-b border-slate-200">
                                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2"><FileText className="w-4 h-4 text-slate-500" /> Project Details</h4>
                                </div>
                                <div className="p-4 space-y-3">
                                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{selectedProject.description}</p>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</p>
                                            <Badge className={`text-xs ${selectedProject.status === "approved" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}`} variant="outline">
                                                {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Supervisor</p>
                                            <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" />{selectedProject.supervisor || "Not Assigned"}</p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Student</p>
                                        <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" />{selectedProject.studentName} <span className="text-slate-400 mx-0.5">-</span> <span className="text-xs text-slate-500 truncate">{selectedProject.studentEmail}</span></p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <DialogClose asChild><Button variant="outline" className="border-slate-300 text-slate-700">Cancel</Button></DialogClose>
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium" disabled={!selectedProject || saving} onClick={handleSaveDeadline}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                            <CalendarDays className="w-4 h-4 mr-1.5" /> Save Deadline
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
