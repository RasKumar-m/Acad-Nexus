export const NAME_REGEX = /^[A-Za-z][A-Za-z\s'-]{1,58}[A-Za-z]$/
export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

const PASSWORD_UPPER = /[A-Z]/
const PASSWORD_LOWER = /[a-z]/
const PASSWORD_DIGIT = /\d/
const PASSWORD_SPECIAL = /[^A-Za-z0-9]/

export type UserRoleDb = "admin" | "student" | "guide"

export interface NormalizedUserInput {
    name: string
    email: string
    password?: string
    role?: UserRoleDb
    department?: string
    expertise?: string
    maxStudents?: number
}

function emailLocalPart(email: string): string {
    return email.split("@")[0] ?? ""
}

export function validateName(name: string): string | null {
    const value = name.trim()
    if (value.length < 3 || value.length > 60) {
        return "Name must be between 3 and 60 characters"
    }
    if (!NAME_REGEX.test(value)) {
        return "Name can only contain letters, spaces, apostrophes, and hyphens"
    }
    return null
}

export function validateEmail(email: string): string | null {
    const value = email.toLowerCase().trim()
    if (value.length < 6 || value.length > 254) {
        return "Email must be between 6 and 254 characters"
    }
    if (!EMAIL_REGEX.test(value) || !value.includes(".")) {
        return "Enter a valid email address"
    }
    return null
}

export function validatePassword(password: string, name?: string, email?: string): string | null {
    if (password.length < 8 || password.length > 64) {
        return "Password must be between 8 and 64 characters"
    }
    if (!PASSWORD_UPPER.test(password) || !PASSWORD_LOWER.test(password) || !PASSWORD_DIGIT.test(password) || !PASSWORD_SPECIAL.test(password)) {
        return "Password must include uppercase, lowercase, number, and special character"
    }

    const lowerPassword = password.toLowerCase()
    if (name) {
        const compactName = name.replace(/\s+/g, "").toLowerCase()
        if (compactName.length >= 3 && lowerPassword.includes(compactName)) {
            return "Password must not contain your name"
        }
    }
    if (email) {
        const local = emailLocalPart(email.toLowerCase())
        if (local.length >= 3 && lowerPassword.includes(local)) {
            return "Password must not contain your email prefix"
        }
    }
    return null
}

export function normalizeRole(role: string): UserRoleDb | null {
    if (role === "admin" || role === "student" || role === "guide") {
        return role
    }
    return null
}

export function normalizeUserInput(raw: Record<string, unknown>): NormalizedUserInput {
    return {
        name: String(raw.name ?? "").trim(),
        email: String(raw.email ?? "").toLowerCase().trim(),
        password: raw.password !== undefined ? String(raw.password) : undefined,
        role: raw.role ? normalizeRole(String(raw.role)) ?? undefined : undefined,
        department: raw.department !== undefined ? String(raw.department).trim() : undefined,
        expertise: raw.expertise !== undefined ? String(raw.expertise).trim() : undefined,
        maxStudents: raw.maxStudents !== undefined ? Number(raw.maxStudents) : undefined,
    }
}
