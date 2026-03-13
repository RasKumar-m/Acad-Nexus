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

// ─── Team Member Sub-document ───────────────────────────────────────
export interface ITeamMember {
    userId: Types.ObjectId
    name: string
    email: string
    rollNumber?: string
}

const TeamMemberSchema = new Schema<ITeamMember>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        rollNumber: { type: String, trim: true, uppercase: true, default: null },
    },
    { _id: false }
)

// ─── Proposal Interface ─────────────────────────────────────────────
export interface IProposal extends Document {
    title: string
    description: string
    studentId: Types.ObjectId
    studentName: string
    studentEmail: string
    leaderId: Types.ObjectId
    teamMembers: ITeamMember[]
    teamCode: string
    teamLocked: boolean
    guideId: Types.ObjectId | null
    supervisor: string | null
    status: "draft" | "pending" | "approved" | "rejected" | "completed"
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
            trim: true,
            default: "",
        },
        description: {
            type: String,
            trim: true,
            default: "",
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
        leaderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Team leader ID is required"],
        },
        teamMembers: {
            type: [TeamMemberSchema],
            default: [],
            validate: {
                validator: (arr: ITeamMember[]) => arr.length <= 5,
                message: "A team can have at most 5 members",
            },
        },
        teamCode: {
            type: String,
            unique: true,
            uppercase: true,
            trim: true,
            maxlength: [10, "Team code must be at most 10 characters"],
        },
        teamLocked: {
            type: Boolean,
            default: false,
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
            enum: ["draft", "pending", "approved", "rejected", "completed"],
            default: "draft",
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
