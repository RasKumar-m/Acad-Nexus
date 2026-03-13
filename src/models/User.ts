import mongoose, { Schema, Document, Model } from "mongoose"

// ─── Interface ──────────────────────────────────────────────────────
export interface IUser extends Document {
    name: string
    email: string
    password: string
    role: "admin" | "student" | "guide"
    rollNumber?: string
    assignedGuideId?: string | null
    assignedGuideName?: string | null
    department?: string
    expertise?: string
    maxStudents?: number
    createdAt: Date
    updatedAt: Date
}

const NAME_REGEX = /^[A-Za-z][A-Za-z\s'-]{1,58}[A-Za-z]$/
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

// ─── Schema ─────────────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters"],
            maxlength: [60, "Name must be at most 60 characters"],
            match: [NAME_REGEX, "Name can only contain letters, spaces, apostrophes, and hyphens"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: [254, "Email must be at most 254 characters"],
            match: [EMAIL_REGEX, "Please provide a valid email address"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
        },
        role: {
            type: String,
            enum: {
                values: ["admin", "student", "guide"],
                message: "Role must be admin, student, or guide",
            },
            required: [true, "Role is required"],
            default: "student",
        },
        rollNumber: {
            type: String,
            trim: true,
            uppercase: true,
            sparse: true,
            unique: true,
            maxlength: [30, "Roll number must be at most 30 characters"],
            default: null,
        },
        assignedGuideId: {
            type: String,
            default: null,
        },
        assignedGuideName: {
            type: String,
            default: null,
        },
        department: {
            type: String,
            trim: true,
            default: "",
        },
        expertise: {
            type: String,
            trim: true,
            default: "",
        },
        maxStudents: {
            type: Number,
            default: 5,
            min: [1, "maxStudents must be at least 1"],
            max: [50, "maxStudents must be at most 50"],
        },
    },
    {
        timestamps: true,
    }
)

// ─── Model ──────────────────────────────────────────────────────────
const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
