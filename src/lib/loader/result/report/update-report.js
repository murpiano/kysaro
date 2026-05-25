const fs = require('fs');
const path = require("path");


function _extractSections(content) {
  const sections = [];
  const regex =
    /<!-- SECTION:(.*?) ORDER:(\d+) -->\r?\n([\s\S]*?)(?=\r?\n<!-- SECTION:|$)/g;

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


function _updateReport({
  reportPath,
  section,
  reportSection,
  hideIfValid,
  hasIssues,
  order,
  reportTitle
}) {

  let content = fs.existsSync(reportPath)
    ? fs.readFileSync(reportPath, 'utf8')
    : '';

  const updateTime = new Date().toLocaleString();

  const headerLine = `💫kysaro
## ${reportTitle} report <span style="color: #6a737d; font-size: 12px; font-weight: bold;">&nbsp;Last update:&nbsp;${updateTime}</span>`;


  /*
  |--------------------------------------------------------------------------
  | RESET INVALID REPORT
  |--------------------------------------------------------------------------
  */

  if (!content.includes('💫kysaro')) {
    content = '';

  } else {
    content = content.replace(/💫kysaro[\s\S]*?<\/span>/m, headerLine);

  }


  /*
  |--------------------------------------------------------------------------
  | EXTRACT SECTIONS
  |--------------------------------------------------------------------------
  */

  let sections = _extractSections(content);


  /*
  |--------------------------------------------------------------------------
  | REMOVE PREVIOUS SECTION
  |--------------------------------------------------------------------------
  */

  sections = sections.filter(s => s.id !== section);


  /*
  |--------------------------------------------------------------------------
  | ADD NEW SECTION
  |--------------------------------------------------------------------------
  */

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
    sections
    .map(s => s.content)
    .join('\n\n') +
    '\n';


  fs.mkdirSync(path.dirname(reportPath), {recursive: true});
  fs.writeFileSync(reportPath, finalContent, 'utf8');

}


module.exports = {_updateReport}
