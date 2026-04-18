const { escapeLaTeX } = require('../utils/latex');

function generate(data) {
    const { personalInfo, socialProfiles, experience, projects, skills, education } = data;

    const header = `
\\namesection{${escapeLaTeX(personalInfo.name)}}{ 
\\urlstyle{same}
\\href{mailto:${escapeLaTeX(personalInfo.email)}}{${escapeLaTeX(personalInfo.email)}} | 
\\href{tel:${personalInfo.phone}}{${escapeLaTeX(personalInfo.phone)}} |
\\href{${escapeLaTeX(socialProfiles.linkedin)}}{LinkedIn} |
\\href{${escapeLaTeX(socialProfiles.github)}}{GitHub}
}
`;

    let experienceSection = '\\section{Work Experience}\n';
    if (experience) {
        experience.forEach(exp => {
            experienceSection += `
            \\runsubsection{${escapeLaTeX(exp.company)}}
            \\descript{| ${escapeLaTeX(exp.position)}}
            \\hfill
            \\location{${escapeLaTeX(exp.location)} | ${escapeLaTeX(exp.startDate)} – ${escapeLaTeX(exp.endDate)}}
            \\begin{tightemize}
            ${exp.bulletPoints.map(bp => `\\item ${escapeLaTeX(bp)}`).join('\n')}
            \\end{tightemize}
            \\sectionsep\n
            `;
        });
    }

    let educationSection = '\\section{Education}\n';
    if (education) {
        education.forEach(edu => {
            educationSection += `
            \\runsubsection{${escapeLaTeX(edu.institution)}}
            \\descript{| ${escapeLaTeX(edu.degree)}}
            \\hfill
            \\location{${escapeLaTeX(edu.location)} | ${escapeLaTeX(edu.startDate)} – ${escapeLaTeX(edu.endDate)}}
            \\sectionsep\n
            `;
        });
    }

    let projectsSection = '\\section{Projects}\n';
    if (projects) {
        projects.forEach(proj => {
            projectsSection += `
            \\runsubsection{${escapeLaTeX(proj.name)}}
            \\descript{| ${proj.techStack ? proj.techStack.map(t => escapeLaTeX(t)).join(', ') : ''}}
            \\hfill
            \\location{\\href{${escapeLaTeX(proj.link)}}{Link}}
            \\begin{tightemize}
            ${proj.bulletPoints.map(bp => `\\item ${escapeLaTeX(bp)}`).join('\n')}
            \\end{tightemize}
            \\sectionsep\n
            `;
        });
    }

    let skillsSection = '\\section{Skills}\n\\begin{minipage}[t]{0.78\\textwidth}\n';
    if (skills.languages) skillsSection += `\\subsection{Languages:} ${skills.languages.map(l => escapeLaTeX(l)).join(', ')} \\\\\n`;
    if (skills.frameworks) skillsSection += `\\subsection{Frameworks:} ${skills.frameworks.map(f => escapeLaTeX(f)).join(', ')} \\\\\n`;
    if (skills.tools) skillsSection += `\\subsection{Tools:} ${skills.tools.map(t => escapeLaTeX(t)).join(', ')} \\\\\n`;
    skillsSection += '\\end{minipage}\n\\sectionsep\n';


    return `
\\documentclass[]{deedy-resume-reversed}
\\usepackage{fancyhdr}
\\pagestyle{fancy}
\\fancyhf{}

\\begin{document}

${header}

${educationSection}

${experienceSection}

${projectsSection}

${skillsSection}

\\end{document}
`;
}

module.exports = {
    id: 'moderndeedy',
    name: 'Modern Deedy (OpenFont)', // Using Deedy class as proxy
    generate
};
