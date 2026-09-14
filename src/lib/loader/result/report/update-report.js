const fs = require('fs');
const path = require("path");


/**
 * Extracts report sections from a markdown file.
 *
 * @param {string} content
 * @returns {Array<{
 *   id:string,
 *   order:number,
 *   content:string
 * }>}
 */
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


/**
 * Formats a date as local "YYYY-MM-DD HH:mm:ss".
 *
 * Does not depend on the system locale.
 *
 * @param {Date} date
 * @returns {string}
 */
function _formatUpdateTime(date) {
  const pad = (value) => String(value).padStart(2, '0');

  const day = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-');

  const time = [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join(':');

  return `${day} ${time}`;
}


/**
 * Creates or updates a Markdown report section.
 *
 * If the section already exists, the old version is deleted
 * and replaced with the new one. The file is not rewritten
 * when only the update time would change.
 *
 * @param {Object} params
 * @param {string} params.reportPath
 * @param {string} params.section
 * @param {string} params.reportSection
 * @param {boolean} params.hideIfValid
 * @param {boolean} params.hasIssues
 * @param {number} params.order
 * @param {string} params.reportTitle
 * @returns {void}
 */
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

  const updateTime = _formatUpdateTime(new Date());

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

  const currentContent = content;


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


  /*
  |--------------------------------------------------------------------------
  | SKIP UNCHANGED REPORT
  |--------------------------------------------------------------------------
  | Only the update time would change: keep the file as is.
  */

  if (finalContent === currentContent) {
    return;
  }

  fs.mkdirSync(path.dirname(reportPath), {recursive: true});
  fs.writeFileSync(reportPath, finalContent, 'utf8');

}


module.exports = {_updateReport}
