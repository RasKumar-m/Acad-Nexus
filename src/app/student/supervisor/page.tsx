"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { UserCheck, GraduationCap, Clock, CalendarDays, Loader2, Mail } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useProposals, type Proposal } from "@/lib/proposal-context"

interface GuideDoc { _id: string; name: string; email: string; department?: string; expertise?: string }

const avatarColors = ["bg-blue-600", "bg-teal-600", "bg-violet-600", "bg-emerald-600", "bg-indigo-600", "bg-slate-500"]

function statusConfig(status: string) {
    switch (status) {
        case "pending": return { label: "Pending", color: "border-amber-300 bg-amber-50 text-amber-700" }
        case "approved": return { label: "Approved", color: "border-emerald-300 bg-emerald-50 text-emerald-700" }
        case "rejected": return { label: "Rejected", color: "border-red-300 bg-red-50 text-red-700" }
        default: return { label: status, color: "border-slate-300 bg-slate-50 text-slate-700" }
    }
}

export default function SupervisorPage() {
    const { user } = useAuth()
    const { proposals, loading: proposalsLoading } = useProposals()
    const [guides, setGuides] = React.useState<GuideDoc[]>([])
    const [loading, setLoading] = React.useState(true)
    const [requestOpen, setRequestOpen] = React.useState(false)
    const [requestTarget, setRequestTarget] = React.useState<GuideDoc | null>(null)
    const [successOpen, setSuccessOpen] = React.useState(false)

    React.useEffect(() => {
        fetch("/api/users?role=guide")
            .then((r) => r.json())
            .then(setGuides)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    // Get the student's latest proposal
    const myProposal: Proposal | undefined = React.useMemo(
        () => proposals.find((p) => p.studentEmail === user?.email),
        [proposals, user?.email]
    )

    // Find the assigned supervisor from guides list
    const assignedGuide = React.useMemo(
        () => myProposal?.supervisor ? guides.find((g) => g.name === myProposal.supervisor) : null,
        [myProposal, guides]
    )

    function handleRequestClick(guide: GuideDoc) {
        setRequestTarget(guide)
        setRequestOpen(true)
    }

    async function handleConfirmRequest() {
        if (!requestTarget || !myProposal) return
        try {
            const res = await fetch(`/api/proposals/${myProposal._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ supervisor: requestTarget.name, guideId: requestTarget._id }),
            })
            if (res.ok) {
                setRequestOpen(false)
                setSuccessOpen(true)
            }
        } catch (err) { console.error(err) }
    }

    if (loading || proposalsLoading) {
        return <div className="flex items-center justify-center min-h-96"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
            {/* Current Supervisor Section */}
            <Card className="shadow-sm border-slate-100">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-lg text-slate-900">Current Supervisor</h2>
                        {assignedGuide && <Badge variant="outline" className="text-xs font-semibold border-emerald-300 bg-emerald-50 text-emerald-700">Assigned</Badge>}
                    </div>
                    <Separator className="mb-5" />

                    {assignedGuide ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                                {assignedGuide.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-slate-900">{assignedGuide.name}</h3>
                                <p className="text-sm text-slate-500">{assignedGuide.department || "N/A"}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</p>
                                        <p className="text-sm text-slate-800 mt-0.5">{assignedGuide.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expertise</p>
                                        <p className="text-sm text-slate-800 mt-0.5">{assignedGuide.expertise || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : myProposal?.supervisor ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="bg-emerald-600 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                                {myProposal.supervisor.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-slate-900">{myProposal.supervisor}</h3>
                                <p className="text-sm text-slate-500">Supervisor assigned to your project</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <UserCheck className="w-10 h-10 mb-3 text-slate-300" />
                            <p className="font-medium text-lg text-slate-500">Supervisor not assigned yet.</p>
                            <p className="text-sm mt-1">Browse available supervisors below to send a request.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Project Details Section */}
            {myProposal && (
                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-6">
                        <h2 className="font-bold text-lg text-slate-900 mb-4">Project Details</h2>
                        <Separator className="mb-5" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Title</p>
                                <p className="text-sm font-semibold text-slate-900">{myProposal.title}</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Deadline</p>
                                <p className="text-sm text-slate-800">{myProposal.deadline || "No deadline set"}</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</p>
                                <Badge variant="outline" className={`text-xs font-semibold ${statusConfig(myProposal.status).color}`}>{statusConfig(myProposal.status).label}</Badge>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted</p>
                                <p className="text-sm text-slate-800">{myProposal.submittedDate || new Date(myProposal.createdAt || "").toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="space-y-1.5 mt-6">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{myProposal.description}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Available Supervisors */}
            {!myProposal?.supervisor && (
                <Card className="shadow-sm border-slate-100 mb-8">
                    <CardContent className="p-6">
                        <div className="mb-4">
                            <h2 className="font-bold text-lg text-slate-900">Available Supervisors</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Browse and request supervision from available faculty members</p>
                        </div>
                        <Separator className="mb-5" />

                        {guides.length === 0 ? (
                            <p className="text-center text-slate-400 py-8">No supervisors available at this time.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {guides.map((guide, idx) => (
                                    <Card key={guide._id} className="shadow-sm border-slate-100 hover:shadow-md transition-shadow">
                                        <CardContent className="p-5 flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`${avatarColors[idx % avatarColors.length]} w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                                    {guide.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-sm text-slate-900 truncate">{guide.name}</h3>
                                                    <p className="text-xs text-slate-500">{guide.department || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2.5">
                                                <div><p className="text-xs font-semibold text-slate-500">Email</p><p className="text-sm text-slate-800 truncate">{guide.email}</p></div>
                                                <div><p className="text-xs font-semibold text-slate-500">Expertise</p><p className="text-sm text-slate-800">{guide.expertise || "N/A"}</p></div>
                                            </div>
                                            <Button className="w-full gap-2 bg-blue-500 hover:bg-blue-600 text-white mt-auto" disabled={!myProposal} onClick={() => handleRequestClick(guide)}>
                                                <UserCheck className="w-4 h-4" /> Request Supervisor
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Request Confirmation Dialog */}
            <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-600" /> Request Supervisor</DialogTitle>
                    </DialogHeader>
                    {requestTarget && (
                        <div className="py-3 space-y-4">
                            <p className="text-sm text-slate-600">Are you sure you want to send a supervision request to:</p>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">{requestTarget.name.charAt(0)}</div>
                                    <div><p className="font-semibold text-sm text-slate-900">{requestTarget.name}</p><p className="text-xs text-slate-500">{requestTarget.department || "N/A"}</p></div>
                                </div>
                                <Separator className="my-2" />
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div><p className="text-xs text-slate-500">Email</p><p className="text-xs font-medium text-slate-800 truncate">{requestTarget.email}</p></div>
                                    <div><p className="text-xs text-slate-500">Expertise</p><p className="text-xs font-medium text-slate-800">{requestTarget.expertise || "N/A"}</p></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleConfirmRequest}><UserCheck className="w-4 h-4" /> Send Request</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Dialog */}
            <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
                <DialogContent className="sm:max-w-sm text-center">
                    <div className="flex flex-col items-center gap-4 py-6">
                        <div className="p-3 bg-emerald-100 rounded-full"><GraduationCap className="w-8 h-8 text-emerald-600" /></div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Request Sent!</h3>
                            <p className="text-sm text-slate-500 mt-1">Your supervision request has been sent to <span className="font-semibold">{requestTarget?.name}</span>.</p>
                        </div>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8" onClick={() => { setSuccessOpen(false); window.location.reload() }}>Done</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
