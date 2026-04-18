# How to Add New Resume Templates

This directory contains the resume templates used by the generator. To add a new template downloaded from Overleaf or elsewhere:

## 1. Create a New Folder
Create a folder for your template (e.g., `my-template`) inside `backend/templates/`.

## 2. Convert .tex to JavaScript
Create a `.js` file (e.g., `template.js`) in that folder. You need to wrap the LaTeX content in a function that injects the user's data.

**Basic Structure:**

```javascript
const { escapeLaTeX } = require('../../utils/latex');

function generate(data) {
    const { personalInfo, experience, education, skills, projects } = data;
    
    // 1. Prepare segments using helper functions or loops
    const experienceSection = experience.map(exp => `
        \\resumeSubheading
        {${escapeLaTeX(exp.company)}}{${escapeLaTeX(exp.location)}}
        {${escapeLaTeX(exp.position)}}{${escapeLaTeX(exp.startDate)} -- ${escapeLaTeX(exp.endDate)}}
    `).join('\n');

    // 2. Return the full LaTeX string
    return `
    \\documentclass[letterpaper,11pt]{article}
    % ... paste the preamble from the Overleaf .tex file here ...
    
    \\begin{document}
    
    % Header
    {\\Huge ${escapeLaTeX(personalInfo.name)}}
    
    % Sections
    \\section{Experience}
    ${experienceSection}
    
    \\end{document}
    `;
}

module.exports = {
    id: 'my-template-id', // Unique ID
    name: 'My New Template', // Display name
    generate
};
```

## 3. Register the Template
Open `backend/templates/index.js` and import your new module:

```javascript
const myTemplate = require('./my-template/template');

const templates = {
    // ... existing templates
    [myTemplate.id]: myTemplate
};
```

## Tips
*   **Use `escapeLaTeX()`**: Always wrap user data in this function to prevent compilation errors with special characters like `&` or `$`.
*   **Modularize**: Break down complex templates into smaller helper functions (like `generateHeader`, `generateExperience`) to keep the code readable.
*   **Static Assets**: If the template uses custom `.cls` files (like Deedy), make sure to put them in the root of the compile job (or handle them in the Docker runner). For now, standard `article` class templates are easiest to add.
