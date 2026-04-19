const { GoogleGenAI } = require("@google/genai");
const { CircuitBreaker } = require('../lib/circuitBreaker');
const { TieredCache } = require('../lib/cache');
const { hashContent } = require('../lib/hashUtil');

const GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY || process.env.VITE_GEMINI_API_KEY;

let ai = null;
if (GEMINI_API_KEY) {
    try {
        ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.trim() });
    } catch (err) {
        console.error("[Career Service] Failed to initialize GoogleGenAI SDK:", err.message);
    }
}

const careerCircuit = new CircuitBreaker('career-service', { failureThreshold: 5, resetTimeout: 60000 });
const careerCache = new TieredCache({ maxSize: 100, defaultTTL: 10 * 60 * 1000 });

async function callGemini(prompt, cacheKeyData) {
    const cacheKey = hashContent(cacheKeyData);
    const cached = careerCache.get(cacheKey);
    if (cached) return cached;

    const result = await careerCircuit.exec(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            return response;
        } finally {
            clearTimeout(timeout);
        }
    });

    const rawText = result.text || "";
    if (!rawText) throw new Error("Empty response from Gemini");

    const cleaned = rawText
        .replace(/^```json\s*/gi, "")
        .replace(/^```\s*/gi, "")
        .replace(/```$/gi, "")
        .trim();

    const parsed = JSON.parse(cleaned);
    careerCache.set(cacheKey, parsed);
    return parsed;
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
        return await callGemini(prompt, { type: 'gap', resumeData, targetRole });
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
        return await callGemini(prompt, { type: 'optimize', resumeData, jobDescription });
    } catch (error) {
        console.error("Resume optimization error:", error.message);
        throw new Error("Failed to optimize resume: " + error.message);
    }
}

async function scanATSKeywords(resumeData, jobDescription) {
    if (!ai) throw new Error("Gemini API Key not configured.");

    const prompt = `
You are an expert ATS (Applicant Tracking System) analyst. Analyze the candidate's resume against the job description to identify keyword matches and gaps.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Job Description:
"""
${jobDescription}
"""

Rules:
- Identify every significant keyword/phrase from the JD
- Determine if each keyword exists in the resume (exact match or semantic equivalent)
- Categorize keywords by type (technical_skills, soft_skills, tools_and_platforms, certifications, domain_knowledge)
- For missing keywords, provide a specific suggestion on where/how to add them
- Rate importance as critical (must-have), important (strong preference), or nice_to_have

Return ONLY a JSON object with this exact shape:
{
  "overall_match_percentage": <number 0-100>,
  "matched_keywords": [
    { "keyword": "string", "found_in": "string (section name)", "match_type": "exact|semantic" }
  ],
  "missing_keywords": [
    { "keyword": "string", "importance": "critical|important|nice_to_have", "suggestion": "string" }
  ],
  "category_breakdown": {
    "technical_skills": { "matched": <number>, "total": <number> },
    "soft_skills": { "matched": <number>, "total": <number> },
    "tools_and_platforms": { "matched": <number>, "total": <number> },
    "certifications": { "matched": <number>, "total": <number> },
    "domain_knowledge": { "matched": <number>, "total": <number> }
  },
  "ats_tips": ["string"]
}
`;

    try {
        return await callGemini(prompt, { type: 'ats', resumeData, jobDescription });
    } catch (error) {
        console.error("ATS keyword scan error:", error.message);
        throw new Error("Failed to scan ATS keywords: " + error.message);
    }
}

async function tailorResume(resumeData, jobDescription) {
    if (!ai) throw new Error("Gemini API Key not configured.");

    const prompt = `
You are an expert resume tailoring AI. Given the candidate's resume data and a target job description, rewrite the resume content to maximize alignment with the JD.

Resume Data (this is the exact JSON structure you must preserve):
${JSON.stringify(resumeData, null, 2)}

Job Description:
"""
${jobDescription}
"""

CRITICAL RULES:
1. Preserve the EXACT JSON structure, all field names, and all "id" fields
2. Only modify: bullet points (bulletPoints arrays), skills arrays, and achievement strings
3. Do NOT change: personalInfo, socialProfiles, education dates/institutions/degrees, company names, position titles, employment dates, project names, project links, certification details
4. Do NOT fabricate new experience or projects - only reword existing content
5. Incorporate relevant JD keywords naturally into existing bullets
6. Make bullets more impactful with quantified results where possible
7. The tailored_resume_data must be a valid, complete resumeData object that can directly replace the original

Return ONLY a JSON object with this exact shape:
{
  "tailored_resume_data": { <complete modified resumeData object with same structure> },
  "changes_summary": [
    { "section": "string", "change_type": "reworded|added_keyword|reordered", "description": "string" }
  ],
  "match_score_before": <number 0-100>,
  "match_score_after": <number 0-100>,
  "keywords_added": ["string"]
}
`;

    try {
        const result = await callGemini(prompt, { type: 'tailor', resumeData, jobDescription });

        if (!result.tailored_resume_data || typeof result.tailored_resume_data !== 'object') {
            throw new Error("AI returned invalid tailored resume data");
        }

        return result;
    } catch (error) {
        console.error("Resume tailoring error:", error.message);
        throw new Error("Failed to tailor resume: " + error.message);
    }
}

async function generateCoverLetter(resumeData, jobDescription, companyName) {
    if (!ai) throw new Error("Gemini API Key not configured.");

    const candidateName = resumeData?.personalInfo?.name || "Candidate";
    const candidateEmail = resumeData?.personalInfo?.email || "";
    const candidatePhone = resumeData?.personalInfo?.phone || "";

    const prompt = `
You are an expert career coach specializing in cover letters. Write a compelling, professional cover letter and also produce a complete LaTeX version.

Candidate Resume Data:
${JSON.stringify(resumeData, null, 2)}

Job Description:
"""
${jobDescription}
"""

Company: ${companyName}

RULES:
- Write a 3-4 paragraph cover letter (300-400 words)
- Reference specific experience/projects from the resume that match the JD
- Show genuine enthusiasm for the company and role
- Use professional but engaging tone
- For the LaTeX version, use the letter document class with proper formatting
- Escape any special LaTeX characters in the content (%, &, $, #, _, {, })

Return ONLY a JSON object with this exact shape:
{
  "cover_letter_text": "string (plain text with paragraph breaks as \\n\\n)",
  "cover_letter_latex": "string (complete compilable LaTeX document using letter class, with \\\\documentclass, \\\\begin{document}, etc.)",
  "key_points_highlighted": ["string"],
  "customization_notes": "string"
}

The LaTeX should follow this structure:
\\documentclass[11pt]{letter}
\\usepackage[margin=1in]{geometry}
\\usepackage{parskip}
\\signature{${candidateName}}
\\address{${candidateName} \\\\\\\\ ${candidateEmail} \\\\\\\\ ${candidatePhone}}
\\begin{document}
\\begin{letter}{Hiring Manager \\\\\\\\ ${companyName}}
\\opening{Dear Hiring Manager,}
<PARAGRAPHS HERE>
\\closing{Sincerely,}
\\end{letter}
\\end{document}
`;

    try {
        return await callGemini(prompt, { type: 'cover', resumeData, jobDescription, companyName });
    } catch (error) {
        console.error("Cover letter generation error:", error.message);
        throw new Error("Failed to generate cover letter: " + error.message);
    }
}

async function draftNetworkingEmail(resumeData, targetCompany, targetRole, recruiterName, tone) {
    if (!ai) throw new Error("Gemini API Key not configured.");

    const toneGuide = {
        formal: "Professional and structured, ~200 words, proper salutation and sign-off",
        conversational: "Friendly but professional, ~150 words, natural and approachable language",
        brief: "Concise and direct, ~100 words, straight to the point with clear ask",
    };

    const prompt = `
You are an expert career networking coach. Draft a cold outreach email to a recruiter/hiring manager based on the candidate's background and target role.

Candidate Resume Data:
${JSON.stringify(resumeData, null, 2)}

Target Company: ${targetCompany}
Target Role: ${targetRole}
Recipient: ${recruiterName || "Hiring Manager"}

Tone: ${tone || "formal"}
Guidelines: ${toneGuide[tone] || toneGuide.formal}

RULES:
- Reference 2-3 specific accomplishments from the resume that are relevant to the target role
- Show knowledge of the company (general best practices — you don't have company-specific info)
- Include a clear call-to-action (request for a conversation/call)
- Keep it concise and impactful — recruiters scan quickly
- Do NOT be generic — tie the candidate's actual experience to the role

Return ONLY a JSON object with this exact shape:
{
  "subject_line": "string",
  "email_body": "string (with \\n for line breaks)",
  "follow_up_note": "string (a tip on when/how to follow up)",
  "key_highlights_used": ["string (which resume points were leveraged)"]
}
`;

    try {
        return await callGemini(prompt, { type: 'email', resumeData, targetCompany, targetRole, recruiterName, tone });
    } catch (error) {
        console.error("Networking email draft error:", error.message);
        throw new Error("Failed to draft networking email: " + error.message);
    }
}

function getCareerServiceStats() {
    return { circuit: careerCircuit.stats(), cache: careerCache.stats() };
}

module.exports = {
    detectCareerGaps,
    optimizeForJobDescription,
    scanATSKeywords,
    tailorResume,
    generateCoverLetter,
    draftNetworkingEmail,
    getCareerServiceStats,
};
