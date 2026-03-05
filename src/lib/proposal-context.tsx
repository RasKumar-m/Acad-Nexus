"use client"

import * as React from "react"

// ─── Types ──────────────────────────────────────────────────────────
export type ProposalStatus = "pending" | "approved" | "rejected"

export interface ProposalRemark {
    id: number
    from: string
    fromRole: "Admin" | "Teacher"
    message: string
    date: string
    action?: "approved" | "rejected" | "feedback"
}

export interface Proposal {
    id: number
    title: string
    description: string
    studentName: string
    studentEmail: string
    status: ProposalStatus
    submittedDate: string
    supervisor: string | null
    deadline: string | null
    remarks: ProposalRemark[]
    files: { name: string; url: string }[]
}

interface ProposalContextType {
    proposals: Proposal[]
    addProposal: (title: string, description: string, studentName: string, studentEmail: string) => Proposal
    updateProposalStatus: (id: number, status: ProposalStatus, remarkFrom: string, remarkRole: "Admin" | "Teacher", remarkMessage: string) => void
    addRemark: (id: number, from: string, fromRole: "Admin" | "Teacher", message: string) => void
    getProposalsByStudent: (email: string) => Proposal[]
    getProposalById: (id: number) => Proposal | undefined
}

// ─── Initial Mock Data ──────────────────────────────────────────────
const initialProposals: Proposal[] = [
    {
        id: 1,
        title: "Smart Deadline & Project Tracking System",
        description:
            "This project is a web-based system designed to help universities manage student projects and their deadlines efficiently. Supervisors can assign deadlines to approved projects, while students can easily view their project status and submission dates. The system provides real-time updates, role-based access, and a clear overview of project progress, making project management simple, transparent, and organized.",
        studentName: "Ahmed Saeed",
        studentEmail: "ahmed.saeed@student.edu",
        status: "pending",
        submittedDate: "1 January 2026",
        supervisor: null,
        deadline: null,
        remarks: [],
        files: [{ name: "Zeeshan Khan (1).docx", url: "#" }],
    },
    {
        id: 2,
        title: "Online Examination & Result Portal",
        description:
            "A comprehensive portal for conducting online exams and managing student results efficiently with real-time grading, analytics and reporting capabilities. The system supports multiple question types, auto-grading, and detailed performance analytics for both students and faculty.",
        studentName: "Muhammad Zeeshan",
        studentEmail: "zeeshan.khan@student.edu",
        status: "approved",
        submittedDate: "1 January 2026",
        supervisor: "Ms. Ayesha Malik",
        deadline: "2026-03-10",
        remarks: [
            { id: 1, from: "System Admin", fromRole: "Admin", message: "Proposal looks good. Approved and assigned to Ms. Ayesha Malik.", date: "2 January 2026", action: "approved" },
        ],
        files: [{ name: "Proposal_OEP.pdf", url: "#" }],
    },
    {
        id: 3,
        title: "Crime Reporting & Analysis Web App",
        description:
            "A web application for reporting crimes and analyzing crime data to assist law enforcement agencies with pattern detection and resource allocation. Features include geolocation mapping, real-time alerts, statistical dashboards, and anonymous reporting capabilities.",
        studentName: "Areeba Fatima",
        studentEmail: "areeba.fatima@student.edu",
        status: "approved",
        submittedDate: "1 January 2026",
        supervisor: "Dr. Ahmed Raza",
        deadline: "2020-01-20",
        remarks: [
            { id: 1, from: "System Admin", fromRole: "Admin", message: "Interesting topic. Approved.", date: "3 January 2026", action: "approved" },
        ],
        files: [{ name: "Crime_App_Spec.pdf", url: "#" }],
    },
    {
        id: 4,
        title: "Inventory Management System for SMEs",
        description:
            "An inventory management platform tailored for small & medium enterprises to track stock levels, manage orders and generate automated reports. The system includes barcode scanning, low-stock alerts, supplier management, and financial reporting.",
        studentName: "Maryam Iqbal",
        studentEmail: "maryam.iqbal@student.edu",
        status: "approved",
        submittedDate: "1 January 2026",
        supervisor: "Ms. Ayesha Malik",
        deadline: "2029-10-10",
        remarks: [
            { id: 1, from: "System Admin", fromRole: "Admin", message: "Approved. Please coordinate with your supervisor for the first meeting.", date: "3 January 2026", action: "approved" },
        ],
        files: [{ name: "IMS_Requirements.docx", url: "#" }],
    },
    {
        id: 5,
        title: "E-Learning Management System (LMS)",
        description:
            "This project is an online learning platform designed to facilitate course management, student assessments, progress tracking and analytics for educational institutions. Features include video lectures, quizzes, assignment submissions, and grade tracking.",
        studentName: "Hira Aslam",
        studentEmail: "hira.aslam@student.edu",
        status: "approved",
        submittedDate: "1 January 2026",
        supervisor: "Dr. Ahmed Raza",
        deadline: "2050-10-10",
        remarks: [
            { id: 1, from: "System Admin", fromRole: "Admin", message: "Good proposal. Approved.", date: "2 January 2026", action: "approved" },
        ],
        files: [{ name: "LMS_Proposal.pdf", url: "#" }],
    },
    {
        id: 6,
        title: "Online Auction Management Platform",
        description:
            "This project is a web-based online auction system that enables users to list items, place bids in real-time and manage auction events with a transparent and secure bidding mechanism. Includes user verification, payment integration, and auction history.",
        studentName: "Laiba Noor",
        studentEmail: "laiba.noor@student.edu",
        status: "approved",
        submittedDate: "8 January 2026",
        supervisor: "Dr. Ahmed Raza",
        deadline: "2029-10-10",
        remarks: [
            { id: 1, from: "System Admin", fromRole: "Admin", message: "Well-written proposal. Approved and assigned.", date: "10 January 2026", action: "approved" },
        ],
        files: [{ name: "Auction_Final.pdf", url: "#" }],
    },
]

// ─── Context ────────────────────────────────────────────────────────
const ProposalContext = React.createContext<ProposalContextType>({
    proposals: [],
    addProposal: () => initialProposals[0],
    updateProposalStatus: () => {},
    addRemark: () => {},
    getProposalsByStudent: () => [],
    getProposalById: () => undefined,
})

export function useProposals() {
    return React.useContext(ProposalContext)
}

// ─── Provider ───────────────────────────────────────────────────────
export function ProposalProvider({ children }: { children: React.ReactNode }) {
    const [proposals, setProposals] = React.useState<Proposal[]>(initialProposals)

    const addProposal = React.useCallback((title: string, description: string, studentName: string, studentEmail: string): Proposal => {
        const newProposal: Proposal = {
            id: Date.now(),
            title,
            description,
            studentName,
            studentEmail,
            status: "pending",
            submittedDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
            supervisor: null,
            deadline: null,
            remarks: [],
            files: [],
        }
        setProposals((prev) => [newProposal, ...prev])
        return newProposal
    }, [])

    const updateProposalStatus = React.useCallback((id: number, status: ProposalStatus, remarkFrom: string, remarkRole: "Admin" | "Teacher", remarkMessage: string) => {
        setProposals((prev) =>
            prev.map((p) => {
                if (p.id !== id) return p
                const newRemark: ProposalRemark = {
                    id: Date.now(),
                    from: remarkFrom,
                    fromRole: remarkRole,
                    message: remarkMessage,
                    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
                    action: status === "approved" ? "approved" : "rejected",
                }
                return { ...p, status, remarks: [...p.remarks, newRemark] }
            })
        )
    }, [])

    const addRemark = React.useCallback((id: number, from: string, fromRole: "Admin" | "Teacher", message: string) => {
        setProposals((prev) =>
            prev.map((p) => {
                if (p.id !== id) return p
                const newRemark: ProposalRemark = {
                    id: Date.now(),
                    from,
                    fromRole,
                    message,
                    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
                    action: "feedback",
                }
                return { ...p, remarks: [...p.remarks, newRemark] }
            })
        )
    }, [])

    const getProposalsByStudent = React.useCallback((email: string) => {
        return proposals.filter((p) => p.studentEmail === email)
    }, [proposals])

    const getProposalById = React.useCallback((id: number) => {
        return proposals.find((p) => p.id === id)
    }, [proposals])

    const value = React.useMemo(
        () => ({ proposals, addProposal, updateProposalStatus, addRemark, getProposalsByStudent, getProposalById }),
        [proposals, addProposal, updateProposalStatus, addRemark, getProposalsByStudent, getProposalById]
    )

    return <ProposalContext.Provider value={value}>{children}</ProposalContext.Provider>
}
