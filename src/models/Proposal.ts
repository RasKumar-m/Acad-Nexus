import mongoose, { Schema, Document, Model, Types } from "mongoose"

// ─── Remark Sub-document ────────────────────────────────────────────
export interface IRemark {
    from: string
    fromRole: "Admin" | "Teacher"
    message: string
    action?: "approved" | "rejected" | "feedback"
    createdAt: Date
}

const RemarkSchema = new Schema<IRemark>(
    {
        from: { type: String, required: true },
        fromRole: { type: String, enum: ["Admin", "Teacher"], required: true },
        message: { type: String, required: true },
        action: { type: String, enum: ["approved", "rejected", "feedback", "completed"] },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
)

// ─── Milestone Sub-document ─────────────────────────────────────────
export interface IMilestone {
    _id?: Types.ObjectId
    title: string
    description: string
    dueDate: string
    status: "pending" | "submitted" | "reviewed"
    fileUrl: string | null
    fileName: string | null
    submissionLink: string | null
    linkType: "github" | "drive" | "figma" | "other" | null
    submittedAt: Date | null
    createdAt: Date
}

const MilestoneSchema = new Schema<IMilestone>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        dueDate: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending", "submitted", "reviewed"],
            default: "pending",
        },
        fileUrl: { type: String, default: null },
        fileName: { type: String, default: null },
        submissionLink: { type: String, default: null },
        linkType: { type: String, enum: ["github", "drive", "figma", "other", null], default: null },
        submittedAt: { type: Date, default: null },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
)

// ─── Proposal Interface ─────────────────────────────────────────────
export interface IProposal extends Document {
    title: string
    description: string
    studentId: Types.ObjectId
    studentName: string
    studentEmail: string
    guideId: Types.ObjectId | null
    supervisor: string | null
    status: "pending" | "approved" | "rejected" | "completed"
    deadline: string | null
    attachedFileUrl: string | null
    attachedFileType: string | null
    remarks: IRemark[]
    milestones: IMilestone[]
    files: { name: string; url: string }[]
    createdAt: Date
    updatedAt: Date
}

// ─── Schema ─────────────────────────────────────────────────────────
const ProposalSchema = new Schema<IProposal>(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Student ID is required"],
        },
        studentName: {
            type: String,
            required: [true, "Student name is required"],
            trim: true,
        },
        studentEmail: {
            type: String,
            required: [true, "Student email is required"],
            lowercase: true,
            trim: true,
        },
        guideId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        supervisor: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "completed"],
            default: "pending",
        },
        deadline: {
            type: String,
            default: null,
        },
        attachedFileUrl: {
            type: String,
            default: null,
        },
        attachedFileType: {
            type: String,
            default: null,
        },
        remarks: {
            type: [RemarkSchema],
            default: [],
        },
        milestones: {
            type: [MilestoneSchema],
            default: [],
        },
        files: {
            type: [{ name: String, url: String }],
            default: [],
        },
    },
    {
        timestamps: true,
    }
)

// ─── Model ──────────────────────────────────────────────────────────
const Proposal: Model<IProposal> =
    mongoose.models.Proposal ||
    mongoose.model<IProposal>("Proposal", ProposalSchema)

export default Proposal
