const fs = require('fs');


function extractSections(content) {
  const sections = [];

  const regex = /<!-- SECTION:(.*?) ORDER:(\d+) -->\r?\n([\s\S]*?)(?=\r?\n<!-- SECTION:|$)/g;

  let match;

  while ((match = regex.exec(content)) !== null) {
    sections.push({
                    id: match[1].trim(),
                    order: Number(match[2]),
                    content: match[0].trim(),
                  });
  }

  return sections;
}


module.exports = ({
  reportPath,
  section,
  reportSection,
  hideIfValid,
  hasIssues,
  order,
}) => {

  let content = fs.existsSync(reportPath)
    ? fs.readFileSync(reportPath, 'utf8')
    : '';

  const updateTime = new Date().toLocaleString();
  const headerLine = `## 🛠 bvtrots-dx: System Status Report <span style="color: #6a737d; font-size: 12px; font-weight: bold;">&nbsp;Last update:&nbsp;${updateTime}</span>`;


  if (!content.includes('## 🛠 bvtrots-dx')) {
    content = '';
  } else {
    content = content.replace(/^## 🛠 bvtrots-dx: .*/m, headerLine);
  }

  let sections = extractSections(content);

  sections = sections.filter(s => s.id !== section);

  if (!(hideIfValid && !hasIssues)) {
    const sectionWithMeta =
            `<!-- SECTION:${section} ORDER:${order} -->\n` +
            reportSection.trim();

    sections.push({
                    id: section,
                    order,
                    content: sectionWithMeta,
                  });
  }


  sections.sort((a, b) => a.order - b.order);

  const finalContent =
          headerLine +
          '\n\n' +
          sections.map(s => s.content).join('\n\n') +
          '\n';

  fs.writeFileSync(reportPath, finalContent, 'utf8');
};
