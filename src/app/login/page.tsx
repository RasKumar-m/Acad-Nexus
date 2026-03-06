"use client"

import * as React from "react"
import { BookOpen, LogIn, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth, roleRoutes } from "@/lib/auth-context"

export default function LoginPage() {
    const { user, login } = useAuth()
    const router = useRouter()

    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [showPassword, setShowPassword] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [error, setError] = React.useState("")

    // If already logged in, redirect to dashboard
    React.useEffect(() => {
        if (user) {
            router.replace(roleRoutes[user.role])
        }
    }, [user, router])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")

        if (!email.trim()) {
            setError("Please enter your email address")
            return
        }
        if (!password.trim()) {
            setError("Please enter your password")
            return
        }

        setIsSubmitting(true)
        const success = await login(email, password)

        if (success) {
            // Session will update → useEffect above handles redirect
        } else {
            setError("Invalid email or password. Please try again.")
            setIsSubmitting(false)
        }
    }

    // Quick-fill demo credentials
    function fillDemo(demoRole: string) {
        switch (demoRole) {
            case "Admin":
                setEmail("admin@acad.edu")
                setPassword("admin123")
                break
            case "Teacher":
                setEmail("sana.khan@university.edu")
                setPassword("guide123")
                break
            case "Student":
                setEmail("ahmed.saeed@student.edu")
                setPassword("student123")
                break
        }
        setError("")
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30 flex flex-col justify-center items-center p-4 relative">
            {/* Subtle decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100/20 rounded-full blur-3xl" />
            </div>

            {/* Logo & Header */}
            <div className="mb-8 flex flex-col items-center relative z-10">
                <div className="w-14 h-14 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-200/50">
                    <BookOpen className="text-white w-7 h-7" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1.5 tracking-tight text-center">
                    Acad Nexus
                </h1>
                <p className="text-slate-500 text-sm">Academic Project Management & Supervision Platform</p>
            </div>

            {/* Login Card */}
            <Card className="w-full max-w-md shadow-xl shadow-slate-200/50 border border-slate-100/80 bg-white/80 backdrop-blur-sm rounded-2xl relative z-10">
                <CardContent className="p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                className="h-11 border-slate-200 bg-white placeholder:text-slate-400 rounded-lg text-slate-700"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError("") }}
                                disabled={isSubmitting}
                                autoComplete="email"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="h-11 border-slate-200 bg-white placeholder:text-slate-400 rounded-lg text-slate-700 pr-11"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError("") }}
                                    disabled={isSubmitting}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <Button
                            type="submit"
                            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold h-11 rounded-xl text-sm shadow-md shadow-blue-200/50 transition-all gap-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Sign In
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
                            Quick Login (Demo)
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-xs font-medium border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                onClick={() => fillDemo("Student")}
                            >
                                Student
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-xs font-medium border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                                onClick={() => fillDemo("Teacher")}
                            >
                                Guide
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-xs font-medium border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                                onClick={() => fillDemo("Admin")}
                            >
                                Admin
                            </Button>
                        </div>
                        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <p className="text-xs text-slate-500 leading-relaxed">
                                <span className="font-semibold">Student:</span> ahmed.saeed@student.edu / student123<br />
                                <span className="font-semibold">Guide:</span> sana.khan@university.edu / guide123<br />
                                <span className="font-semibold">Admin:</span> admin@acad.edu / admin123
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer */}
            <p className="text-xs text-slate-400 mt-6 relative z-10">
                Acad Nexus — Academic Project Management Platform v1.0
            </p>
        </div>
    )
}
