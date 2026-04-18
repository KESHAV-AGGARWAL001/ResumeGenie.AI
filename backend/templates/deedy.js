const { escapeLaTeX } = require('../utils/latex');

/**
 * DEEDY REVERSED TEMPLATE
 * Two-column clean resume template
 */

function generateHeader(personalInfo, socialProfiles = {}) {
    const { name, email, phone } = personalInfo;

    let contactLine = '';
    if (email) {
        contactLine += `\\href{mailto:${escapeLaTeX(email)}}{${escapeLaTeX(email)}}`;
    }
    if (phone) {
        if (contactLine) contactLine += ' | ';
        contactLine += `\\href{tel:${phone.replace(/[^0-9]/g, '')}}{${escapeLaTeX(phone)}}`;
    }

    // Social Links
    let socialLine = '';
    if (socialProfiles.linkedin) {
        socialLine += `\\href{${socialProfiles.linkedin}}{LinkedIn} | `;
    }
    if (socialProfiles.github) {
        socialLine += `\\href{${socialProfiles.github}}{GitHub} | `;
    }
    if (socialProfiles.portfolio) {
        socialLine += `\\href{${socialProfiles.portfolio}}{Portfolio}`;
    }
    // Simple social line for now, can be improved

    return `\\namesection{${escapeLaTeX(name)}}{ ${contactLine}}`;
}

function generateExperience(experiences) {
    if (!experiences || experiences.length === 0) return '';
    let latex = '\\section{Experience}\n';

    experiences.forEach((exp, index) => {
        latex += `\\runsubsection{${escapeLaTeX(exp.company)}}\n`;
        latex += `\\descript{| ${escapeLaTeX(exp.position)} }\n`;
        const dateRange = `${escapeLaTeX(exp.startDate)} – ${escapeLaTeX(exp.endDate)}`;
        const location = exp.location ? ` | ${escapeLaTeX(exp.location)}` : '';
        latex += `\\location{${dateRange}${location}}\n`;
        if (index === 0) latex += '\\vspace{\\topsep} % Hacky fix for awkward extra vertical space\n';
        latex += '\\begin{tightemize}\n';
        exp.bulletPoints.forEach(point => latex += `\\item ${escapeLaTeX(point)}\n`);
        latex += '\\end{tightemize}\n\\sectionsep\n\n';
    });
    return latex;
}

function generateProjects(projects) {
    if (!projects || projects.length === 0) return '';
    let latex = '\\section{Projects}\n';

    projects.forEach(project => {
        latex += `\\runsubsection{${escapeLaTeX(project.name)}}\n`;
        if (project.techStack && project.techStack.length > 0) {
            latex += `\\descript{| ${project.techStack.map(t => escapeLaTeX(t)).join(', ')}}\n`;
        }
        if (project.link) {
            latex += `\\location{\\href{${escapeLaTeX(project.link)}}{${escapeLaTeX(project.link)}}}\n`;
        }
        latex += '\\begin{tightemize}\n';
        project.bulletPoints.forEach(point => latex += `\\item ${escapeLaTeX(point)}\n`);
        latex += '\\end{tightemize}\n\\sectionsep\n\n';
    });
    return latex;
}

function generateEducation(education) {
    if (!education || education.length === 0) return '';
    let latex = '\\section{Education}\n\n';

    education.forEach(edu => {
        latex += `\\subsection{${escapeLaTeX(edu.institution)}}\n`;
        latex += `\\descript{${escapeLaTeX(edu.degree)}}\n`;
        const dateRange = `${escapeLaTeX(edu.startDate)} - ${escapeLaTeX(edu.endDate)}`;
        const location = edu.location ? ` | ${escapeLaTeX(edu.location)}` : '';
        latex += `\\location{${dateRange}${location}}\n`;
        if (edu.honors && edu.honors.length > 0) {
            edu.honors.forEach(honor => latex += `${escapeLaTeX(honor)} \\\\\n`);
        }
        if (edu.gpa) latex += `\\location{ Cum. GPA: ${escapeLaTeX(edu.gpa)}}\n`;
        latex += '\\sectionsep\n\n';
    });
    return latex;
}

function generateSkills(skills) {
    if (!skills) return '';
    let latex = '\\section{Skills}\n';

    if (skills.languages?.length > 0) {
        latex += `\\subsection{Languages}\n${skills.languages.map(l => escapeLaTeX(l)).join(' \\textbullet{} ')} \\\\\n\\sectionsep\n\n`;
    }
    if (skills.frameworks?.length > 0) {
        latex += `\\subsection{Frameworks}\n${skills.frameworks.map(f => escapeLaTeX(f)).join(' \\textbullet{} ')} \\\\\n\\sectionsep\n\n`;
    }
    if (skills.tools?.length > 0) {
        latex += `\\subsection{Tools}\n${skills.tools.map(t => escapeLaTeX(t)).join(' \\textbullet{} ')} \\\\\n\\sectionsep\n\n`;
    }
    if (skills.databases?.length > 0) {
        latex += `\\subsection{Databases}\n${skills.databases.map(d => escapeLaTeX(d)).join(' \\textbullet{} ')} \\\\\n\\sectionsep\n\n`;
    }
    return latex;
}

function generateAchievements(achievements, certifications) {
    let latex = '';
    if (certifications?.length > 0) {
        latex += '\\section{Certifications}\n';
        certifications.forEach(cert => {
            latex += `${escapeLaTeX(cert.name)} - ${escapeLaTeX(cert.issuer)} (${escapeLaTeX(cert.date)}) \\\\\n`;
        });
        latex += '\\sectionsep\n\n';
    }
    if (achievements?.length > 0) {
        latex += '\\section{Achievements}\n';
        achievements.forEach(achievement => latex += `${escapeLaTeX(achievement)} \\\\\n`);
        latex += '\\sectionsep\n\n';
    }
    return latex;
}

function generateSocialLinks(socialProfiles) {
    if (!socialProfiles) return '';
    let latex = '\\section{Links}\n';
    const createLink = (name, url) => {
        if (!url) return '';
        const username = url.split('/').pop() || name;
        return `${name}:// \\href{${escapeLaTeX(url)}}{\\bf ${escapeLaTeX(username)}} \\\\\n`;
    };

    latex += createLink('GitHub', socialProfiles.github);
    latex += createLink('LinkedIn', socialProfiles.linkedin);
    latex += createLink('LeetCode', socialProfiles.leetcode);
    latex += createLink('Stats', socialProfiles.codechef); // Reusing logic
    if (socialProfiles.portfolio) latex += `Portfolio:// \\href{${escapeLaTeX(socialProfiles.portfolio)}}{\\bf Portfolio} \\\\\n`;

    // Add others logic if needed
    latex += '\\sectionsep\n\n';
    return latex;
}

function generate(data) {
    const { personalInfo, socialProfiles, experience, projects, skills, achievements, certifications, education } = data;

    let latex = `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Deedy - One Page Two Column Resume
% LaTeX Template
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\documentclass[]{deedy-resume-reversed}
\\usepackage{fancyhdr}
\\pagestyle{fancy}
\\fancyhf{}

\\begin{document}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%     TITLE NAME
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
${generateHeader(personalInfo, socialProfiles)}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%     COLUMN ONE (Left - 60%)
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{minipage}[t]{0.60\\textwidth}

${generateExperience(experience)}
${generateProjects(projects)}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%     COLUMN TWO (Right - 33%)
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.33\\textwidth}

${generateEducation(education)}
${generateSkills(skills)}
${generateAchievements(achievements, certifications)}
${generateSocialLinks(socialProfiles)}

\\end{minipage}
\\end{document}`;

    return latex;
}

module.exports = {
    id: 'deedy',
    name: 'Deedy Reversed (Recommended)',
    generate
};
