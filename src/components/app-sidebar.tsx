"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
    BookOpen,
    Home,
    Users,
    UserSquare2,
    Briefcase,
    CalendarClock,
    FolderKanban,
    FileText,
    MessageSquare,
    Upload,
    Clock,
    FolderOpen,
    Bell,
    UserCheck,
    Milestone,
    Megaphone,
    type LucideIcon,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

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
    { title: "Pending Requests", url: "/guide/pending-requests", icon: Clock },
    { title: "Assigned Students", url: "/guide/assigned-students", icon: Users },
    { title: "Milestones", url: "/guide/milestones", icon: Milestone },
    { title: "Student Files", url: "/guide/student-files", icon: FolderOpen },
    { title: "Notifications", url: "/guide/notifications", icon: Bell },
    { title: "Announcements", url: "/guide/announcements", icon: Megaphone },
]

const studentNav: NavItem[] = [
    { title: "Dashboard", url: "/student", icon: Home },
    { title: "Milestones", url: "/student/milestones", icon: Milestone },
    { title: "Submit Proposal", url: "/student/submit-proposal", icon: FileText },
    { title: "Upload Files", url: "/student/upload-files", icon: Upload },
    { title: "Guide", url: "/student/supervisor", icon: UserCheck },
    { title: "Feedback", url: "/student/feedback", icon: MessageSquare },
    { title: "Notifications", url: "/student/notifications", icon: Bell },
]

function isActive(pathname: string, url: string, isHome: boolean): boolean {
    if (isHome) return pathname === url
    return pathname.startsWith(url)
}

export function AppSidebar({ role, ...props }: React.ComponentProps<typeof Sidebar> & { role?: string }) {
    const pathname = usePathname()
    const navItems = role === "Admin" ? adminNav : role === "Teacher" ? teacherNav : role === "Student" ? studentNav : adminNav

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                                    <BookOpen className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-bold text-sm tracking-tight text-slate-800">
                                        Acad Nexus
                                    </span>
                                    <span className="truncate text-[11px] text-muted-foreground">Academic Project Management</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu className="px-2 pt-2">
                    {navItems.map((item, idx) => {
                        const active = isActive(pathname, item.url, idx === 0)
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    isActive={active}
                                    className="mt-0.5 rounded-lg transition-colors"
                                >
                                    <Link href={item.url}>
                                        <item.icon className="size-4 shrink-0" />
                                        <span className="truncate">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
