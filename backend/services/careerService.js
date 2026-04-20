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

async function rewriteBulletPoint(bulletPoint, context) {
    if (!ai) throw new Error("Gemini API Key not configured.");

    const prompt = `
You are an expert resume writer specializing in tech resumes. Rewrite the following bullet point using proven methodologies (STAR, XYZ, CAR) to maximize impact.

Original Bullet Point:
"${bulletPoint}"

Context:
- Role: ${context.role || 'Software Engineer'}
- Company: ${context.company || 'Unknown'}
- Tech Stack: ${(context.techStack || []).join(', ') || 'Not specified'}

RULES:
- Provide exactly 3 alternative rewrites
- Each should use a different methodology or angle
- Start with a strong action verb
- Include quantified impact where possible (estimate reasonable numbers if none provided)
- Keep each bullet under 150 characters
- Preserve the core meaning while making it more impactful

Return ONLY a JSON object with this exact shape:
{
  "rewrites": [
    { "text": "string", "methodology": "STAR|XYZ|CAR", "improvement": "string (brief explanation of what changed)" }
  ]
}
`;

    try {
        return await callGemini(prompt, { type: 'rewrite-bullet', bulletPoint, context });
    } catch (error) {
        console.error("Bullet rewrite error:", error.message);
        throw new Error("Failed to rewrite bullet point: " + error.message);
    }
}

async function quickATSScore(resumeData, jobDescription) {
    if (!ai) throw new Error("Gemini API Key not configured.");

    const prompt = `
You are a fast ATS (Applicant Tracking System) scanner. Quickly score this resume against the job description and identify the top keyword gaps.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Job Description:
"""
${jobDescription}
"""

RULES:
- Be fast and concise — this is a quick scan, not a deep analysis
- Score from 0-100 based on keyword match density
- Identify the top 3 most impactful missing keywords
- Provide one actionable suggestion

Return ONLY a JSON object with this exact shape:
{
  "score": <number 0-100>,
  "missingKeywords": ["string", "string", "string"],
  "topSuggestion": "string (one sentence, most impactful change)"
}
`;

    try {
        return await callGemini(prompt, { type: 'quick-ats', resumeData, jobDescription });
    } catch (error) {
        console.error("Quick ATS score error:", error.message);
        throw new Error("Failed to compute ATS score: " + error.message);
    }
}

async function generateInterviewQuestions(resumeData, jobDescription, type) {
    if (!ai) throw new Error("Gemini API Key not configured.");

    const typeGuide = {
        behavioral: "Focus on past behavior and experiences. Use STAR method questions. Ask about leadership, teamwork, conflict resolution, and problem-solving based on their actual experience.",
        technical: "Focus on technical skills mentioned in the resume and required by the JD. Include system design, coding concepts, and technology-specific questions relevant to their stack.",
        situational: "Present hypothetical scenarios related to the target role. Focus on decision-making, prioritization, and how they would handle challenges specific to this position.",
    };

    const prompt = `
You are an expert interview coach. Generate targeted interview questions with model answers based on the candidate's resume and the target job.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Job Description:
"""
${jobDescription}
"""

Interview Type: ${type || 'behavioral'}
Guidelines: ${typeGuide[type] || typeGuide.behavioral}

RULES:
- Generate exactly 8 questions
- Each model answer should reference specific details from the candidate's resume
- Tips should be practical and specific to each question
- Questions should progress from easier to harder
- Answers should be 3-5 sentences, using the candidate's actual experience

Return ONLY a JSON object with this exact shape:
{
  "questions": [
    {
      "question": "string",
      "sampleAnswer": "string (3-5 sentences using resume details)",
      "tip": "string (one practical tip for answering this type of question)"
    }
  ]
}
`;

    try {
        return await callGemini(prompt, { type: 'interview-' + type, resumeData, jobDescription });
    } catch (error) {
        console.error("Interview prep error:", error.message);
        throw new Error("Failed to generate interview questions: " + error.message);
    }
}

async function parseLinkedInProfile(linkedInText) {
    if (!ai) throw new Error("Gemini API Key not configured.");

    const prompt = `
You are an expert at parsing LinkedIn profile data into structured resume format. Extract all relevant information from the pasted LinkedIn profile text.

LinkedIn Profile Text:
"""
${linkedInText}
"""

RULES:
- Extract as much structured data as possible
- For experience entries, create unique IDs using format "li-exp-1", "li-exp-2", etc.
- For project entries, use "li-proj-1", "li-proj-2", etc.
- For education entries, use "li-edu-1", "li-edu-2", etc.
- For certification entries, use "li-cert-1", "li-cert-2", etc.
- Convert date formats to "MMM YYYY" (e.g., "Jan 2023")
- Extract bullet points from job descriptions; if descriptions are paragraphs, split into logical bullets
- Infer tech stack from descriptions when mentioned
- Leave fields empty string "" if not found, empty array [] for arrays
- Set confidence based on how much data was successfully extracted

Return ONLY a JSON object with this exact shape:
{
  "resumeData": {
    "personalInfo": { "name": "", "email": "", "phone": "", "location": "" },
    "socialProfiles": { "linkedin": "", "github": "", "leetcode": "", "codechef": "", "portfolio": "" },
    "experience": [
      { "id": "string", "company": "", "position": "", "location": "", "startDate": "", "endDate": "", "techStack": [], "bulletPoints": [] }
    ],
    "projects": [
      { "id": "string", "name": "", "techStack": [], "link": "", "bulletPoints": [] }
    ],
    "skills": { "languages": [], "frameworks": [], "databases": [], "tools": [] },
    "achievements": [],
    "certifications": [
      { "id": "string", "name": "", "issuer": "", "date": "" }
    ],
    "education": [
      { "id": "string", "institution": "", "degree": "", "location": "", "startDate": "", "endDate": "", "gpa": "", "honors": [] }
    ]
  },
  "confidence": <number 0-100>
}
`;

    try {
        return await callGemini(prompt, { type: 'parse-linkedin', linkedInText });
    } catch (error) {
        console.error("LinkedIn parse error:", error.message);
        throw new Error("Failed to parse LinkedIn profile: " + error.message);
    }
}

async function estimateSalary(resumeData, targetRole, targetLocation) {
    if (!ai) throw new Error("Gemini API Key not configured.");

    const prompt = `
You are a compensation analysis expert with deep knowledge of tech industry salaries. Estimate the salary range for this candidate based on their experience, skills, and target market.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Target Role: ${targetRole}
Target Location: ${targetLocation}

RULES:
- Base estimates on real market data patterns for the tech industry
- Consider years of experience, skill level, and location cost-of-living
- Provide realistic ranges, not aspirational numbers
- Currency should match the location (USD for US, EUR for Europe, INR for India, GBP for UK, etc.)
- Factors should explain what's driving the estimate up or down
- Negotiation tips should be specific and actionable

Return ONLY a JSON object with this exact shape:
{
  "low": <number (annual salary, bottom 25th percentile)>,
  "median": <number (annual salary, 50th percentile)>,
  "high": <number (annual salary, 75th-90th percentile)>,
  "currency": "string (e.g., USD, EUR, INR)",
  "factors": [
    "string (e.g., '3+ years of React experience increases range by ~10%')"
  ],
  "negotiationTips": [
    "string (specific, actionable tip)"
  ]
}
`;

    try {
        return await callGemini(prompt, { type: 'salary', resumeData, targetRole, targetLocation });
    } catch (error) {
        console.error("Salary estimate error:", error.message);
        throw new Error("Failed to estimate salary: " + error.message);
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
    rewriteBulletPoint,
    quickATSScore,
    generateInterviewQuestions,
    parseLinkedInProfile,
    estimateSalary,
    getCareerServiceStats,
};
