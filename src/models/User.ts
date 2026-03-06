import mongoose, { Schema, Document, Model } from "mongoose"

// ─── Interface ──────────────────────────────────────────────────────
export interface IUser extends Document {
    name: string
    email: string
    password: string
    role: "admin" | "student" | "guide"
    department?: string
    expertise?: string
    maxStudents?: number
    createdAt: Date
    updatedAt: Date
}

// ─── Schema ─────────────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
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
