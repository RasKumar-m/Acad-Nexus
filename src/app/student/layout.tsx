"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute, useAuth } from "@/lib/auth-context"

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user } = useAuth()

    return (
        <ProtectedRoute allowedRoles={["Student"]}>
            <DashboardLayout
                role="Student"
                userName={user?.name ?? "Student"}
                userInitials={user?.initials ?? "S"}
            >
                {children}
            </DashboardLayout>
        </ProtectedRoute>
    )
}
