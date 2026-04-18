const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY || process.env.VITE_GEMINI_API_KEY;

let ai = null;
if (GEMINI_API_KEY) {
    try {
        ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.trim() });
    } catch (err) {
        console.error("[Career Service] Failed to initialize GoogleGenAI SDK:", err.message);
    }
}

async function detectCareerGaps(resumeData, targetRole) {
    if (!ai) {
        throw new Error("Gemini API Key not configured.");
    }

    const prompt = `
You are an expert tech career advisor. Analyze the candidate's resume data and their target role to identify career gaps and provide a concrete improvement plan.

Candidate Resume Data:
${JSON.stringify(resumeData, null, 2)}

Target Role: ${targetRole}

Analyze and return ONLY a JSON object with this exact shape:
{
  "role_match_percentage": <number 0-100>,
  "current_strengths": [
    { "area": "string", "evidence": "string", "relevance": "high|medium|low" }
  ],
  "gaps": [
    {
      "area": "string",
      "severity": "critical|important|nice_to_have",
      "description": "string",
      "action_plan": "string",
      "time_estimate": "string",
      "resources": ["string"]
    }
  ],
  "missing_skills": ["string"],
  "recommended_projects": [
    { "name": "string", "description": "string", "skills_covered": ["string"], "difficulty": "beginner|intermediate|advanced" }
  ],
  "career_trajectory_advice": "string"
}
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const rawText = response.text || "";
        if (!rawText) throw new Error("Empty response from Gemini");

        const cleaned = rawText
            .replace(/^```json\s*/gi, "")
            .replace(/^```\s*/gi, "")
            .replace(/```$/gi, "")
            .trim();

        return JSON.parse(cleaned);
    } catch (error) {
        console.error("Career gap detection error:", error.message);
        throw new Error("Failed to analyze career gaps: " + error.message);
    }
}

async function optimizeForJobDescription(resumeData, jobDescription) {
    if (!ai) {
        throw new Error("Gemini API Key not configured.");
    }

    const prompt = `
You are an expert resume optimization AI. Given the candidate's resume data and a target job description, suggest specific modifications to maximize the candidate's chances.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Job Description:
"""
${jobDescription}
"""

Return ONLY a JSON object with this exact shape:
{
  "match_score": <number 0-100>,
  "optimized_sections": {
    "experience": [
      {
        "id": "string (original experience ID)",
        "optimized_bullets": ["string"],
        "reasoning": "string"
      }
    ],
    "projects": [
      {
        "id": "string (original project ID)",
        "optimized_bullets": ["string"],
        "reasoning": "string"
      }
    ],
    "skills_to_add": ["string"],
    "skills_to_emphasize": ["string"],
    "skills_to_remove": ["string"]
  },
  "recommended_section_order": ["string"],
  "keywords_to_include": ["string"],
  "summary_suggestion": "string",
  "overall_strategy": "string"
}
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const rawText = response.text || "";
        if (!rawText) throw new Error("Empty response from Gemini");

        const cleaned = rawText
            .replace(/^```json\s*/gi, "")
            .replace(/^```\s*/gi, "")
            .replace(/```$/gi, "")
            .trim();

        return JSON.parse(cleaned);
    } catch (error) {
        console.error("Resume optimization error:", error.message);
        throw new Error("Failed to optimize resume: " + error.message);
    }
}

module.exports = { detectCareerGaps, optimizeForJobDescription };
