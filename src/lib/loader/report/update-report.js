/**
 * @file Markdown report generator with section management.
 *
 * @description
 * Updates a report file by inserting, replacing, or removing sections.
 * Sections are tracked using special HTML comments:
 *
 * <!-- SECTION:<id> ORDER:<number> -->
 *
 * Ensures:
 * - stable ordering of sections
 * - id-based replacement (no duplicates)
 * - optional hiding of sections without issues
 */

const fs = require('fs');

/**
 * Extracts report sections from markdown content.
 *
 * @param {string} content - Full markdown content
 * @returns {Array<{
 *   id: string,
 *   order: number,
 *   content: string
 * }>}
 *
 * @description
 * Parses sections marked with:
 * <!-- SECTION:<id> ORDER:<number> -->
 */
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

/**
 * @file Markdown report updater.
 *
 * @description
 * Manages report sections inside a markdown file.
 *
 * Sections are identified using markers:
 * <!-- SECTION:<id> ORDER:<number> -->
 *
 * Responsibilities:
 * - insert or replace sections by id
 * - preserve deterministic order
 * - optionally hide sections without issues
 * - update report header with timestamp
 *
 * @architecture
 * 1. Read existing report (if exists)
 * 2. Extract sections using markers
 * 3. Remove previous section with same id
 * 4. Optionally add new section
 * 5. Sort sections by order
 * 6. Rebuild full report
 *
 * @param {Object} params
 * @param {string} params.reportPath
 * @param {string} params.section
 * @param {string} params.reportSection
 * @param {boolean} params.hideIfValid
 * @param {boolean} params.hasIssues
 * @param {number} params.order
 *
 * @sideEffects
 * - Reads and writes markdown file
 */
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
