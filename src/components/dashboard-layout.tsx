"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut } from "lucide-react"
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
                <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-2 px-4 w-full justify-between">
                        <div className="flex items-center gap-3">
                            <SidebarTrigger className="-ml-1 bg-slate-100 hover:bg-slate-200 text-slate-700 w-9 h-9 flex items-center justify-center rounded-md" />
                            <h1 className="font-semibold text-sm md:text-base hidden sm:block text-slate-800">Final Year Project Management System</h1>
                            <h1 className="font-semibold text-sm sm:hidden text-slate-800">ACAD</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold leading-none text-slate-800">{userName}</p>
                                <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{role}</p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="h-9 w-9 border-2 border-blue-100 cursor-pointer hover:border-blue-400 transition-colors shadow-sm">
                                        <AvatarFallback className="bg-blue-600 text-white font-medium text-xs">{userInitials}</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{userName}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{role}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>
                <main className="flex-1 bg-slate-50 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
