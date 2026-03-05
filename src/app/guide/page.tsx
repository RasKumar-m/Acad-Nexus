import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Users, Clock, CheckCircle2, ArrowUpRight, FolderOpen, FileText } from "lucide-react"

export default function GuideDashboard() {
    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">

            {/* Welcome Banner */}
            <div className="bg-[#10b981] rounded-xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Teacher Dashboard</h1>
                    <p className="text-emerald-50 max-w-xl">Manage your students and provide guidance on their projects.</p>
                </div>
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none hidden md:block">
                    {/* Decorative Pattern */}
                    <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#ffffff" d="M47.7,-60.5C60.5,-51.7,68.9,-35.3,71.2,-19.1C73.6,-2.9,69.9,13.1,61.5,26.5C53.1,40,40,50.9,25.3,58.3C10.7,65.7,-5.4,69.5,-21.8,66.8C-38.2,64.1,-55,54.8,-65.7,40.6C-76.4,26.4,-81,7.2,-77.8,-11.1C-74.6,-29.4,-63.5,-46.8,-48.7,-55.8C-33.9,-64.8,-16.9,-65.4,0.3,-65.7C17.4,-66.1,34.9,-69.3,47.7,-60.5Z" transform="translate(100 100)" />
                    </svg>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <a href="/guide/assigned-students" className="block">
                    <Card className="shadow-sm border-slate-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium mb-1">Assigned Students</p>
                                <h3 className="font-bold text-2xl text-slate-900">5</h3>
                            </div>
                        </CardContent>
                    </Card>
                </a>

                <a href="/guide/pending-requests" className="block">
                    <Card className="shadow-sm border-slate-100 hover:shadow-md hover:border-amber-200 transition-all cursor-pointer h-full">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl shrink-0">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium mb-1">Pending Requests</p>
                                <h3 className="font-bold text-2xl text-slate-900">2</h3>
                            </div>
                        </CardContent>
                    </Card>
                </a>

                <Card className="shadow-sm border-slate-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">Completed Projects</p>
                            <h3 className="font-bold text-2xl text-slate-900">1</h3>
                        </div>
                    </CardContent>
                </Card>

                <a href="/guide/student-files" className="block">
                    <Card className="shadow-sm border-slate-100 hover:shadow-md hover:border-violet-200 transition-all cursor-pointer h-full">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="p-3 bg-violet-50 text-violet-500 rounded-xl shrink-0">
                                <FolderOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium mb-1">Student Files</p>
                                <h3 className="font-bold text-2xl text-slate-900">19</h3>
                            </div>
                        </CardContent>
                    </Card>
                </a>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a
                    href="/guide/pending-requests"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-amber-200 hover:shadow-md transition-all group"
                >
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">Pending Requests</p>
                        <p className="text-xs text-slate-500">Review new supervision requests</p>
                    </div>
                </a>
                <a
                    href="/guide/assigned-students"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group"
                >
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors shrink-0">
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">Assigned Students</p>
                        <p className="text-xs text-slate-500">View your assigned students</p>
                    </div>
                </a>
                <a
                    href="/guide/student-files"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-violet-200 hover:shadow-md transition-all group"
                >
                    <div className="p-2 rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-100 transition-colors shrink-0">
                        <FolderOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">Student Files</p>
                        <p className="text-xs text-slate-500">Download submitted documents</p>
                    </div>
                </a>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4 pt-2">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Recent Activity</h2>
                    <p className="text-sm text-slate-500 mt-1">Latest notifications and updates</p>
                </div>

                <div className="space-y-3">
                    {/* Activity Item 1 */}
                    <a href="/guide/pending-requests" className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-100 shadow-sm hover:border-blue-100 transition-colors cursor-pointer group">
                        <div className="mt-0.5 w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:text-amber-600 group-hover:bg-amber-100 transition-colors shrink-0">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[15px] font-medium text-slate-700">
                                <span className="text-slate-900 font-semibold">Ahmed Saeed</span> has requested Prof. Sana Khan to be their supervisor.
                            </p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                09/01/2026, 4:00:40 pm
                            </p>
                        </div>
                    </a>

                    {/* Activity Item 2 */}
                    <a href="/guide/pending-requests" className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-100 shadow-sm hover:border-blue-100 transition-colors cursor-pointer group">
                        <div className="mt-0.5 w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:text-amber-600 group-hover:bg-amber-100 transition-colors shrink-0">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[15px] font-medium text-slate-700">
                                <span className="text-slate-900 font-semibold">Maryam Iqbal</span> has requested Prof. Sana Khan to be their supervisor.
                            </p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                09/01/2026, 3:10:15 pm
                            </p>
                        </div>
                    </a>

                    {/* Activity Item 3 */}
                    <a href="/guide/student-files" className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-100 shadow-sm hover:border-blue-100 transition-colors cursor-pointer group">
                        <div className="mt-0.5 w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-violet-500 group-hover:text-violet-600 group-hover:bg-violet-100 transition-colors shrink-0">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[15px] font-medium text-slate-700">
                                <span className="text-slate-900 font-semibold">Hira Aslam</span> submitted a new file: Progress_Report_1.docx
                            </p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                03/01/2026, 2:45:00 pm
                            </p>
                        </div>
                    </a>
                </div>
            </div>

        </div>
    )
}
