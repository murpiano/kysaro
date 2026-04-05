/**
 * @file Validators report generator.
 *
 * @description
 * Generates a markdown report section for schema validator compilation.
 *
 * Includes:
 * - table showing AJV compilation status per schema
 * - visual indicators (✅ ❌)
 * - detailed diagnostics for schema-related errors
 *
 * @responsibility
 * Focuses on internal validation layer:
 * - JSON schema correctness
 * - AJV compilation errors
 *
 * @architecture
 * - Uses settings to resolve correct file paths
 * - Builds section content (table + diagnostics)
 * - Delegates file update to updateReport()
 *
 * @diagnostics
 * - Displays only errors (no warnings expected at this stage)
 * - Includes schema file path in all messages
 * - Shows additional details (e.details) when available
 * - Includes optional recommendations
 *
 * @note
 * These errors are INTERNAL (package-related), not user config errors.
 *
 * @returns {boolean}
 * Returns true if any validator errors were found
 */

const path                                  = require('path');
const updateReport                          = require('./update-report');
const {REPORT_REGISTRY, DISPLAY_MODE, ICON} = require('../const');
const {
        mdRed,
        resolvePath,
        linkedIcon,
        hasAnyIssues,
        isUserConfigUsed,
        buildTableHeader,
        getBasePath,
        formatDisplayPath,
      }                                     = require('./utils');

/**
 * Generates and writes validators report section.
 *
 * @param {Object} validators - Validator results map (AJV compile results)
 * @param {Object} settings - Loaded configuration map (used for path resolution)
 * @param {string[]} keys - Configuration keys
 * @param {string} extension - Schema file extension (e.g. ".schema.json")
 * @param {string} defaultPath - Path to default schemas
 * @param {string|false} [userPath=false] - Path to user configs (optional)
 * @param {string} [section] - Report section key
 * @param {boolean} [hideIfValid=true] - Hide section if no issues
 *
 * @returns {boolean} hasIssues - Whether any validator errors exist
 *
 * @description
 * - Builds table showing schema compilation status (Ajv.compile)
 * - Links each schema file
 * - Highlights failed validators
 * - Generates diagnostic details for schema errors
 * - Delegates report writing to updateReport()
 */
module.exports = (validators, settings, keys, extension, defaultPath, userPath, reportPath, section, displayMode) => {
  const hasIssues      = hasAnyIssues(validators, keys);
  const {title, order} = REPORT_REGISTRY[section];

  const createTableHeader = () => {

    // Highlight keys with validator errors
    const coloredKeys = keys.map(key => validators[key].errors?.length ? mdRed(key) : key);
    return buildTableHeader(keys, coloredKeys);
  }

  const createTableBody = () => {
    // Collect detailed diagnostics for failed schema compilation
    let diagnosticDetails = '';

    keys.forEach(key => {
      const cmp      = validators[key];
      const config   = settings[key];
      const userUsed = isUserConfigUsed(config);

      // Resolve correct base path depending on config source (user/default)
      const basePath    = getBasePath({userUsed, userPath, defaultPath});
      const fullPath    = path.join(basePath, key + extension);
      const displayPath = formatDisplayPath(fullPath);

      if (cmp.errors.length) {
        diagnosticDetails += `#### 🔴 CRITICAL [${key}]\n`;
        diagnosticDetails += `**Errors:**\n${cmp.errors.map(e => {

          let errorMsg = `* ${e.message}${e.details ? ` (${e.details})` : ''} in \`${displayPath}\``;

          if (e.recommendation) {
            errorMsg += `\n > **💡 Recommendation:** ${e.recommendation}`;
          }

          return errorMsg;

        }).join('\n')}\n\n`;
      }
    });

    return {diagnosticDetails};
  }

  const createReport = () => {
    const sectionTitle        = `### ${title}`;
    const tableHeader         = createTableHeader();
    const {diagnosticDetails} = createTableBody();

    // Build row showing AJV compilation result for each schema
    const row = `| Schema + Ajv.compile | ${keys.map(key => {
      const hasError = validators[key].errors.length > 0;
      const fileName = key + extension;
      const relPath  = resolvePath(reportPath, defaultPath, fileName);

      return linkedIcon(hasError ? ICON.ERROR : ICON.OK, relPath);
    }).join(' | ')} |`;

    return (`${sectionTitle}\n\n` + `${tableHeader}` + `${row}\n` + (diagnosticDetails ? `\n### 🔍 Diagnostic Details\n${diagnosticDetails}` : '') + `\n________________________________\n`);
  }

  updateReport({
                 reportPath,
                 section,
                 reportSection: createReport(),
                 hideIfValid: displayMode === DISPLAY_MODE.ONLY_ISSUES,
                 hasIssues,
                 order
               });

  return hasIssues;
};
