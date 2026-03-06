import mongoose, { Schema, Document, Model, Types } from "mongoose"

// ─── Interface ──────────────────────────────────────────────────────
export interface INotification extends Document {
    userId: Types.ObjectId
    userEmail: string
    type: "proposal" | "assignment" | "feedback" | "deadline" | "system"
    title: string
    message: string
    isRead: boolean
    relatedId?: string
    createdAt: Date
    updatedAt: Date
}

// ─── Schema ─────────────────────────────────────────────────────────
const NotificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        userEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["proposal", "assignment", "feedback", "deadline", "system"],
            default: "system",
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        relatedId: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
)

// ─── Model ──────────────────────────────────────────────────────────
const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema)

export default Notification
