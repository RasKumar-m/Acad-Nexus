import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"
import User from "@/models/User"
import UploadedFile from "@/models/UploadedFile"
import { requireRole } from "@/lib/auth-guard"
import * as XLSX from "xlsx"

// GET /api/export — Admin-only: generate .xlsx with all project data
export async function GET() {
    const { res } = await requireRole("admin")
    if (res) return res

    try {
        await dbConnect()

        const [proposals, students, guides, files] = await Promise.all([
            Proposal.find().sort({ createdAt: -1 }).lean(),
            User.find({ role: "student" }).lean(),
            User.find({ role: "guide" }).lean(),
            UploadedFile.find().sort({ createdAt: -1 }).lean(),
        ])

        // Build student lookup by email for department info
        const studentMap = new Map<string, { department?: string }>()
        for (const s of students) {
            studentMap.set((s.email as string).toLowerCase(), { department: s.department as string | undefined })
        }

        // Build file count lookup by student email
        const fileCountMap = new Map<string, number>()
        for (const f of files) {
            const email = (f.studentEmail as string).toLowerCase()
            fileCountMap.set(email, (fileCountMap.get(email) || 0) + 1)
        }

        // ─── Sheet 1: Projects Overview ─────────────────────────
        const projectRows = proposals.map((p, idx) => {
            const milestones = (p.milestones as Array<{ status?: string }>) || []
            const totalMilestones = milestones.length
            const completedMilestones = milestones.filter((m) => m.status === "reviewed").length
            const submittedMilestones = milestones.filter((m) => m.status === "submitted").length
            const pendingMilestones = milestones.filter((m) => m.status === "pending").length

            const members = (p.teamMembers as Array<{ name?: string; email?: string; rollNumber?: string }>) || []
            const teamMemberNames = members.map((m) => m.name || "").join(", ") || (p.studentName as string) || "N/A"
            const teamMemberEmails = members.map((m) => m.email || "").join(", ") || (p.studentEmail as string) || "N/A"
            const primaryEmail = members[0]?.email || (p.studentEmail as string) || ""
            const studentDept = studentMap.get(primaryEmail.toLowerCase())?.department || "N/A"

            // Sum file counts across all team members
            const teamFileCount = members.length > 0
                ? members.reduce((sum, m) => sum + (fileCountMap.get((m.email || "").toLowerCase()) || 0), 0)
                : fileCountMap.get((p.studentEmail as string || "").toLowerCase()) || 0

            return {
                "S.No": idx + 1,
                "Project Title": p.title,
                "Description": p.description,
                "Team Leader": p.studentName || (members[0]?.name ?? "N/A"),
                "Team Members": teamMemberNames,
                "Team Emails": teamMemberEmails,
                "Team Size": members.length || 1,
                "Department": studentDept,
                "Assigned Guide": p.supervisor || "Not Assigned",
                "Status": (p.status as string).charAt(0).toUpperCase() + (p.status as string).slice(1),
                "Deadline": p.deadline || "Not Set",
                "Total Milestones": totalMilestones,
                "Completed Milestones": completedMilestones,
                "Submitted Milestones": submittedMilestones,
                "Pending Milestones": pendingMilestones,
                "Files Uploaded": teamFileCount,
                "Submitted Date": p.createdAt ? new Date(p.createdAt as string | Date).toLocaleDateString("en-US") : "N/A",
            }
        })

        // ─── Sheet 2: Students Summary ──────────────────────────
        const studentRows = students.map((s, idx) => {
            const email = (s.email as string).toLowerCase()
            // Find proposal where student is a team member, or fall back to legacy studentEmail
            const proposal = proposals.find((p) => {
                const members = (p.teamMembers as Array<{ email?: string }>) || []
                if (members.length > 0) return members.some((m) => (m.email || "").toLowerCase() === email)
                return (p.studentEmail as string || "").toLowerCase() === email
            })
            const teamMembers = proposal ? ((proposal.teamMembers as Array<{ name?: string }>) || []) : []
            return {
                "S.No": idx + 1,
                "Student Name": s.name,
                "Email": s.email,
                "Department": s.department || "N/A",
                "Assigned Guide": s.assignedGuideName || proposal?.supervisor || "Not Assigned",
                "Project Title": proposal?.title || "No Proposal",
                "Project Status": proposal ? (proposal.status as string).charAt(0).toUpperCase() + (proposal.status as string).slice(1) : "N/A",
                "Team Size": teamMembers.length || (proposal ? 1 : 0),
                "Deadline": proposal?.deadline || "Not Set",
                "Files Uploaded": fileCountMap.get(email) || 0,
            }
        })

        // ─── Sheet 3: Guides Summary ────────────────────────────
        const guideRows = guides.map((g, idx) => {
            const assignedProposals = proposals.filter((p) => p.supervisor === g.name)
            return {
                "S.No": idx + 1,
                "Guide Name": g.name,
                "Email": g.email,
                "Department": g.department || "N/A",
                "Expertise": g.expertise || "N/A",
                "Max Students": g.maxStudents ?? 5,
                "Assigned Students": assignedProposals.length,
                "Approved Projects": assignedProposals.filter((p) => p.status === "approved").length,
                "Completed Projects": assignedProposals.filter((p) => p.status === "completed").length,
                "Pending Reviews": assignedProposals.filter((p) => p.status === "pending").length,
            }
        })

        // ─── Sheet 4: Milestones Detail ─────────────────────────
        const milestoneRows: Record<string, string | number>[] = []
        let mIdx = 1
        for (const p of proposals) {
            const milestones = (p.milestones as Array<{
                title?: string; description?: string; dueDate?: string; status?: string;
                submissionLink?: string; linkType?: string; fileName?: string; submittedAt?: Date | string | null
            }>) || []
            const members = (p.teamMembers as Array<{ name?: string; email?: string }>) || []
            const teamNames = members.map((m) => m.name || "").join(", ") || (p.studentName as string) || "N/A"
            for (const m of milestones) {
                milestoneRows.push({
                    "S.No": mIdx++,
                    "Project Title": p.title as string,
                    "Team Leader": p.studentName as string || "N/A",
                    "Team Members": teamNames,
                    "Milestone Title": m.title || "",
                    "Milestone Description": m.description || "",
                    "Due Date": m.dueDate || "Not Set",
                    "Status": m.status ? m.status.charAt(0).toUpperCase() + m.status.slice(1) : "Pending",
                    "Submission Link": m.submissionLink || "",
                    "Link Type": m.linkType || "",
                    "File Name": m.fileName || "",
                    "Submitted At": m.submittedAt ? new Date(m.submittedAt).toLocaleDateString("en-US") : "Not Submitted",
                })
            }
        }

        // ─── Build Workbook ─────────────────────────────────────
        const wb = XLSX.utils.book_new()

        const ws1 = XLSX.utils.json_to_sheet(projectRows.length > 0 ? projectRows : [{ "No Data": "No projects found" }])
        XLSX.utils.book_append_sheet(wb, ws1, "Projects Overview")

        const ws2 = XLSX.utils.json_to_sheet(studentRows.length > 0 ? studentRows : [{ "No Data": "No students found" }])
        XLSX.utils.book_append_sheet(wb, ws2, "Students Summary")

        const ws3 = XLSX.utils.json_to_sheet(guideRows.length > 0 ? guideRows : [{ "No Data": "No guides found" }])
        XLSX.utils.book_append_sheet(wb, ws3, "Guides Summary")

        const ws4 = XLSX.utils.json_to_sheet(milestoneRows.length > 0 ? milestoneRows : [{ "No Data": "No milestones found" }])
        XLSX.utils.book_append_sheet(wb, ws4, "Milestones Detail")

        // Auto-fit column widths
        for (const ws of [ws1, ws2, ws3, ws4]) {
            if (!ws["!ref"]) continue
            const range = XLSX.utils.decode_range(ws["!ref"])
            const cols: { wch: number }[] = []
            for (let c = range.s.c; c <= range.e.c; c++) {
                let maxWidth = 10
                for (let r = range.s.r; r <= range.e.r; r++) {
                    const cell = ws[XLSX.utils.encode_cell({ r, c })]
                    if (cell?.v) {
                        const len = String(cell.v).length
                        if (len > maxWidth) maxWidth = Math.min(len, 50)
                    }
                }
                cols.push({ wch: maxWidth + 2 })
            }
            ws["!cols"] = cols
        }

        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
        const today = new Date().toISOString().slice(0, 10)

        return new NextResponse(buf, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="AcadNexus_Export_${today}.xlsx"`,
            },
        })
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
