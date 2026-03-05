"use client"

import * as React from "react"
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
    Settings,
    Upload,
    Clock,
    FolderOpen,
    Bell,
    UserCheck,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

const adminNav = [
    {
        title: "Home",
        url: "/admin",
        icon: Home,
        isActive: true,
    },
    {
        title: "Manage Students",
        url: "/admin/students",
        icon: Users,
    },
    {
        title: "Manage Teachers",
        url: "/admin/teachers",
        icon: UserSquare2,
    },
    {
        title: "Assign Guide",
        url: "/admin/assign-guide",
        icon: Briefcase,
    },
    {
        title: "Deadlines",
        url: "/admin/deadlines",
        icon: CalendarClock,
    },
    {
        title: "Projects",
        url: "/admin/projects",
        icon: FolderKanban,
    },
]

const defaultNav = [
    {
        title: "Home",
        url: "#",
        icon: Home,
        isActive: true,
    },
    {
        title: "Documents",
        url: "#",
        icon: FileText,
    },
    {
        title: "Uploads",
        url: "#",
        icon: Upload,
    },
    {
        title: "Team",
        url: "#",
        icon: Users,
    },
    {
        title: "Chat",
        url: "#",
        icon: MessageSquare,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]

const teacherNav = [
    {
        title: "Home",
        url: "/guide",
        icon: Home,
        isActive: true,
    },
    {
        title: "Pending Requests",
        url: "/guide/pending-requests",
        icon: Clock,
    },
    {
        title: "Assigned Students",
        url: "/guide/assigned-students",
        icon: Users,
    },
    {
        title: "Student Files",
        url: "/guide/student-files",
        icon: FolderOpen,
    },
]

const studentNav = [
    {
        title: "Home",
        url: "/student",
        icon: Home,
        isActive: true,
    },
    {
        title: "Submit Proposal",
        url: "/student/submit-proposal",
        icon: FileText,
    },
    {
        title: "Upload Files",
        url: "/student/upload-files",
        icon: Upload,
    },
    {
        title: "Supervisor",
        url: "/student/supervisor",
        icon: UserCheck,
    },
    {
        title: "Feedback",
        url: "/student/feedback",
        icon: MessageSquare,
    },
    {
        title: "Notifications",
        url: "/student/notifications",
        icon: Bell,
    },
]

export function AppSidebar({ role, ...props }: React.ComponentProps<typeof Sidebar> & { role?: string }) {
    const navItems = role === "Admin" ? adminNav : role === "Teacher" ? teacherNav : role === "Student" ? studentNav : defaultNav;

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-sidebar-primary-foreground">
                                    <BookOpen className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold uppercase tracking-wider text-xs">
                                        ACAD
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">Automation System</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {/* Navigation */}
                <SidebarMenu>
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive} className="mt-1">
                                <a href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
