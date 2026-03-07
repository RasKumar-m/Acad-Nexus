import mongoose, { Schema, Document, Model, Types } from "mongoose"

// ─── Interface ──────────────────────────────────────────────────────
export interface INotification extends Document {
    userId?: Types.ObjectId
    userEmail?: string
    type: "proposal" | "assignment" | "feedback" | "deadline" | "system" | "circular"
    targetAudience: "all" | "student" | "guide" | "admin" | "individual"
    title: string
    message: string
    isRead: boolean
    relatedId?: string
    postedBy?: string
    createdAt: Date
    updatedAt: Date
}

// ─── Schema ─────────────────────────────────────────────────────────
const NotificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        userEmail: {
            type: String,
            required: false,
            lowercase: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["proposal", "assignment", "feedback", "deadline", "system", "circular"],
            default: "system",
        },
        targetAudience: {
            type: String,
            enum: ["all", "student", "guide", "admin", "individual"],
            default: "individual",
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
        postedBy: {
            type: String,
            trim: true,
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
