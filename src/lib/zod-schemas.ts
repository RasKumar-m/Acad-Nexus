import { z } from "zod"

// ─── Shared Primitives ──────────────────────────────────────────────
const trimmedString = (min: number, max: number) =>
    z.string().trim().min(min).max(max)

const objectId = z.string().min(1).max(50)
const emailField = z.string().trim().toLowerCase().min(6).max(254).email()

// ─── Files ──────────────────────────────────────────────────────────
export const createFileSchema = z.object({
    fileName: trimmedString(1, 500),
    fileUrl: z.string().url().max(2048),
    category: z.enum(["report", "presentation", "code"]),
    fileSize: z.string().max(50).default("0 B"),
    studentId: objectId,
    studentName: trimmedString(1, 100),
    studentEmail: emailField,
})

// ─── Proposals ──────────────────────────────────────────────────────

const teamMemberSchema = z.object({
    userId: objectId,
    name: trimmedString(1, 100),
    email: emailField,
    rollNumber: z.string().trim().toUpperCase().max(30).optional(),
})

export const createProposalSchema = z.object({
    title: trimmedString(1, 300),
    description: trimmedString(1, 5000),
    studentId: objectId,
    studentName: trimmedString(1, 100),
    studentEmail: emailField,
    leaderId: objectId,
    teamMembers: z.array(teamMemberSchema).max(5).default([]),
    attachedFileUrl: z.string().url().max(2048).nullish(),
    attachedFileType: z.string().max(100).nullish(),
})

export const patchProposalStudentSchema = z.object({
    title: trimmedString(1, 300).optional(),
    description: trimmedString(1, 5000).optional(),
}).refine((d) => d.title !== undefined || d.description !== undefined, {
    message: "At least one of title or description is required",
})

export const patchProposalAdminSchema = z.object({
    status: z.enum(["draft", "pending", "approved", "rejected", "completed"]).optional(),
    supervisor: z.string().max(100).nullish(),
    guideId: z.string().max(50).nullish(),
    deadline: z.string().max(50).nullish(),
    title: trimmedString(1, 300).optional(),
    description: trimmedString(1, 5000).optional(),
    remark: z.object({
        from: trimmedString(1, 100),
        fromRole: z.enum(["Admin", "Teacher"]),
        message: trimmedString(1, 2000),
        action: z.enum(["approved", "rejected", "feedback", "completed"]).optional(),
    }).optional(),
})

// ─── Milestones ─────────────────────────────────────────────────────
export const createMilestoneSchema = z.object({
    title: trimmedString(1, 300),
    description: trimmedString(1, 2000),
    dueDate: z.string().min(1).max(50).refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
})

export const patchMilestoneSchema = z.object({
    fileUrl: z.string().url().max(2048).optional(),
    fileName: z.string().max(500).optional(),
    submissionLink: z.string().url().max(2048).optional(),
    linkType: z.enum(["github", "drive", "figma", "other"]).optional(),
    status: z.enum(["pending", "submitted", "reviewed"]).optional(),
}).refine((d) => {
    return d.fileUrl || d.submissionLink || d.status !== undefined
}, { message: "No valid fields to update" })

// ─── Remarks ────────────────────────────────────────────────────────
export const createRemarkSchema = z.object({
    from: trimmedString(1, 100),
    fromRole: z.enum(["Admin", "Teacher"]),
    message: trimmedString(1, 2000),
    action: z.enum(["approved", "rejected", "feedback", "completed"]).default("feedback"),
})

// ─── Notifications ──────────────────────────────────────────────────
export const createNotificationSchema = z.object({
    userId: objectId.optional(),
    userEmail: emailField.optional(),
    type: z.enum(["proposal", "assignment", "feedback", "deadline", "system", "circular"]).default("system"),
    title: trimmedString(1, 200),
    message: trimmedString(1, 2000),
    relatedId: z.string().max(100).optional(),
    targetAudience: z.enum(["all", "student", "guide", "admin", "individual"]).default("individual"),
    postedBy: z.string().max(100).optional(),
})

export const updateNotificationSchema = z.object({
    title: trimmedString(1, 200),
    message: trimmedString(1, 2000),
    targetAudience: z.enum(["all", "student", "guide", "admin"]).optional(),
})

export const markAllReadSchema = z.object({
    email: emailField,
})

// ─── Users (supplement existing validation.ts) ──────────────────────
export const createUserSchema = z.object({
    name: trimmedString(3, 60),
    email: emailField,
    password: z.string().min(8).max(64),
    role: z.enum(["admin", "student", "guide"]),
    rollNumber: z.string().trim().toUpperCase().max(30).optional(),
    department: z.string().max(100).optional(),
    expertise: z.string().max(200).optional(),
    maxStudents: z.number().int().min(1).max(50).optional(),
})

export const patchUserSchema = z.object({
    name: trimmedString(3, 60).optional(),
    email: emailField.optional(),
    password: z.string().min(8).max(64).optional(),
    role: z.enum(["admin", "student", "guide"]).optional(),
    rollNumber: z.string().trim().toUpperCase().max(30).nullish(),
    department: z.string().max(100).optional(),
    expertise: z.string().max(200).optional(),
    maxStudents: z.number().int().min(1).max(50).optional(),
    assignedGuideId: z.string().max(50).nullish(),
    assignedGuideName: z.string().max(100).nullish(),
})

// ─── Helper ─────────────────────────────────────────────────────────
export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(data)
    if (result.success) return { success: true, data: result.data }
    const msg = result.error.issues.map((i) => i.message).join("; ")
    return { success: false, error: msg }
}
