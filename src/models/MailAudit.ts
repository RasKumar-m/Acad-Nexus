import mongoose, { Document, Model, Schema } from "mongoose"

export interface IMailAudit extends Document {
    provider: "nodemailer"
    to: string[]
    subject: string
    status: "sent" | "failed"
    errorMessage?: string
    metadata?: {
        event?: string
        relatedId?: string
        triggeredBy?: string
    }
    createdAt: Date
    updatedAt: Date
}

const MailAuditSchema = new Schema<IMailAudit>(
    {
        provider: {
            type: String,
            enum: ["nodemailer"],
            default: "nodemailer",
            required: true,
        },
        to: {
            type: [String],
            default: [],
            index: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },
        status: {
            type: String,
            enum: ["sent", "failed"],
            required: true,
            index: true,
        },
        errorMessage: {
            type: String,
            trim: true,
            default: null,
            maxlength: 2000,
        },
        metadata: {
            event: { type: String, trim: true, default: null, maxlength: 100 },
            relatedId: { type: String, trim: true, default: null, maxlength: 100 },
            triggeredBy: { type: String, trim: true, default: null, maxlength: 100 },
        },
    },
    {
        timestamps: true,
    }
)

MailAuditSchema.index({ createdAt: -1 })

const MailAudit: Model<IMailAudit> =
    mongoose.models.MailAudit || mongoose.model<IMailAudit>("MailAudit", MailAuditSchema)

export default MailAudit
