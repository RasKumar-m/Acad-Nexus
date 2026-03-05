"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const roleColors: Record<string, string> = {
    Admin: "bg-violet-100 text-violet-700",
    Teacher: "bg-emerald-100 text-emerald-700",
    Student: "bg-blue-100 text-blue-700",
}

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

    function handleLogout() {
        logout()
        router.replace("/login")
    }

    return (
        <SidebarProvider>
            <AppSidebar role={role} />
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4 w-full justify-between">
                        <div className="flex items-center gap-3">
                            <SidebarTrigger className="-ml-1 bg-slate-100 hover:bg-slate-200 text-slate-600 w-8 h-8 flex items-center justify-center rounded-lg transition-colors" />
                            <div className="hidden sm:flex items-center gap-2">
                                <h1 className="font-semibold text-sm text-slate-800">Acad Nexus</h1>
                                <span className="text-slate-300">|</span>
                                <span className="text-xs text-slate-500 font-medium">FYP Management</span>
                            </div>
                            <h1 className="font-semibold text-sm sm:hidden text-slate-800">Acad Nexus</h1>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <Badge variant="secondary" className={`hidden md:inline-flex text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${roleColors[role] ?? "bg-slate-100 text-slate-600"}`}>
                                {role}
                            </Badge>
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-medium leading-none text-slate-700">{userName}</p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="relative focus:outline-none">
                                        <Avatar className="h-8 w-8 border-2 border-slate-200 cursor-pointer hover:border-blue-400 transition-colors ring-2 ring-transparent hover:ring-blue-100">
                                            <AvatarFallback className="bg-linear-to-br from-blue-600 to-indigo-600 text-white font-semibold text-[11px]">{userInitials}</AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 shadow-lg">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-semibold leading-none">{userName}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{role}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>
                <main className="flex-1 bg-slate-50/50 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-3.5rem)]">
                    {children}
                </main>
                <footer className="border-t border-slate-100 bg-white px-4 py-3 text-center">
                    <p className="text-[11px] text-slate-400">Acad Nexus v1.0 &mdash; Academic Project Management Platform</p>
                </footer>
            </SidebarInset>
        </SidebarProvider>
    )
}
