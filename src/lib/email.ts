import nodemailer from "nodemailer"

// ─── Transporter (lazy singleton) ───────────────────────────────────
let _transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
    if (_transporter) return _transporter

    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT || "587")
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (!host || !user || !pass) {
        // SMTP not configured — emails silently skipped
        return null
    }

    _transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    })

    return _transporter
}

// ─── Core send function ─────────────────────────────────────────────
export async function sendEmail(
    to: string | string[],
    subject: string,
    html: string
): Promise<void> {
    try {
        const transporter = getTransporter()
        if (!transporter) return // SMTP not configured

        const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@acadnexus.com"
        const recipients = Array.isArray(to) ? to.join(", ") : to

        await transporter.sendMail({ from, to: recipients, subject, html })
    } catch (error) {
        // Non-critical — never break the main operation
        console.error("[Email] Failed to send:", error instanceof Error ? error.message : error)
    }
}

// ─── Batch-send to multiple recipients (individual emails) ──────────
export async function sendEmailToMany(
    recipients: Array<{ email: string; name: string }>,
    subjectFn: (name: string) => string,
    htmlFn: (name: string) => string
): Promise<void> {
    await Promise.allSettled(
        recipients.map((r) => sendEmail(r.email, subjectFn(r.name), htmlFn(r.name)))
    )
}

// ═══════════════════════════════════════════════════════════════════
//  PROFESSIONAL HTML EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════

function baseTemplate(content: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Acad-Nexus</title>
</head>
<body style="margin:0;padding:0;background-color:#0f1117;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1117;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1d27;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.4);">
<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%);padding:32px 40px;text-align:center;">
<h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Acad-Nexus</h1>
<p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.8);letter-spacing:1px;text-transform:uppercase;">Academic Project Management</p>
</td>
</tr>
<!-- Body -->
<tr>
<td style="padding:40px;">
${content}
</td>
</tr>
<!-- Footer -->
<tr>
<td style="padding:24px 40px;border-top:1px solid #2a2d3a;text-align:center;">
<p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
This is an automated notification from Acad-Nexus.<br>
Please do not reply to this email.
</p>
<p style="margin:12px 0 0;font-size:11px;color:#475569;">
© ${new Date().getFullYear()} Acad-Nexus — All rights reserved
</p>
</td>
</tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function badge(text: string, color: string): string {
    return `<span style="display:inline-block;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;color:#fff;background:${color};text-transform:uppercase;letter-spacing:0.5px;">${text}</span>`
}

function infoRow(label: string, value: string): string {
    return `<tr>
<td style="padding:10px 16px;font-size:13px;color:#94a3b8;font-weight:500;white-space:nowrap;border-bottom:1px solid #2a2d3a;">${label}</td>
<td style="padding:10px 16px;font-size:14px;color:#e2e8f0;border-bottom:1px solid #2a2d3a;">${value}</td>
</tr>`
}

function detailsTable(rows: [string, string][]): string {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12141e;border-radius:10px;overflow:hidden;margin:20px 0;">
${rows.map(([l, v]) => infoRow(l, v)).join("")}
</table>`
}

// ─── STATUS COLORS ──────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { color: string; emoji: string; label: string }> = {
    approved: { color: "#22c55e", emoji: "✅", label: "Approved" },
    rejected: { color: "#ef4444", emoji: "❌", label: "Rejected" },
    completed: { color: "#3b82f6", emoji: "🎉", label: "Completed" },
}

// ═══════════════════════════════════════════════════════════════════
//  TEMPLATE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/** Proposal approved / rejected / completed */
export function proposalStatusEmail(
    recipientName: string,
    projectTitle: string,
    status: string,
    remark?: string
): { subject: string; html: string } {
    const cfg = STATUS_CONFIG[status] || { color: "#6366f1", emoji: "📋", label: status }

    const remarkBlock = remark
        ? `<div style="margin:20px 0;padding:16px 20px;background:#12141e;border-left:4px solid ${cfg.color};border-radius:0 8px 8px 0;">
<p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Remark</p>
<p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.6;">${remark}</p>
</div>`
        : ""

    return {
        subject: `${cfg.emoji} Your Proposal Has Been ${cfg.label} — Acad-Nexus`,
        html: baseTemplate(`
<p style="margin:0 0 6px;font-size:14px;color:#94a3b8;">Hello,</p>
<h2 style="margin:0 0 20px;font-size:22px;color:#f1f5f9;font-weight:600;">Dear ${recipientName},</h2>

<p style="margin:0 0 20px;font-size:15px;color:#cbd5e1;line-height:1.7;">
Your project proposal has received an update. Please find the details below:
</p>

${detailsTable([
    ["Project", projectTitle],
    ["Status", badge(cfg.label, cfg.color)],
])}

${remarkBlock}

<p style="margin:24px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;">
Please log in to your Acad-Nexus dashboard to view the full details and take any necessary action.
</p>
`),
    }
}

/** New milestone assigned */
export function milestoneAssignedEmail(
    recipientName: string,
    projectTitle: string,
    milestoneTitle: string,
    dueDate: string
): { subject: string; html: string } {
    return {
        subject: `📌 New Milestone Assigned: "${milestoneTitle}" — Acad-Nexus`,
        html: baseTemplate(`
<p style="margin:0 0 6px;font-size:14px;color:#94a3b8;">Hello,</p>
<h2 style="margin:0 0 20px;font-size:22px;color:#f1f5f9;font-weight:600;">Dear ${recipientName},</h2>

<p style="margin:0 0 20px;font-size:15px;color:#cbd5e1;line-height:1.7;">
A new milestone has been assigned to your project. Please review the details and plan your work accordingly.
</p>

${detailsTable([
    ["Project", projectTitle],
    ["Milestone", milestoneTitle],
    ["Due Date", `<span style="color:#f59e0b;font-weight:600;">${dueDate}</span>`],
])}

<div style="margin:20px 0;padding:16px 20px;background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:10px;text-align:center;">
<p style="margin:0;font-size:14px;color:#c4b5fd;">⏰ Make sure to submit before the deadline!</p>
</div>

<p style="margin:24px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;">
Log in to your dashboard to view milestone details and submit your work.
</p>
`),
    }
}

/** Student submitted a milestone → notify guide */
export function milestoneSubmittedEmail(
    guideName: string,
    studentName: string,
    projectTitle: string,
    milestoneTitle: string
): { subject: string; html: string } {
    return {
        subject: `📥 Milestone Submitted for Review: "${milestoneTitle}" — Acad-Nexus`,
        html: baseTemplate(`
<p style="margin:0 0 6px;font-size:14px;color:#94a3b8;">Hello,</p>
<h2 style="margin:0 0 20px;font-size:22px;color:#f1f5f9;font-weight:600;">Dear ${guideName},</h2>

<p style="margin:0 0 20px;font-size:15px;color:#cbd5e1;line-height:1.7;">
A student has submitted a milestone for your review. Please take a moment to evaluate their work.
</p>

${detailsTable([
    ["Submitted By", studentName],
    ["Project", projectTitle],
    ["Milestone", milestoneTitle],
    ["Status", badge("Awaiting Review", "#f59e0b")],
])}

<p style="margin:24px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;">
Log in to your Acad-Nexus dashboard to review the submission.
</p>
`),
    }
}

/** Guide reviewed a milestone → notify team members */
export function milestoneReviewedEmail(
    recipientName: string,
    projectTitle: string,
    milestoneTitle: string
): { subject: string; html: string } {
    return {
        subject: `✅ Milestone Reviewed: "${milestoneTitle}" — Acad-Nexus`,
        html: baseTemplate(`
<p style="margin:0 0 6px;font-size:14px;color:#94a3b8;">Hello,</p>
<h2 style="margin:0 0 20px;font-size:22px;color:#f1f5f9;font-weight:600;">Dear ${recipientName},</h2>

<p style="margin:0 0 20px;font-size:15px;color:#cbd5e1;line-height:1.7;">
Your guide has reviewed one of your milestones. Check the details below:
</p>

${detailsTable([
    ["Project", projectTitle],
    ["Milestone", milestoneTitle],
    ["Status", badge("Reviewed", "#22c55e")],
])}

<p style="margin:24px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;">
Log in to your dashboard to view the review feedback and any further instructions.
</p>
`),
    }
}

/** Remark / feedback on a proposal */
export function feedbackEmail(
    recipientName: string,
    projectTitle: string,
    fromName: string,
    message: string
): { subject: string; html: string } {
    return {
        subject: `💬 New Feedback on "${projectTitle}" — Acad-Nexus`,
        html: baseTemplate(`
<p style="margin:0 0 6px;font-size:14px;color:#94a3b8;">Hello,</p>
<h2 style="margin:0 0 20px;font-size:22px;color:#f1f5f9;font-weight:600;">Dear ${recipientName},</h2>

<p style="margin:0 0 20px;font-size:15px;color:#cbd5e1;line-height:1.7;">
You have received new feedback on your project from <strong style="color:#e2e8f0;">${fromName}</strong>.
</p>

${detailsTable([
    ["Project", projectTitle],
    ["From", fromName],
])}

<div style="margin:20px 0;padding:16px 20px;background:#12141e;border-left:4px solid #6366f1;border-radius:0 8px 8px 0;">
<p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Feedback</p>
<p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.6;">${message}</p>
</div>

<p style="margin:24px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;">
Log in to your dashboard to view the complete details and respond if necessary.
</p>
`),
    }
}

/** Circular / announcement */
export function announcementEmail(
    recipientName: string,
    title: string,
    message: string,
    postedBy?: string
): { subject: string; html: string } {
    const rows: [string, string][] = [["Subject", title]]
    if (postedBy) rows.push(["Posted By", postedBy])

    return {
        subject: `📢 Announcement: ${title} — Acad-Nexus`,
        html: baseTemplate(`
<p style="margin:0 0 6px;font-size:14px;color:#94a3b8;">Hello,</p>
<h2 style="margin:0 0 20px;font-size:22px;color:#f1f5f9;font-weight:600;">Dear ${recipientName},</h2>

<p style="margin:0 0 20px;font-size:15px;color:#cbd5e1;line-height:1.7;">
A new announcement has been posted. Please read the details below:
</p>

${detailsTable(rows)}

<div style="margin:20px 0;padding:20px 24px;background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:10px;">
<p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.7;">${message}</p>
</div>

<p style="margin:24px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;">
Log in to your Acad-Nexus dashboard for more information.
</p>
`),
    }
}

/** Project deadline set or updated */
export function deadlineEmail(
    recipientName: string,
    projectTitle: string,
    deadline: string
): { subject: string; html: string } {
    return {
        subject: `⏰ Project Deadline Set: "${projectTitle}" — Acad-Nexus`,
        html: baseTemplate(`
<p style="margin:0 0 6px;font-size:14px;color:#94a3b8;">Hello,</p>
<h2 style="margin:0 0 20px;font-size:22px;color:#f1f5f9;font-weight:600;">Dear ${recipientName},</h2>

<p style="margin:0 0 20px;font-size:15px;color:#cbd5e1;line-height:1.7;">
A deadline has been set for your project. Please make sure to complete all required milestones before the due date.
</p>

${detailsTable([
    ["Project", projectTitle],
    ["Deadline", `<span style="color:#ef4444;font-weight:700;">${deadline}</span>`],
])}

<div style="margin:20px 0;padding:16px 20px;background:linear-gradient(135deg,#451a03,#7c2d12);border-radius:10px;text-align:center;">
<p style="margin:0;font-size:14px;color:#fed7aa;">🔔 Please ensure all submissions are completed before this date!</p>
</div>

<p style="margin:24px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;">
Log in to your Acad-Nexus dashboard to view the full project details.
</p>
`),
    }
}
