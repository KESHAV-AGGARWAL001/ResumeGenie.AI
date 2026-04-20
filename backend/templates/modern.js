const { escapeLaTeX } = require('../utils/latex');

/**
 * MODERN SINGLE COLUMN TEMPLATE
 */

function generate(data) {
    const { personalInfo, socialProfiles, experience, projects, skills, education, certifications } = data;

    // Header Construction
    const header = `
\\begin{center}
    {\\Huge \\scshape ${escapeLaTeX(personalInfo.name)}} \\\\ \\vspace{1pt}
    ${personalInfo.location ? escapeLaTeX(personalInfo.location) + ' \\\\' : ''} 
    \\small \\href{mailto:${escapeLaTeX(personalInfo.email)}}{${escapeLaTeX(personalInfo.email)}} $|$ 
    \\href{tel:${personalInfo.phone}}{${escapeLaTeX(personalInfo.phone)}} $|$ 
    \\href{${escapeLaTeX(socialProfiles.linkedin)}}{LinkedIn} $|$
    \\href{${escapeLaTeX(socialProfiles.github)}}{GitHub}
\\end{center}
`;

    // Education Section
    let educationSection = '\\section{Education}\n\\resumeSubHeadingListStart\n';
    if (education) {
        education.forEach(edu => {
            educationSection += `
      \\resumeSubheading
      {${escapeLaTeX(edu.institution)}}{${escapeLaTeX(edu.location)}}
      {${escapeLaTeX(edu.degree)}}{${escapeLaTeX(edu.startDate)} -- ${escapeLaTeX(edu.endDate)}}
      `;
        });
    }
    educationSection += '\\resumeSubHeadingListEnd\n';

    // Experience Section
    let experienceSection = '\\section{Experience}\n\\resumeSubHeadingListStart\n';
    if (experience) {
        experience.forEach(exp => {
            experienceSection += `
      \\resumeSubheading
      {${escapeLaTeX(exp.company)}}{${escapeLaTeX(exp.location)}}
      {${escapeLaTeX(exp.position)}}{${escapeLaTeX(exp.startDate)} -- ${escapeLaTeX(exp.endDate)}}
      \\resumeItemListStart
      `;
            exp.bulletPoints.forEach(bp => {
                experienceSection += `\\resumeItem{${escapeLaTeX(bp)}}\n`;
            });
            experienceSection += '\\resumeItemListEnd\n';
        });
    }
    experienceSection += '\\resumeSubHeadingListEnd\n';

    // Projects Section
    let projectsSection = '\\section{Projects}\n\\resumeSubHeadingListStart\n';
    if (projects) {
        projects.forEach(proj => {
            projectsSection += `
      \\resumeProjectHeading
      {\\textbf{${escapeLaTeX(proj.name)}} $|$ \\emph{${proj.techStack ? proj.techStack.map(t => escapeLaTeX(t)).join(', ') : ''}}}{${proj.link ? '\\href{' + escapeLaTeX(proj.link) + '}{Link}' : ''}}
      \\resumeItemListStart
      `;
            proj.bulletPoints.forEach(bp => {
                projectsSection += `\\resumeItem{${escapeLaTeX(bp)}}\n`;
            });
            projectsSection += '\\resumeItemListEnd\n';
        });
    }
    projectsSection += '\\resumeSubHeadingListEnd\n';

    // Skills Section
    let skillsSection = '\\section{Technical Skills}\n\\begin{itemize}[leftmargin=0.15in, label={}]\n    \\small{\\item{\n';
    if (skills.languages) skillsSection += `\\textbf{Languages}{: ${skills.languages.map(l => escapeLaTeX(l)).join(', ')}} \\\\ \n`;
    if (skills.frameworks) skillsSection += `\\textbf{Frameworks}{: ${skills.frameworks.map(f => escapeLaTeX(f)).join(', ')}} \\\\ \n`;
    if (skills.tools) skillsSection += `\\textbf{Developer Tools}{: ${skills.tools.map(t => escapeLaTeX(t)).join(', ')}} \\\\ \n`;
    if (skills.databases) skillsSection += `\\textbf{Libraries/Databases}{: ${skills.databases.map(d => escapeLaTeX(d)).join(', ')}} \n`;
    skillsSection += '    }}\n\\end{itemize}\n';


    return `
\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{} 
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

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
    id: 'modern',
    name: 'Modern Single Column',
    generate
};
