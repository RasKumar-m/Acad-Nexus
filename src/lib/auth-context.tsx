"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"

// ─── Types ──────────────────────────────────────────────────────────
export type UserRole = "Admin" | "Teacher" | "Student"

export interface AuthUser {
    id: string
    name: string
    email: string
    initials: string
    role: UserRole
}

interface AuthContextType {
    user: AuthUser | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
}

// ─── Helpers ────────────────────────────────────────────────────────
function getInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
}

/** Map DB role (lowercase) → display role */
function mapDbRole(dbRole: string): UserRole {
    switch (dbRole) {
        case "admin":
            return "Admin"
        case "guide":
            return "Teacher"
        case "student":
            return "Student"
        default:
            return "Student"
    }
}

// ─── Role → Route Mapping ───────────────────────────────────────────
export const roleRoutes: Record<UserRole, string> = {
    Admin: "/admin",
    Teacher: "/guide",
    Student: "/student",
}

export const rolePrefixes: Record<UserRole, string[]> = {
    Admin: ["/admin"],
    Teacher: ["/guide"],
    Student: ["/student"],
}

// ─── Context ────────────────────────────────────────────────────────
const AuthContext = React.createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: async () => false,
    logout: () => {},
})

export function useAuth() {
    return React.useContext(AuthContext)
}

// ─── Provider ───────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const isLoading = status === "loading"

    const user: AuthUser | null = React.useMemo(() => {
        if (!session?.user) return null
        return {
            id: session.user.id,
            name: session.user.name ?? "",
            email: session.user.email ?? "",
            initials: getInitials(session.user.name ?? ""),
            role: mapDbRole(session.user.role),
        }
    }, [session])

    const login = React.useCallback(
        async (email: string, password: string): Promise<boolean> => {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })
            return result?.ok === true
        },
        []
    )

    const logout = React.useCallback(() => {
        signOut({ callbackUrl: "/login" })
    }, [])

    const value = React.useMemo(
        () => ({ user, isLoading, login, logout }),
        [user, isLoading, login, logout]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Route Guard Component ──────────────────────────────────────────
export function ProtectedRoute({
    children,
    allowedRoles,
}: {
    children: React.ReactNode
    allowedRoles: UserRole[]
}) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    React.useEffect(() => {
        if (isLoading) return

        if (!user) {
            router.replace("/login")
            return
        }

        if (!allowedRoles.includes(user.role)) {
            router.replace(roleRoutes[user.role])
        }
    }, [user, isLoading, allowedRoles, router, pathname])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">Redirecting...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
