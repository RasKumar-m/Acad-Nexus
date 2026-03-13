import nodemailer from "nodemailer"
import dbConnect from "@/lib/mongodb"
import MailAudit from "@/models/MailAudit"

interface MailBlock {
    label: string
    value: string
}

interface NexusEmailInput {
    to: string | string[]
    subject: string
    heading: string
    intro: string
    blocks?: MailBlock[]
    footerNote?: string
    ctaLabel?: string
    ctaUrl?: string
    audit?: {
      event?: string
      relatedId?: string
      triggeredBy?: string
    }
}

let transporter: nodemailer.Transporter | null = null

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

function getAppUrl(): string {
    return process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

function getTransporter(): nodemailer.Transporter | null {
    if (transporter) return transporter

    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT || 587)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (!host || !user || !pass || Number.isNaN(port)) {
        return null
    }

    transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    })

    return transporter
}

function normalizeRecipients(to: string | string[]): string[] {
    const list = Array.isArray(to) ? to : [to]
    return [...new Set(list.map((v) => v.trim().toLowerCase()).filter(Boolean))]
}

async function writeMailAudit(params: {
  to: string[]
  subject: string
  status: "sent" | "failed"
  errorMessage?: string
  metadata?: {
    event?: string
    relatedId?: string
    triggeredBy?: string
  }
}): Promise<void> {
  try {
    await dbConnect()
    await MailAudit.create({
      provider: "nodemailer",
      to: params.to,
      subject: params.subject,
      status: params.status,
      errorMessage: params.errorMessage || undefined,
      metadata: params.metadata || {},
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[mailer] audit log failure:", message)
  }
}

function buildHtmlTemplate(input: NexusEmailInput): string {
    const blocks = (input.blocks ?? []).map((b) => {
        const label = escapeHtml(b.label)
        const value = escapeHtml(b.value)
        return `<p style="margin:0 0 4px;color:#6b7280;font-size:12px;">${label}</p><p style="margin:0 0 14px;color:#111827;font-size:14px;font-weight:600;">${value}</p>`
    }).join("")

    const footer = input.footerNote
        ? `<p style="margin:12px 0 0;color:#6b7280;font-size:12px;line-height:18px;">${escapeHtml(input.footerNote)}</p>`
        : ""

    const cta = input.ctaLabel && input.ctaUrl
        ? `<div style="text-align:center;margin-top:22px;"><a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:14px;font-weight:600;">${escapeHtml(input.ctaLabel)}</a></div>`
        : ""

    return `<!doctype html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(input.subject)}</title>
</head>
<body style="margin:0;padding:20px 0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#0f172a;color:#ffffff;padding:18px 24px;font-size:18px;font-weight:700;">Acad-Nexus</td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <h1 style="margin:0 0 12px;color:#111827;font-size:20px;line-height:1.3;">${escapeHtml(input.heading)}</h1>
              <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:22px;">${escapeHtml(input.intro)}</p>
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;">
                ${blocks || `<p style="margin:0;color:#374151;font-size:14px;line-height:22px;">No additional details.</p>`}
              </div>
              ${cta}
              ${footer}
            </td>
          </tr>
          <tr>
            <td style="padding:14px 24px;background:#fafafa;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;">
              This is an automated message from Acad-Nexus. Please do not reply.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildTextTemplate(input: NexusEmailInput): string {
    const details = (input.blocks ?? [])
        .map((b) => `${b.label}: ${b.value}`)
        .join("\n")

    const cta = input.ctaLabel && input.ctaUrl ? `\n${input.ctaLabel}: ${input.ctaUrl}` : ""
    const footer = input.footerNote ? `\n\n${input.footerNote}` : ""

    return `${input.heading}\n\n${input.intro}${details ? `\n\n${details}` : ""}${cta}${footer}`
}

export async function sendNexusEmail(input: NexusEmailInput): Promise<void> {
  const recipients = normalizeRecipients(input.to)
  if (recipients.length === 0) {
    await writeMailAudit({
      to: [],
      subject: input.subject,
      status: "failed",
      errorMessage: "No recipients provided",
      metadata: input.audit,
    })
    return
  }

    const tx = getTransporter()
    if (!tx) {
        console.warn("[mailer] SMTP not configured. Email skipped.")
    await writeMailAudit({
      to: recipients,
      subject: input.subject,
      status: "failed",
      errorMessage: "SMTP not configured",
      metadata: input.audit,
    })
        return
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@acadnexus.local"

  try {
    await tx.sendMail({
      from,
      to: recipients,
      subject: input.subject,
      html: buildHtmlTemplate(input),
      text: buildTextTemplate(input),
    })

    await writeMailAudit({
      to: recipients,
      subject: input.subject,
      status: "sent",
      metadata: input.audit,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    await writeMailAudit({
      to: recipients,
      subject: input.subject,
      status: "failed",
      errorMessage: message,
      metadata: input.audit,
    })
    throw error
  }
}

export function sendNexusEmailNonBlocking(input: NexusEmailInput): void {
    void sendNexusEmail(input).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Unknown error"
        console.error("[mailer] send failure:", message)
    })
}

export function getDefaultStudentDashboardUrl(path: string): string {
    return `${getAppUrl()}${path}`
}
