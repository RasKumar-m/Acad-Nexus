import { scoreProposal, suggestProjects, summarizeProject } from "./src/lib/ai"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

async function run() {
    console.log("Using API Key:", process.env.GEMINI_API_KEY?.substring(0, 10) + "...")
    
    try {
        console.log("\n--- Testing suggestProjects ---")
        const suggestions = await suggestProjects("I like AI and python and want to build a healthcare app.")
        console.log(JSON.stringify(suggestions, null, 2))

        console.log("\n--- Testing scoreProposal ---")
        const score = await scoreProposal("Healthcare AI", "This project uses AI and python to analyze medical records and predict outcomes. It will be a web app with a React frontend.")
        console.log(JSON.stringify(score, null, 2))

        console.log("\n--- Testing summarizeProject ---")
        const summary = await summarizeProject("Healthcare AI", "This project uses AI and python to analyze medical records and predict outcomes. It will be a web app with a React frontend.")
        console.log(JSON.stringify(summary, null, 2))

        console.log("\n✅ ALL TESTS PASSED")
    } catch (e) {
        console.error("\n❌ FAILED:", e)
    }
}

run()
