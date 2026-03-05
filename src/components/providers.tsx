"use client"

import { AuthProvider } from "@/lib/auth-context"
import { ProposalProvider } from "@/lib/proposal-context"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ProposalProvider>{children}</ProposalProvider>
        </AuthProvider>
    )
}
