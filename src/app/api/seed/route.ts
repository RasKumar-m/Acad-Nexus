import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Proposal from "@/models/Proposal"

const seedUsers = [
    {
        name: "System Admin",
        email: "admin@acad.edu",
        password: "admin123",
        role: "admin" as const,
        department: "",
        expertise: "",
    },
    {
        name: "Prof. Sana Khan",
        email: "sana.khan@university.edu",
        password: "guide123",
        role: "guide" as const,
        department: "Data Science",
        expertise: "Machine Learning",
    },
    {
        name: "Dr. Ahmed Raza",
        email: "ahmed.raza@university.edu",
        password: "guide123",
        role: "guide" as const,
        department: "Computer Science",
        expertise: "Artificial Intelligence",
    },
    {
        name: "Ms. Ayesha Malik",
        email: "ayesha.malik@university.edu",
        password: "guide123",
        role: "guide" as const,
        department: "Electrical Engineering",
        expertise: "Cybersecurity",
    },
    {
        name: "Ahmed Saeed",
        email: "ahmed.saeed@student.edu",
        password: "student123",
        role: "student" as const,
        department: "Software Engineering",
        expertise: "",
    },
]

export async function GET() {
    try {
        await dbConnect()

        // ── Seed Users ──────────────────────────────────────
        const userResults = []
        const userIdMap: Record<string, string> = {}

        for (const u of seedUsers) {
            let existing = await User.findOne({ email: u.email })
            if (existing) {
                userResults.push({ email: u.email, status: "already exists" })
                userIdMap[u.email] = existing._id.toString()
                continue
            }

            const hashedPassword = await bcrypt.hash(u.password, 12)
            existing = await User.create({
                name: u.name,
                email: u.email,
                password: hashedPassword,
                role: u.role,
                department: u.department || "",
                expertise: u.expertise || "",
            })
            userResults.push({ email: u.email, status: "created" })
            userIdMap[u.email] = existing._id.toString()
        }

        // ── Seed Proposals ──────────────────────────────────
        const proposalResults = []
        const existingCount = await Proposal.countDocuments()

        if (existingCount === 0) {
            const studentId = userIdMap["ahmed.saeed@student.edu"]

            const seedProposals = [
                {
                    title: "Smart Deadline & Project Tracking System",
                    description:
                        "This project is a web-based system designed to help universities manage student projects and their deadlines efficiently. Supervisors can assign deadlines to approved projects, while students can easily view their project status and submission dates. The system provides real-time updates, role-based access, and a clear overview of project progress, making project management simple, transparent, and organized.",
                    studentId,
                    studentName: "Ahmed Saeed",
                    studentEmail: "ahmed.saeed@student.edu",
                    status: "pending",
                    supervisor: null,
                    deadline: null,
                    remarks: [],
                    files: [],
                },
                {
                    title: "Online Examination & Result Portal",
                    description:
                        "A comprehensive portal for conducting online exams and managing student results efficiently with real-time grading, analytics and reporting capabilities.",
                    studentId,
                    studentName: "Muhammad Zeeshan",
                    studentEmail: "zeeshan.khan@student.edu",
                    status: "approved",
                    supervisor: "Ms. Ayesha Malik",
                    deadline: "2026-03-10",
                    remarks: [
                        { from: "System Admin", fromRole: "Admin", message: "Proposal looks good. Approved and assigned to Ms. Ayesha Malik.", action: "approved", createdAt: new Date("2026-01-02") },
                    ],
                    files: [],
                },
                {
                    title: "Crime Reporting & Analysis Web App",
                    description:
                        "A web application for reporting crimes and analyzing crime data to assist law enforcement agencies with pattern detection and resource allocation.",
                    studentId,
                    studentName: "Areeba Fatima",
                    studentEmail: "areeba.fatima@student.edu",
                    status: "approved",
                    supervisor: "Dr. Ahmed Raza",
                    deadline: "2026-04-20",
                    remarks: [
                        { from: "System Admin", fromRole: "Admin", message: "Interesting topic. Approved.", action: "approved", createdAt: new Date("2026-01-03") },
                    ],
                    files: [],
                },
                {
                    title: "Inventory Management System for SMEs",
                    description:
                        "An inventory management platform tailored for small & medium enterprises to track stock levels, manage orders and generate automated reports.",
                    studentId,
                    studentName: "Maryam Iqbal",
                    studentEmail: "maryam.iqbal@student.edu",
                    status: "approved",
                    supervisor: "Ms. Ayesha Malik",
                    deadline: "2026-06-15",
                    remarks: [
                        { from: "System Admin", fromRole: "Admin", message: "Approved. Please coordinate with your supervisor.", action: "approved", createdAt: new Date("2026-01-03") },
                    ],
                    files: [],
                },
                {
                    title: "E-Learning Management System (LMS)",
                    description:
                        "An online learning platform designed to facilitate course management, student assessments, progress tracking and analytics for educational institutions.",
                    studentId,
                    studentName: "Hira Aslam",
                    studentEmail: "hira.aslam@student.edu",
                    status: "approved",
                    supervisor: "Dr. Ahmed Raza",
                    deadline: "2026-05-20",
                    remarks: [
                        { from: "System Admin", fromRole: "Admin", message: "Good proposal. Approved.", action: "approved", createdAt: new Date("2026-01-02") },
                    ],
                    files: [],
                },
                {
                    title: "Online Auction Management Platform",
                    description:
                        "A web-based online auction system that enables users to list items, place bids in real-time and manage auction events with a transparent and secure bidding mechanism.",
                    studentId,
                    studentName: "Laiba Noor",
                    studentEmail: "laiba.noor@student.edu",
                    status: "approved",
                    supervisor: "Dr. Ahmed Raza",
                    deadline: "2026-07-10",
                    remarks: [
                        { from: "System Admin", fromRole: "Admin", message: "Well-written proposal. Approved and assigned.", action: "approved", createdAt: new Date("2026-01-10") },
                    ],
                    files: [],
                },
            ]

            await Proposal.insertMany(seedProposals)
            proposalResults.push({ status: "created", count: seedProposals.length })
        } else {
            proposalResults.push({ status: "already seeded", count: existingCount })
        }

        return NextResponse.json({
            status: "success",
            message: "Seed completed",
            users: userResults,
            proposals: proposalResults,
        })
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json(
            { status: "error", message },
            { status: 500 }
        )
    }
}
