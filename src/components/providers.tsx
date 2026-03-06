"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/lib/auth-context"
import { ProposalProvider } from "@/lib/proposal-context"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthProvider>
                <ProposalProvider>{children}</ProposalProvider>
            </AuthProvider>
        </SessionProvider>
    )
}
