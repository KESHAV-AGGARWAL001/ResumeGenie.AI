export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface SocialProfiles {
  linkedin: string;
  github: string;
  leetcode: string;
  codechef: string;
  codeforces?: string;
  geeksforgeeks?: string;
  portfolio?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  techStack: string[];
  bulletPoints: string[];
}

export interface Project {
  id: string;
  name: string;
  techStack: string[];
  link: string;
  bulletPoints: string[];
}

export interface Skills {
  languages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  honors: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeMetadata {
  templateId?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  socialProfiles: SocialProfiles;
  experience: Experience[];
  projects: Project[];
  skills: Skills;
  achievements: string[];
  certifications: Certification[];
  education: Education[];
  metadata?: ResumeMetadata;
}

export interface Subscription {
  tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due';
}

export interface UsageData {
  subscription: Subscription;
  usage: {
    compilationsToday: number;
    aiAnalysesToday: number;
  };
  limits: {
    compilationsPerDay: number;
    aiAnalysesPerDay: number;
  };
}

export interface AnalysisIssue {
  section: string;
  type: string;
  detail: string;
  suggested_fix: string;
}

export interface RewrittenBullet {
  original: string;
  improved: string;
}

export interface AnalysisResult {
  overall_score: number;
  similarity_score: number | null;
  predicted_score_after_fixes: number;
  summary_comment: string;
  score_breakdown: Record<string, number>;
  issues: AnalysisIssue[];
  rewritten_bullets: RewrittenBullet[];
}

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image?: string;
  readingTime?: string;
}

export type AppMode = 'form' | 'editor' | 'resume-analyzer' | 'career-insights';
