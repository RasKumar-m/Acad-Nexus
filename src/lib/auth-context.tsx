"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"

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
    login: (email: string, password: string, role: UserRole) => Promise<boolean>
    logout: () => void
}

// ─── Mock Users ─────────────────────────────────────────────────────
const mockUsers: Record<string, AuthUser & { password: string }> = {
    "admin@acad.edu": {
        id: "1",
        name: "System Admin",
        email: "admin@acad.edu",
        initials: "SA",
        role: "Admin",
        password: "admin123",
    },
    "sana.khan@university.edu": {
        id: "2",
        name: "Prof. Sana Khan",
        email: "sana.khan@university.edu",
        initials: "SK",
        role: "Teacher",
        password: "guide123",
    },
    "ahmed.saeed@student.edu": {
        id: "3",
        name: "Ahmed Saeed",
        email: "ahmed.saeed@student.edu",
        initials: "AS",
        role: "Student",
        password: "student123",
    },
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
    const [user, setUser] = React.useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    // Hydrate from localStorage on mount
    React.useEffect(() => {
        try {
            const stored = localStorage.getItem("acadnexus_user")
            if (stored) {
                const parsed = JSON.parse(stored) as AuthUser
                setUser(parsed)
            }
        } catch {
            localStorage.removeItem("acadnexus_user")
        } finally {
            setIsLoading(false)
        }
    }, [])

    const login = React.useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 600))

        const normalizedEmail = email.toLowerCase().trim()
        const mockUser = mockUsers[normalizedEmail]

        if (mockUser && mockUser.password === password && mockUser.role === role) {
            const authUser: AuthUser = {
                id: mockUser.id,
                name: mockUser.name,
                email: mockUser.email,
                initials: mockUser.initials,
                role: mockUser.role,
            }
            setUser(authUser)
            localStorage.setItem("acadnexus_user", JSON.stringify(authUser))
            return true
        }

        return false
    }, [])

    const logout = React.useCallback(() => {
        setUser(null)
        localStorage.removeItem("acadnexus_user")
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
            // Redirect to user's own dashboard
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
