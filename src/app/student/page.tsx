import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    BookX,
    CheckCircle2,
    Clock,
    FileText,
    MessageSquare,
    User,
    Zap,
    CalendarDays,
    Upload,
    CalendarPlus,
    ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function StudentDashboard() {
    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">

            {/* Welcome Banner */}
            <div className="bg-blue-600 rounded-xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Welcome back, Ahmed Saeed</h1>
                    <p className="text-blue-100 max-w-xl">Here's your project overview, recent updates, and tasks for today. Let's make progress on your Final Year Project.</p>
                </div>
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none hidden md:block">
                    <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#ffffff" d="M47.7,-60.5C60.5,-51.7,68.9,-35.3,71.2,-19.1C73.6,-2.9,69.9,13.1,61.5,26.5C53.1,40,40,50.9,25.3,58.3C10.7,65.7,-5.4,69.5,-21.8,66.8C-38.2,64.1,-55,54.8,-65.7,40.6C-76.4,26.4,-81,7.2,-77.8,-11.1C-74.6,-29.4,-63.5,-46.8,-48.7,-55.8C-33.9,-64.8,-16.9,-65.4,0.3,-65.7C17.4,-66.1,34.9,-69.3,47.7,-60.5Z" transform="translate(100 100)" />
                    </svg>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <BookX className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">Project Title</p>
                            <h3 className="font-semibold text-lg line-clamp-1">No Project</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">Guide</p>
                            <h3 className="font-semibold text-lg">Not Assigned</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">Next Deadline</p>
                            <h3 className="font-semibold text-lg">None</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">Recent Feedback</p>
                            <h3 className="font-semibold text-lg text-muted-foreground italic">No feedback yet</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Larger) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Project Overview */}
                    <Card className="shadow-sm border-slate-100">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Project Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 relative">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <p className="text-sm font-medium text-muted-foreground">Title</p>
                                    <p className="text-slate-800 font-medium">N/A</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge variant="outline" className="bg-slate-50 text-slate-500 font-normal">
                                        Pending Proposal
                                    </Badge>
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                                    <p className="text-slate-600 text-sm">No description provided yet. Please consult with your Guide to finalize your project scope.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-sm font-medium text-muted-foreground">Submission Deadline</p>
                                    <p className="text-slate-800 font-medium">N/A</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t space-y-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-700">Overall Progress</span>
                                    <span className="text-blue-600 font-semibold">0%</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full w-0"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions (Suggested addition) */}
                    <Card className="shadow-sm border-slate-100 bg-linear-to-br from-white to-slate-50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Link href="/student/submit-proposal">
                                    <Button variant="outline" className="h-auto py-3 justify-start gap-3 bg-white hover:bg-slate-50 hover:text-blue-600 transition-colors w-full">
                                        <Upload className="w-4 h-4 text-blue-500" />
                                        <div className="text-left">
                                            <p className="font-semibold text-sm">Submit Proposal</p>
                                            <p className="text-xs text-muted-foreground font-normal">Upload your initial idea</p>
                                        </div>
                                    </Button>
                                </Link>
                                <Link href="/student/upload-files">
                                    <Button variant="outline" className="h-auto py-3 justify-start gap-3 bg-white hover:bg-slate-50 hover:text-emerald-600 transition-colors w-full">
                                        <CalendarPlus className="w-4 h-4 text-emerald-500" />
                                        <div className="text-left">
                                            <p className="font-semibold text-sm">Upload Files</p>
                                            <p className="text-xs text-muted-foreground font-normal">Submit project documents</p>
                                        </div>
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Deadlines */}
                    <Card className="shadow-sm border-slate-100">
                        <CardHeader className="pb-0 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-rose-500" />
                                Upcoming Deadlines
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="hidden sm:flex text-blue-600 hover:text-blue-700 h-8">
                                View Calendar
                                <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle2 className="w-6 h-6 text-slate-300" />
                                </div>
                                <h4 className="font-medium text-slate-700 mb-1">You're all caught up!</h4>
                                <p className="text-sm text-slate-500 max-w-62.5">There are no upcoming deadlines at the moment.</p>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column (Smaller) */}
                <div className="space-y-6">

                    {/* Latest Feedback */}
                    <Card className="shadow-sm border-slate-100 h-75 flex flex-col">
                        <CardHeader className="pb-0 shrink-0">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-purple-600" />
                                    Latest Feedback
                                </CardTitle>
                                <Link href="/student/feedback" className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors">
                                    View All
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                <MessageSquare className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-sm text-slate-500">No feedback available yet.</p>
                            <p className="text-xs text-slate-400 mt-1">Submit documents to receive guide feedback.</p>
                        </CardContent>
                    </Card>

                    {/* Activity Timeline (Suggested Addition) */}
                    <Card className="shadow-sm border-slate-100">
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-lg">Recent Activity</CardTitle>
                            <CardDescription>Your latest actions in the system</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 p-0">
                            <ScrollArea className="h-62.5 px-6">
                                <div className="space-y-6 py-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                    {/* Timeline Item */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-blue-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow sm:absolute sm:left-1/2 sm:-ml-2.5"></div>
                                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-3 sm:ml-0 md:group-even:text-right">
                                            <div className="flex flex-col sm:flex-row items-start md:group-even:items-end justify-between sm:items-center space-y-1 sm:space-y-0 mb-1">
                                                <div className="font-semibold text-slate-800 text-sm">Account Created</div>
                                                <time className="font-medium text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Just now</time>
                                            </div>
                                            <div className="text-xs text-slate-600">You successfully joined the system and configured your profile.</div>
                                        </div>
                                    </div>

                                    {/* Future Empty States */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-slate-200 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow sm:absolute sm:left-1/2 sm:-ml-2.5"></div>
                                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-3 sm:ml-0 md:group-even:text-right">
                                            <div className="flex flex-col sm:flex-row items-start md:group-even:items-end justify-between sm:items-center space-y-1 sm:space-y-0 mb-1">
                                                <div className="font-semibold text-slate-400 text-sm">Waiting for Project Proposal</div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}
