const { escapeLaTeX, escapeURL } = require('../utils/latex');

function generate(data) {
  const { personalInfo, socialProfiles, experience, projects, skills, education, achievements, certifications } = data;

  // Helper for bullet points
  const generateBullets = (points) => {
    if (!points || points.length === 0) return '';
    return `\\resumeItemListStart
        ${points.map(p => `\\resumeItemWithoutTitle{${escapeLaTeX(p)}}`).join('\n')}
        \\resumeItemListEnd`;
  };

  const header = `
\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
  \\textbf{{\\LARGE ${escapeLaTeX(personalInfo.name)}}} & Email: \\href{mailto:${escapeURL(personalInfo.email)}}{${escapeLaTeX(personalInfo.email)}}\\\\
  \\href{${escapeURL(socialProfiles.portfolio || '')}}{Portfolio: ${escapeLaTeX(socialProfiles.portfolio || '')}} & Mobile:~~~${escapeLaTeX(personalInfo.phone)} \\\\
  \\href{${escapeURL(socialProfiles.github || '')}}{Github: ~~${escapeLaTeX(socialProfiles.github || '')}} \\\\
\\end{tabular*}
`;

  let educationSection = '\\section{~~Education}\n\\resumeSubHeadingListStart\n';
  if (education) {
    education.forEach(edu => {
      educationSection += `
      \\resumeSubheading
      {${escapeLaTeX(edu.institution)}}{${escapeLaTeX(edu.location)}}
      {${escapeLaTeX(edu.degree)}}{${escapeLaTeX(edu.startDate)} - ${escapeLaTeX(edu.endDate)}}
      {\\scriptsize \\textit{ \\footnotesize{\\newline{}\\textbf{GPA:} ${escapeLaTeX(edu.gpa || '')}}}}
      `;
    });
  }
  educationSection += '\\resumeSubHeadingListEnd\n';

  let experienceSection = '\\section{Experience}\n\\resumeSubHeadingListStart\n';
  if (experience) {
    experience.forEach(exp => {
      experienceSection += `
      \\resumeSubheading{${escapeLaTeX(exp.company)}}{${escapeLaTeX(exp.location)}}
      {${escapeLaTeX(exp.position)}}{${escapeLaTeX(exp.startDate)} - ${escapeLaTeX(exp.endDate)}}
      ${generateBullets(exp.bulletPoints)}
      `;
    });
  }
  experienceSection += '\\resumeSubHeadingListEnd\n';

  let projectsSection = '\\section{Projects}\n\\resumeSubHeadingListStart\n';
  if (projects) {
    projects.forEach(proj => {
      projectsSection += `
      \\resumeSubItem{${escapeLaTeX(proj.name)}}{${proj.techStack ? '(' + proj.techStack.map(t => escapeLaTeX(t)).join(', ') + ') ' : ''}${generateBullets(proj.bulletPoints)}}
      \\vspace{2pt}
      `;
    });
  }
  projectsSection += '\\resumeSubHeadingListEnd\n';

  let skillsSection = '\\section{Skills Summary}\n\\resumeSubHeadingListStart\n';
  if (skills.languages) skillsSection += `\\resumeSubItem{Languages}{~~~~~~${skills.languages.map(l => escapeLaTeX(l)).join(', ')}} \n`;
  if (skills.frameworks) skillsSection += `\\resumeSubItem{Frameworks}{~~~~${skills.frameworks.map(f => escapeLaTeX(f)).join(', ')}} \n`;
  if (skills.tools) skillsSection += `\\resumeSubItem{Tools}{~~~~~~~~~~~~~~${skills.tools.map(t => escapeLaTeX(t)).join(', ')}} \n`;
  if (skills.databases) skillsSection += `\\resumeSubItem{Databases}{~~~~~~~~${skills.databases.map(d => escapeLaTeX(d)).join(', ')}} \n`;
  skillsSection += '\\resumeSubHeadingListEnd\n';

  let achievementsSection = '';
  if (achievements && achievements.length > 0) {
    achievementsSection += '\\section{Achievements}\n\\resumeSubHeadingListStart\n';
    achievements.forEach(ach => {
      achievementsSection += `\\resumeSubItem{${escapeLaTeX(ach)}}{}\n\\vspace{-5pt}\n`;
    });
    achievementsSection += '\\resumeSubHeadingListEnd\n';
  }


  return `
\\documentclass[a4paper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.530in}
\\addtolength{\\evensidemargin}{-0.375in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.45in}
\\addtolength{\\textheight}{1in}

\\urlstyle{rm}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-10pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-6pt}]

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[2]{
  \\item\\small{
    \\textbf{#1}{: #2 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeItemWithoutTitle}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{#3} & \\textit{#4} \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeSubItem}[2]{\\resumeItem{#1}{#2}\\vspace{-3pt}}

\\renewcommand{\\labelitemii}{$\\circ$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=*]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-----------------------------
%%%%%%  CV STARTS HERE  %%%%%%

\\begin{document}

%----------HEADING-----------------
${header}

%-----------EDUCATION-----------------
${educationSection}
\\vspace{-5pt}
${skillsSection}
\\vspace{-5pt}
${experienceSection}

%-----------PROJECTS-----------------
\\vspace{-5pt}
${projectsSection}
\\vspace{-5pt}

%-----------Awards-----------------
${achievementsSection}

\\end{document}
`;
}

module.exports = {
  id: 'moderncv',
  name: 'Modern CV (Single Column)',
  generate
};
