"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute, useAuth } from "@/lib/auth-context"

export default function GuideLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user } = useAuth()

    return (
        <ProtectedRoute allowedRoles={["Teacher"]}>
            <DashboardLayout
                role="Teacher"
                userName={user?.name ?? "Guide"}
                userInitials={user?.initials ?? "G"}
            >
                {children}
            </DashboardLayout>
        </ProtectedRoute>
    )
}
