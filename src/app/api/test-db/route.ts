import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"

export async function GET() {
    try {
        const mongoose = await dbConnect()
        return NextResponse.json({
            status: "success",
            message: "MongoDB connected successfully!",
            host: mongoose.connection.host,
            dbName: mongoose.connection.name,
            readyState: mongoose.connection.readyState,
        })
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json(
            { status: "error", message },
            { status: 500 }
        )
    }
}
