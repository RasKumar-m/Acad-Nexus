"use client"

import * as React from "react"
import { useSession } from "next-auth/react"

// ─── Types ──────────────────────────────────────────────────────────
export type ProposalStatus = "pending" | "approved" | "rejected" | "completed"

export interface ProposalRemark {
    _id?: string
    id?: number          // kept for backward compat in UI
    from: string
    fromRole: "Admin" | "Teacher"
    message: string
    date: string
    createdAt?: string
    action?: "approved" | "rejected" | "feedback"
}

export interface Proposal {
    _id: string
    id?: number          // kept for backward compat in UI
    title: string
    description: string
    studentName: string
    studentEmail: string
    status: ProposalStatus
    submittedDate?: string
    createdAt?: string
    supervisor: string | null
    deadline: string | null
    attachedFileUrl: string | null
    attachedFileType: string | null
    remarks: ProposalRemark[]
    files: { name: string; url: string }[]
}

interface ProposalContextType {
    proposals: Proposal[]
    loading: boolean
    refreshProposals: () => Promise<void>
    addProposal: (title: string, description: string, studentName: string, studentEmail: string, studentId: string, attachedFileUrl?: string, attachedFileType?: string) => Promise<Proposal>
    editProposal: (id: string, updates: { title?: string; description?: string }) => Promise<void>
    deleteProposal: (id: string) => Promise<void>
    updateProposalStatus: (id: string, status: ProposalStatus, remarkFrom: string, remarkRole: "Admin" | "Teacher", remarkMessage: string) => Promise<void>
    addRemark: (id: string, from: string, fromRole: "Admin" | "Teacher", message: string) => Promise<void>
    getProposalsByStudent: (email: string) => Proposal[]
    getProposalById: (id: string) => Proposal | undefined
}

// ─── Helpers ────────────────────────────────────────────────────────
function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}

/** Normalise a raw DB document into the Proposal shape the UI expects */
function normalise(raw: Record<string, unknown>): Proposal {
    const remarks = (
        (raw.remarks as Record<string, unknown>[]) ?? []
    ).map((r) => ({
        ...r,
        _id: String(r._id ?? ""),
        id: undefined as unknown as number,
        from: String(r.from ?? ""),
        fromRole: (r.fromRole ?? "Admin") as "Admin" | "Teacher",
        message: String(r.message ?? ""),
        date: formatDate(r.createdAt as string),
        createdAt: String(r.createdAt ?? ""),
        action: (r.action ?? "feedback") as "approved" | "rejected" | "feedback",
    }))

    return {
        _id: String(raw._id ?? ""),
        title: String(raw.title ?? ""),
        description: String(raw.description ?? ""),
        studentName: String(raw.studentName ?? ""),
        studentEmail: String(raw.studentEmail ?? ""),
        status: (raw.status ?? "pending") as ProposalStatus,
        submittedDate: formatDate(raw.createdAt as string),
        createdAt: String(raw.createdAt ?? ""),
        supervisor: (raw.supervisor as string) ?? null,
        deadline: (raw.deadline as string) ?? null,
        attachedFileUrl: (raw.attachedFileUrl as string) ?? null,
        attachedFileType: (raw.attachedFileType as string) ?? null,
        remarks,
        files: (raw.files as { name: string; url: string }[]) ?? [],
    }
}

// ─── Context ────────────────────────────────────────────────────────
const ProposalContext = React.createContext<ProposalContextType>({
    proposals: [],
    loading: true,
    refreshProposals: async () => {},
    addProposal: async () => ({} as Proposal),
    editProposal: async () => {},
    deleteProposal: async () => {},
    updateProposalStatus: async () => {},
    addRemark: async () => {},
    getProposalsByStudent: () => [],
    getProposalById: () => undefined,
})

export function useProposals() {
    return React.useContext(ProposalContext)
}

// ─── Provider ───────────────────────────────────────────────────────
export function ProposalProvider({ children }: { children: React.ReactNode }) {
    const [proposals, setProposals] = React.useState<Proposal[]>([])
    const [loading, setLoading] = React.useState(true)
    const { status } = useSession()

    // ── Fetch all proposals ─────────────────────────────────────────
    const refreshProposals = React.useCallback(async () => {
        try {
            const res = await fetch("/api/proposals")
            if (!res.ok) throw new Error("Failed to fetch proposals")
            const data: Record<string, unknown>[] = await res.json()
            setProposals(data.map(normalise))
        } catch (err) {
            console.error("refreshProposals:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    // Only fetch when session is authenticated
    React.useEffect(() => {
        if (status === "authenticated") {
            refreshProposals()
        } else if (status === "unauthenticated") {
            setProposals([])
            setLoading(false)
        }
    }, [status, refreshProposals])

    // ── Create ──────────────────────────────────────────────────────
    const addProposal = React.useCallback(
        async (title: string, description: string, studentName: string, studentEmail: string, studentId: string, attachedFileUrl?: string, attachedFileType?: string): Promise<Proposal> => {
            const res = await fetch("/api/proposals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, studentId, studentName, studentEmail, attachedFileUrl, attachedFileType }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error ?? "Failed to create proposal")
            }
            const raw: Record<string, unknown> = await res.json()
            const created = normalise(raw)
            setProposals((prev) => [created, ...prev])
            return created
        },
        []
    )

    // ── Helper: create a notification for the student ──────────────
    const notifyStudent = React.useCallback(
        async (studentEmail: string, type: string, title: string, message: string) => {
            try {
                await fetch("/api/notifications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userEmail: studentEmail, type, title, message }),
                })
            } catch (err) {
                console.error("Failed to create notification:", err)
            }
        },
        []
    )

    // ── Edit proposal ───────────────────────────────────────────────
    const editProposal = React.useCallback(
        async (id: string, updates: { title?: string; description?: string }) => {
            const res = await fetch(`/api/proposals/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            })
            if (!res.ok) throw new Error("Failed to edit proposal")
            const raw: Record<string, unknown> = await res.json()
            const updated = normalise(raw)
            setProposals((prev) => prev.map((p) => (p._id === id ? updated : p)))
        },
        []
    )

    // ── Delete proposal ─────────────────────────────────────────────
    const deleteProposal = React.useCallback(
        async (id: string) => {
            const res = await fetch(`/api/proposals/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete proposal")
            setProposals((prev) => prev.filter((p) => p._id !== id))
        },
        []
    )

    // ── Update status (with remark) ─────────────────────────────────
    const updateProposalStatus = React.useCallback(
        async (id: string, status: ProposalStatus, remarkFrom: string, remarkRole: "Admin" | "Teacher", remarkMessage: string) => {
            const res = await fetch(`/api/proposals/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    remark: {
                        from: remarkFrom,
                        fromRole: remarkRole,
                        message: remarkMessage,
                        action: status as string,
                    },
                }),
            })
            if (!res.ok) throw new Error("Failed to update proposal status")
            const raw: Record<string, unknown> = await res.json()
            const updated = normalise(raw)
            setProposals((prev) => prev.map((p) => (p._id === id ? updated : p)))

            // Create notification for the student
            const notifTitle =
                status === "approved" ? "Proposal Approved" :
                status === "rejected" ? "Proposal Rejected" :
                status === "completed" ? "Project Completed" : "Proposal Updated"
            const notifType = status === "approved" || status === "completed" ? "assignment" : status === "rejected" ? "system" : "proposal"
            await notifyStudent(
                updated.studentEmail,
                notifType,
                notifTitle,
                `Your proposal "${updated.title}" has been ${status} by ${remarkFrom}. ${remarkMessage}`
            )
        },
        [notifyStudent]
    )

    // ── Add remark ──────────────────────────────────────────────────
    const addRemark = React.useCallback(
        async (id: string, from: string, fromRole: "Admin" | "Teacher", message: string) => {
            const res = await fetch(`/api/proposals/${id}/remarks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ from, fromRole, message, action: "feedback" }),
            })
            if (!res.ok) throw new Error("Failed to add remark")
            const raw: Record<string, unknown> = await res.json()
            const updated = normalise(raw)
            setProposals((prev) => prev.map((p) => (p._id === id ? updated : p)))

            // Notify student about new feedback
            await notifyStudent(
                updated.studentEmail,
                "feedback",
                "New Feedback Received",
                `${from} left feedback on your proposal "${updated.title}": ${message}`
            )
        },
        [notifyStudent]
    )

    // ── Queries ─────────────────────────────────────────────────────
    const getProposalsByStudent = React.useCallback(
        (email: string) => proposals.filter((p) => p.studentEmail === email),
        [proposals]
    )

    const getProposalById = React.useCallback(
        (id: string) => proposals.find((p) => p._id === id),
        [proposals]
    )

    const value = React.useMemo(
        () => ({
            proposals,
            loading,
            refreshProposals,
            addProposal,
            editProposal,
            deleteProposal,
            updateProposalStatus,
            addRemark,
            getProposalsByStudent,
            getProposalById,
        }),
        [proposals, loading, refreshProposals, addProposal, editProposal, deleteProposal, updateProposalStatus, addRemark, getProposalsByStudent, getProposalById, notifyStudent]
    )

    return <ProposalContext.Provider value={value}>{children}</ProposalContext.Provider>
}
