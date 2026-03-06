import mongoose, { Schema, Document, Types } from "mongoose"

export interface IUploadedFile extends Document {
    fileName: string
    fileUrl: string
    category: "report" | "presentation" | "code"
    fileSize: string
    studentId: Types.ObjectId
    studentName: string
    studentEmail: string
    createdAt: Date
    updatedAt: Date
}

const UploadedFileSchema = new Schema<IUploadedFile>(
    {
        fileName: { type: String, required: true, trim: true },
        fileUrl: { type: String, required: true },
        category: {
            type: String,
            enum: ["report", "presentation", "code"],
            required: true,
        },
        fileSize: { type: String, required: true },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        studentName: { type: String, required: true, trim: true },
        studentEmail: { type: String, required: true, lowercase: true, trim: true },
    },
    { timestamps: true }
)

export default mongoose.models.UploadedFile ||
    mongoose.model<IUploadedFile>("UploadedFile", UploadedFileSchema)
