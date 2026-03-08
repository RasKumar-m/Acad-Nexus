"use client"

import { useEffect } from "react"

export default function GuideError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Guide dashboard error:", error)
    }, [error])

    return (
        <div className="flex min-h-[50vh] items-center justify-center p-6">
            <div className="mx-auto max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Dashboard Error
                </h2>
                <p className="mb-6 text-sm text-gray-500">
                    {error.message || "Something went wrong loading this page."}
                </p>
                <button
                    onClick={reset}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Try again
                </button>
            </div>
        </div>
    )
}
