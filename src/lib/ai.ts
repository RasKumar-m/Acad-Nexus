import { GoogleGenerativeAI } from "@google/generative-ai"

let genAI: GoogleGenerativeAI | null = null

function getAI(): GoogleGenerativeAI | null {
    if (genAI) return genAI
    if (!process.env.GEMINI_API_KEY) return null
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    return genAI
}

// ─── Utility function to safely parse JSON from Gemini response ─────
function parseJsonResponse<T>(text: string, fallback: T): T {
    try {
        // Remove markdown formatting if present (e.g. ```json ... ```)
        const cleaned = text.replace(/```json\s?/g, "").replace(/```/g, "").trim()
        return JSON.parse(cleaned) as T
    } catch (e) {
        console.error("Failed to parse Gemini JSON output:", e, text)
        return fallback
    }
}

// ═══════════════════════════════════════════════════════════════════
//  1. Smart Description Summarizer
// ═══════════════════════════════════════════════════════════════════
export async function summarizeProject(title: string, description: string) {
    const ai = getAI()
    if (!ai) return ["AI completely disabled (no API key).", "Please add GEMINI_API_KEY to .env.local."]

    try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" })
        const prompt = `
            You are an academic project reviewer. Summarize the following project proposal in exactly 3 concise, highly readable bullet points.
            Focus on: 1) The main objective, 2) The methodology/tech stack, and 3) The expected outcome/impact.
            
            Project Title: ${title}
            Description: ${description}

            Return ONLY the 3 bullet points, each starting with a dash (-). Do not include introductory text.
        `
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        return text.split("\n").filter(line => line.trim().startsWith("-")).map(line => line.replace(/^-/, "").trim())
    } catch (error) {
        console.error("AI Summarize error:", error)
        return ["Failed to generate summary due to an AI error."]
    }
}

// ═══════════════════════════════════════════════════════════════════
//  2. Duplicate / Similarity Detector
// ═══════════════════════════════════════════════════════════════════
export async function checkDuplicates(
    newTitle: string,
    newDescription: string,
    existingProjects: Array<{ id: string; title: string }>
) {
    const ai = getAI()
    const fallback = { isDuplicate: false, similarityScore: 0, similarProjectIds: [], reasoning: "" }
    if (!ai || existingProjects.length === 0) return fallback

    try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } })
        const existingListStr = existingProjects.map(p => `ID [${p.id}]: ${p.title}`).join("\n")
        
        const prompt = `
            You are an academic project uniqueness detector.
            Compare the NEW project against the list of EXISTING projects.
            
            NEW PROJECT TITLE: ${newTitle}
            NEW PROJECT DESCRIPTION (partial): ${newDescription.slice(0, 500)}

            EXISTING PROJECTS:
            ${existingListStr}

            Determine if the new project is highly similar (duplicate) to any existing project.
            Return a JSON object matching this schema:
            {
                "isDuplicate": boolean (true if similarity is >70%),
                "similarityScore": number (0-100),
                "similarProjectIds": string[] (array of existing project IDs that are highly similar, max 3),
                "reasoning": string (short 1-sentence explanation of the similarities found)
            }
        `
        const result = await model.generateContent(prompt)
        return parseJsonResponse(result.response.text(), fallback)
    } catch (error) {
        console.error("AI Duplicate Check error:", error)
        return fallback
    }
}

// ═══════════════════════════════════════════════════════════════════
//  3. AI Project Suggestion Engine
// ═══════════════════════════════════════════════════════════════════
export async function suggestProjects(context: string) {
    const ai = getAI()
    const fallback = [] as Array<{ title: string; description: string; difficulty: string; techStack: string[] }>
    if (!ai) return fallback

    try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } })
        const prompt = `
            A university student is looking for academic project ideas.
            Their context/interests/department: "${context}"
            
            Generate 5 unique, modern, and highly feasible academic project suggestions suitable for a final year or semester project.
            Output as a JSON array of objects matching this schema:
            [{
                "title": "Clear, professional project title",
                "description": "2-3 sentences explaining what it is and the problem it solves",
                "difficulty": "Beginner, Intermediate, or Advanced",
                "techStack": ["React", "Python", "etc."]
            }]
        `
        const result = await model.generateContent(prompt)
        return parseJsonResponse(result.response.text(), fallback)
    } catch (error) {
        console.error("AI Project Suggestion error:", error)
        return fallback
    }
}

// ═══════════════════════════════════════════════════════════════════
//  4. Proposal Quality Scorer
// ═══════════════════════════════════════════════════════════════════
export async function scoreProposal(title: string, description: string) {
    const ai = getAI()
    const fallback = { clarity: 0, feasibility: 0, scope: 0, overallScore: 0, feedback: ["AI disabled."] }
    if (!ai) return fallback

    try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } })
        const prompt = `
            Evaluate the following academic project proposal.
            Title: ${title}
            Description: ${description}

            Score it from 1-10 on three metrics: 
            Clarity (how easy is it to understand), Feasibility (can a student realistically build this), Scope (is it too trivial or too overly ambitious).
            Also provide 2-3 short, constructive bullet points on how to improve the proposal before submitting.
            
            Return JSON matching this schema:
            {
                "clarity": number (1-10),
                "feasibility": number (1-10),
                "scope": number (1-10),
                "overallScore": number (average out of 10),
                "feedback": string[]
            }
        `
        const result = await model.generateContent(prompt)
        return parseJsonResponse(result.response.text(), fallback)
    } catch (error) {
        console.error("AI Proposal Scorer error:", error)
        return fallback
    }
}

// ═══════════════════════════════════════════════════════════════════
//  5. Smart Milestone Recommender
// ═══════════════════════════════════════════════════════════════════
export async function suggestMilestones(title: string, description: string, overallDeadlineInfo: string) {
    const ai = getAI()
    const fallback = [] as Array<{ title: string; description: string; recommendedDaysFromStart: number }>
    if (!ai) return fallback

    try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } })
        const prompt = `
            You are a project management assistant acting as a guide for university students.
            Create a logical breakdown of milestones for the following project.
            
            Title: ${title}
            Description: ${description}
            Overall Timeframe Context: ${overallDeadlineInfo}

            Suggest exactly 4 to 6 milestones.
            Return a JSON array of objects matching this schema:
            [{
                "title": "Short milestone name (e.g. Requirement Gathering, UI Design)",
                "description": "1 sentence describing the deliverables for this milestone",
                "recommendedDaysFromStart": number (how many days after project start this should ideally be due)
            }]
        `
        const result = await model.generateContent(prompt)
        return parseJsonResponse(result.response.text(), fallback)
    } catch (error) {
        console.error("AI Milestone Suggestion error:", error)
        return fallback
    }
}

// ═══════════════════════════════════════════════════════════════════
//  6. Team Performance Analytics (Added via feedback)
// ═══════════════════════════════════════════════════════════════════
export async function analyzePerformance(
    projectTitle: string, 
    milestones: Array<{ title: string; dueDate: string; submittedAt: string | null; status: string }>
) {
    const ai = getAI()
    const fallback = { score: 0, verdict: "AI analytics disabled.", strengths: [], risks: [] }
    
    // If no milestones or all pending with no submissions, not enough data
    const submittedOrReviewed = milestones.filter(m => m.submittedAt !== null || ["submitted", "reviewed"].includes(m.status))
    if (!ai || submittedOrReviewed.length === 0) {
        return {
            score: 50,
            verdict: "Not enough data",
            strengths: ["Waiting for milestone submissions to generate insights."],
            risks: []
        }
    }

    try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } })
        const milestonesData = JSON.stringify(milestones, null, 2)
        
        const prompt = `
            You are an Academic Project Supervisor AI. Analyze the team's performance based on their milestone delivery history.
            
            Project Title: ${projectTitle}
            Milestone History (includes due dates and actual submission timestamps):
            ${milestonesData}

            Determine if the team is performing on time, lagging, or at risk of failing based on their actual submission dates vs their due dates. Consider "submitted" or "reviewed" statuses.
            
            Return a JSON object matching this schema:
            {
                "score": number (0-100, where 100 is excellent/early, 50 is average/on-time, and below 40 is late/failing),
                "verdict": "A concise 2-4 word status (e.g., 'On Track', 'Slightly Delayed', 'At Risk')",
                "strengths": [
                    "Bullet points (max 3) noting specific positive trends, e.g., 'Consistently early submissions' or 'Good initial progress'"
                ],
                "risks": [
                    "Bullet points (max 3) noting specific negative trends, e.g., 'Missed recent deadline' or 'No activity last week'"
                ]
            }
        `
        const result = await model.generateContent(prompt)
        return parseJsonResponse(result.response.text(), fallback)
    } catch (error) {
        console.error("AI Performance Analytics error:", error)
        return fallback
    }
}
