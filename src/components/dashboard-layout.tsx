"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet"
import {
    BookOpen, Home, Users, UserSquare2, Briefcase, CalendarClock,
    FolderKanban, FileText, MessageSquare, Upload, Clock, FolderOpen,
    Bell, UserCheck, Milestone, Menu, LogOut, ChevronDown, type LucideIcon,
} from "lucide-react"

/* ─── Nav Items per Role ─────────────────────────────────────────── */

interface NavItem {
    title: string
    url: string
    icon: LucideIcon
}

const adminNav: NavItem[] = [
    { title: "Dashboard", url: "/admin", icon: Home },
    { title: "Students", url: "/admin/students", icon: Users },
    { title: "Teachers", url: "/admin/teachers", icon: UserSquare2 },
    { title: "Assign Guide", url: "/admin/assign-guide", icon: Briefcase },
    { title: "Deadlines", url: "/admin/deadlines", icon: CalendarClock },
    { title: "Projects", url: "/admin/projects", icon: FolderKanban },
]

const teacherNav: NavItem[] = [
    { title: "Dashboard", url: "/guide", icon: Home },
    { title: "Requests", url: "/guide/pending-requests", icon: Clock },
    { title: "Students", url: "/guide/assigned-students", icon: Users },
    { title: "Milestones", url: "/guide/milestones", icon: Milestone },
    { title: "Files", url: "/guide/student-files", icon: FolderOpen },
]

const studentNav: NavItem[] = [
    { title: "Dashboard", url: "/student", icon: Home },
    { title: "Milestones", url: "/student/milestones", icon: Milestone },
    { title: "Proposal", url: "/student/submit-proposal", icon: FileText },
    { title: "Upload", url: "/student/upload-files", icon: Upload },
    { title: "Supervisor", url: "/student/supervisor", icon: UserCheck },
    { title: "Feedback", url: "/student/feedback", icon: MessageSquare },
    { title: "Notifications", url: "/student/notifications", icon: Bell },
]

/* ─── Role Theme Configs ─────────────────────────────────────────── */

const roleThemes: Record<string, {
    gradient: string
    navActive: string
    navHover: string
    avatarGradient: string
    badgeClass: string
    sheetAccent: string
    sheetActiveClass: string
}> = {
    Admin: {
        gradient: "bg-linear-to-r from-violet-700 via-purple-600 to-indigo-700",
        navActive: "bg-white/25 shadow-sm shadow-white/10",
        navHover: "hover:bg-white/15",
        avatarGradient: "bg-linear-to-br from-violet-400 to-purple-500",
        badgeClass: "bg-white/20 text-white border-white/30",
        sheetAccent: "from-violet-600 to-purple-600",
        sheetActiveClass: "bg-violet-50 text-violet-700 border-l-4 border-violet-600",
    },
    Teacher: {
        gradient: "bg-linear-to-r from-emerald-700 via-teal-600 to-cyan-700",
        navActive: "bg-white/25 shadow-sm shadow-white/10",
        navHover: "hover:bg-white/15",
        avatarGradient: "bg-linear-to-br from-emerald-400 to-teal-500",
        badgeClass: "bg-white/20 text-white border-white/30",
        sheetAccent: "from-emerald-600 to-teal-600",
        sheetActiveClass: "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600",
    },
    Student: {
        gradient: "bg-linear-to-r from-blue-700 via-indigo-600 to-violet-700",
        navActive: "bg-white/25 shadow-sm shadow-white/10",
        navHover: "hover:bg-white/15",
        avatarGradient: "bg-linear-to-br from-blue-400 to-indigo-500",
        badgeClass: "bg-white/20 text-white border-white/30",
        sheetAccent: "from-blue-600 to-indigo-600",
        sheetActiveClass: "bg-blue-50 text-blue-700 border-l-4 border-blue-600",
    },
}

const defaultTheme = roleThemes.Admin

function isActive(pathname: string, url: string, isHome: boolean): boolean {
    if (isHome) return pathname === url
    return pathname.startsWith(url)
}

function getNavItems(role: string): NavItem[] {
    if (role === "Admin") return adminNav
    if (role === "Teacher") return teacherNav
    if (role === "Student") return studentNav
    return adminNav
}

/* ─── Component ──────────────────────────────────────────────────── */

export function DashboardLayout({
    children,
    role,
    userName,
    userInitials,
}: {
    children: React.ReactNode
    role: string
    userName: string
    userInitials: string
}) {
    const { logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = React.useState(false)

    const theme = roleThemes[role] ?? defaultTheme
    const navItems = getNavItems(role)

    function handleLogout() {
        logout()
        router.replace("/login")
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50/60">
            {/* ─── Top Header Bar ────────────────────────────────── */}
            <header className={`sticky top-0 z-40 ${theme.gradient} shadow-lg`}>
                {/* Primary row: Logo + User */}
                <div className="flex items-center justify-between h-14 px-4 lg:px-6">
                    {/* Left: Mobile hamburger + Logo */}
                    <div className="flex items-center gap-3">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        {/* Logo */}
                        <Link href={navItems[0]?.url ?? "/"} className="flex items-center gap-2.5 group">
                            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 text-white shadow-sm group-hover:bg-white/30 transition-colors">
                                <BookOpen className="h-4 w-4" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-sm font-bold text-white leading-tight tracking-tight">Acad Nexus</h1>
                                <p className="text-[10px] text-white/70 leading-tight font-medium">FYP Management</p>
                            </div>
                            <h1 className="text-sm font-bold text-white sm:hidden">Acad Nexus</h1>
                        </Link>
                    </div>

                    {/* Right: Badge + Name + Avatar */}
                    <div className="flex items-center gap-2.5">
                        <Badge variant="outline" className={`hidden md:inline-flex text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${theme.badgeClass}`}>
                            {role}
                        </Badge>
                        <span className="hidden lg:block text-sm font-medium text-white/90 max-w-[140px] truncate">
                            {userName}
                        </span>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="relative flex items-center gap-1.5 focus:outline-none group">
                                    <Avatar className="h-8 w-8 border-2 border-white/40 cursor-pointer group-hover:border-white/70 transition-colors ring-2 ring-transparent group-hover:ring-white/20">
                                        <AvatarFallback className={`${theme.avatarGradient} text-white font-semibold text-[11px]`}>
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="h-3.5 w-3.5 text-white/60 group-hover:text-white/90 transition-colors hidden sm:block" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 shadow-xl rounded-xl border-slate-200">
                                <DropdownMenuLabel className="font-normal px-3 py-2.5">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-semibold leading-none text-slate-800">{userName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{role} Dashboard</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer mx-1 rounded-lg">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Navigation row — desktop only */}
                <nav className="hidden lg:flex items-center gap-1 px-4 lg:px-6 pb-2">
                    {navItems.map((item, idx) => {
                        const active = isActive(pathname, item.url, idx === 0)
                        return (
                            <Link
                                key={item.url}
                                href={item.url}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                                    active
                                        ? `text-white ${theme.navActive}`
                                        : `text-white/75 ${theme.navHover} hover:text-white`
                                }`}
                            >
                                <item.icon className="h-4 w-4 shrink-0" />
                                <span>{item.title}</span>
                            </Link>
                        )
                    })}
                </nav>
            </header>

            {/* ─── Mobile Navigation Sheet ───────────────────────── */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="w-72 p-0">
                    <SheetHeader className={`bg-linear-to-br ${theme.sheetAccent} px-5 py-5`}>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 text-white shadow-sm">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <SheetTitle className="text-white text-base font-bold leading-tight">
                                    Acad Nexus
                                </SheetTitle>
                                <p className="text-white/70 text-xs font-medium">FYP Management</p>
                            </div>
                        </div>
                    </SheetHeader>
                    <div className="flex flex-col py-3">
                        {/* User info in sheet */}
                        <div className="px-5 py-3 mb-1 border-b border-slate-100">
                            <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
                            <p className="text-xs text-slate-500">{role}</p>
                        </div>
                        {/* Nav items */}
                        <nav className="flex flex-col gap-0.5 px-3 mt-1">
                            {navItems.map((item, idx) => {
                                const active = isActive(pathname, item.url, idx === 0)
                                return (
                                    <SheetClose asChild key={item.url}>
                                        <Link
                                            href={item.url}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                active
                                                    ? theme.sheetActiveClass
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                        >
                                            <item.icon className="h-4.5 w-4.5 shrink-0" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SheetClose>
                                )
                            })}
                        </nav>
                        {/* Sign out in sheet */}
                        <div className="mt-auto border-t border-slate-100 pt-2 px-3 mt-4">
                            <button
                                onClick={() => { setMobileOpen(false); handleLogout() }}
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="h-4.5 w-4.5 shrink-0" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* ─── Main Content ──────────────────────────────────── */}
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
            </main>

            {/* ─── Footer ────────────────────────────────────────── */}
            <footer className="border-t border-slate-200/80 bg-white px-4 py-3 text-center">
                <p className="text-[11px] text-slate-400">
                    Acad Nexus v1.0 &mdash; Academic Project Management Platform
                </p>
            </footer>
        </div>
    )
}
