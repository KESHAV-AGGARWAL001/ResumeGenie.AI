const { GoogleGenAI } = require("@google/genai");

// Prefer backend-specific key, fall back to the generic Gemini key if needed
const GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY || process.env.VITE_GEMINI_API_KEY;

let ai = null;
if (GEMINI_API_KEY) {
    console.log(`[AI Service] Gemini API Key detected. Length: ${GEMINI_API_KEY.length}.`);
    try {
        ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.trim() });
    } catch (err) {
        console.error("[AI Service] Failed to initialize GoogleGenAI SDK:", err.message);
    }
} else {
    console.warn("[AI Service] Warning: GOOGLE_GENAI_API_KEY (or VITE_GEMINI_API_KEY) is missing from environment variables.");
}

async function evaluateResume(resumeText, jobDescription = "") {
    if (!ai) {
        throw new Error("Gemini API Key not configured.");
    }

    // 1) Deterministic, rule-based scoring (no AI, fully reproducible)
    const scoring = computeDeterministicScores(resumeText, jobDescription);

    // 2) Use Gemini ONLY for qualitative suggestions & rewrites, not for scores
    const suggestionPrompt = `
You are an AI resume coach for software engineers.

You will receive:
- The plain-text resume
- An optional job description
- An OBJECTIVE scoring breakdown that has ALREADY been computed by a rule-based algorithm.

CRITICAL:
- Do NOT change any of the numeric scores.
- Treat the provided scores as ground truth.
- Your job is ONLY to explain and improve, not to rescore.

Current objective scores (do not modify):
${JSON.stringify({
        overall_score: scoring.overall_score,
        similarity_score: scoring.similarity_score,
        score_breakdown: scoring.score_breakdown,
    }, null, 2)}

Resume (plain text):
"""
${resumeText}
"""

${jobDescription ? `Job Description:
"""
${jobDescription}
"""` : ""}

STRICT RULES FOR YOUR ANALYSIS:
- Focus on technical strength, clarity, and impact.
- Prefer improvements to vague bullets, missing impact, or weak verbs.
- Many LaTeX resume templates use decorative Unicode icons for contact info (e.g., ƒ, #, ï, §, Ð). Do NOT flag these as issues by themselves.
- Co-curricular activities, extracurriculars, and hobbies are allowed and often positive; do NOT flag them as issues unless they are clearly inappropriate or dominate the resume.
- Ignore minor formatting, typography, or layout details.

RETURN ONLY A JSON OBJECT WITH THIS SHAPE:
{
  "issues": [
    { "section": "string", "type": "technical_improvement", "detail": "string", "suggested_fix": "string" }
  ],
  "rewritten_bullets": [
    { "original": "string", "improved": "string" }
  ],
  "missing_keywords": ["string"],
  "recommended_section_order": ["string"],
  "summary_comment": "string"
}
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: suggestionPrompt,
        });

        const rawText = response.text || "";
        if (!rawText) throw new Error("Empty response from Gemini");

        const cleanedJson = rawText
            .replace(/^```json\s*/gi, "")
            .replace(/^```\s*/gi, "")
            .replace(/```$/gi, "")
            .trim();

        let suggestions;
        try {
            suggestions = JSON.parse(cleanedJson);
        } catch (parseErr) {
            throw new Error("Failed to parse Gemini JSON suggestions");
        }

        return {
            overall_score: scoring.overall_score,
            similarity_score: scoring.similarity_score,
            score_breakdown: scoring.score_breakdown,
            issues: suggestions.issues || [],
            rewritten_bullets: suggestions.rewritten_bullets || [],
            missing_keywords: suggestions.missing_keywords || [],
            recommended_section_order: suggestions.recommended_section_order || [],
            predicted_score_after_fixes: scoring.predicted_score_after_fixes,
            summary_comment: suggestions.summary_comment || "",
        };
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to evaluate resume with AI (Gemini): " + error.message);
    }
}

// ---------- Deterministic Scoring Helpers ----------

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function tokenize(text) {
    return (text.toLowerCase().match(/[a-z0-9+#\.]+/g) || []).filter(t => t.length >= 3);
}

function computeDeterministicScores(resumeText, jobDescription) {
    const textLower = resumeText.toLowerCase();
    const lines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const bullets = lines.filter(l => /^[-*•·]/.test(l));
    const totalBullets = bullets.length || 1;

    const technicalTerms = [
        "java", "python", "c++", "c#", "javascript", "typescript", "node", "node.js", "react", "react.js",
        "next.js", "spring", "spring boot", "django", "flask", "express", "kubernetes", "docker", "aws",
        "gcp", "azure", "postgresql", "mysql", "mongodb", "redis", "kafka", "rabbitmq", "terraform",
        "ansible", "ci/cd", "jenkins", "git", "github", "microservices", "rest", "graphql", "grpc"
    ];

    const actionVerbs = [
        "built", "designed", "implemented", "developed", "optimized", "improved", "architected",
        "automated", "led", "owned", "refactored", "migrated", "launched", "deployed", "scaled"
    ];

    const hasAny = (line, words) => {
        const lower = line.toLowerCase();
        return words.some(w => lower.includes(w));
    };

    const bulletsWithVerb = bullets.filter(b => hasAny(b, actionVerbs)).length;
    const bulletsWithNumbers = bullets.filter(b => /\d/.test(b) || /%/.test(b)).length;

    const techFoundSet = new Set(
        technicalTerms.filter(term => textLower.includes(term))
    );

    // Technical depth: how many distinct technologies are clearly mentioned
    const technical_depth = clamp((techFoundSet.size / 15) * 20, 0, 20);

    // Engineering impact: quantified + action-verb bullets
    const impactRatio = (bulletsWithNumbers / totalBullets) * 0.6 + (bulletsWithVerb / totalBullets) * 0.4;
    const engineering_impact = clamp(impactRatio * 20, 0, 20);

    // JD-based relevance & similarity
    let similarity_score = null;
    let technology_relevance = 0;
    let role_alignment = 0;

    if (jobDescription && jobDescription.trim()) {
        const jdLower = jobDescription.toLowerCase();
        const jdTechSet = new Set(technicalTerms.filter(term => jdLower.includes(term)));

        const overlap = [...jdTechSet].filter(term => techFoundSet.has(term)).length;
        const techRelRatio = jdTechSet.size ? overlap / jdTechSet.size : 0;
        technology_relevance = clamp(techRelRatio * 20, 0, 20);

        const jdTokens = new Set(tokenize(jobDescription));
        const resumeTokens = new Set(tokenize(resumeText));
        const commonTokens = [...jdTokens].filter(t => resumeTokens.has(t)).length;
        const tokenRatio = jdTokens.size ? commonTokens / jdTokens.size : 0;
        similarity_score = Math.round(clamp(tokenRatio, 0, 1) * 100);

        role_alignment = clamp((techRelRatio * 0.6 + tokenRatio * 0.4) * 20, 0, 20);
    } else {
        technology_relevance = clamp(technical_depth * 0.7, 0, 20);
        similarity_score = null;
        role_alignment = clamp((technical_depth + engineering_impact) / 2, 0, 20);
    }

    // Project complexity: project-like bullets that mention tech + numbers
    const projectBullets = bullets.filter(b => /project|hackathon|system|platform|service/i.test(b));
    const complexProjectBullets = projectBullets.filter(
        b => hasAny(b, technicalTerms) && (/\d/.test(b) || /%/.test(b))
    );
    const projectRatio = projectBullets.length
        ? complexProjectBullets.length / projectBullets.length
        : 0;
    const project_complexity = clamp(
        projectRatio * 12 + Math.min(projectBullets.length, 5) / 5 * 8,
        0,
        20
    );

    const score_breakdown = {
        technical_depth: Math.round(technical_depth),
        engineering_impact: Math.round(engineering_impact),
        technology_relevance: Math.round(technology_relevance),
        project_complexity: Math.round(project_complexity),
        role_alignment: Math.round(role_alignment),
    };

    const overall_score = Object.values(score_breakdown).reduce((sum, v) => sum + v, 0);
    const predicted_score_after_fixes = Math.min(100, overall_score + 15);

    return {
        overall_score,
        similarity_score,
        score_breakdown,
        predicted_score_after_fixes,
    };
}

module.exports = {
    evaluateResume,
};
