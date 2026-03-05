"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute, useAuth } from "@/lib/auth-context"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user } = useAuth()

    return (
        <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout
                role="Admin"
                userName={user?.name ?? "Admin"}
                userInitials={user?.initials ?? "A"}
            >
                {children}
            </DashboardLayout>
        </ProtectedRoute>
    )
}
