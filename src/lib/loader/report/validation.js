/**
 * @file Validation report generator.
 *
 * @description
 * Generates a markdown report section for configuration validation results.
 *
 * Includes:
 * - table showing validation status (per config key)
 * - visual indicators (✅ ❌)
 * - detailed diagnostics for user configuration errors
 *
 * @responsibility
 * Focuses on user configuration validation:
 * - validates config against compiled schemas
 * - reports invalid structure, types, or values
 *
 * @architecture
 * - Resolves correct config source (user or default)
 * - Builds section content (table + diagnostics)
 * - Delegates file update to updateReport()
 *
 * @diagnostics
 * - Displays only validation errors
 * - For validation errors (meta.type === 'validation'):
 *   - includes field path (e.path)
 *   - includes file location
 * - For internal validator issues:
 *   - displays message only (no path)
 *
 * @note
 * This layer represents USER-FACING errors (invalid config),
 * not internal system failures.
 *
 * @returns {boolean}
 * Returns true if any validation errors were found
 */

const path         = require('path');
const updateReport = require('./update-report');
const {
        REPORT_REGISTRY,
        DISPLAY_MODE, ICON
      }            = require('../const');
const {
        mdRed,
        resolvePath,
        linkedIcon,
        hasAnyIssues,
        isUserConfigUsed,
        buildTableHeader, getBasePath, formatDisplayPath,
      }            = require('./utils');

/**
 * Generates and writes validation report section.
 *
 * @param {Object} validations - Validation results map (AJV execution results)
 * @param {Object} settings - Loaded configuration map (used to resolve paths)
 * @param {string[]} keys - Configuration keys
 * @param {string} extension - Config file extension (e.g. ".json")
 * @param {string} defaultPath - Path to default configs
 * @param {string|false} [userPath=false] - Path to user configs (optional)
 * @param {string} [section] - Report section key
 * @param {boolean} [hideIfValid=true] - Hide section if no issues
 *
 * @returns {boolean} hasIssues - Whether any validation errors exist
 *
 * @description
 * - Builds table with validation results per config
 * - Resolves correct config source (user or default)
 * - Displays validation status (✅ ❌)
 * - Generates detailed error descriptions
 * - Delegates report writing to updateReport()
 */
module.exports = (
  validations,
  settings,
  keys,
  extension,
  defaultPath,
  userPath,
  reportPath,
  section,
  displayMode
) => {
  const hasIssues      = hasAnyIssues(validations, keys);
  const {title, order} = REPORT_REGISTRY[section];

  const createTableHeader = () => {

    // Highlight keys with validation errors
    const coloredKeys = keys.map(key =>
                                   validations[key].errors?.length ? mdRed(key) : key
    );
    return buildTableHeader(keys, coloredKeys);
  }

  const createTableBody = () => {

    // Collect detailed validation errors for report
    let diagnosticDetails = '';

    keys.forEach(key => {
      const validation      = validations[key];
      const config   = settings[key];
      const userUsed = isUserConfigUsed(config);

      // Resolve correct config path depending on source (user/default)
      const basePath    = path.join(
        getBasePath({userUsed, userPath, defaultPath}),
        key + extension
      );
      const displayPath = formatDisplayPath(basePath);

      if (validation.errors.length) {
        diagnosticDetails += `#### 🔴 CRITICAL [${key}]\n`;
        diagnosticDetails += `**Errors:**\n${validation.errors.map((e, i) => {

          // For user validation errors, include field path and file location
          const isValidType = e.meta.type === 'validation';
          let errorMsg      = `* ${e.message}${isValidType ? ` (${e.path}) in \`${displayPath}\`` : ''}`;

          if (e.recommendation && e.recommendation !== validation.errors[i+1]?.recommendation) {
            errorMsg += `\n > **💡 Recommendation:** ${e.recommendation}`;
          }

          return errorMsg;
        }).join('\n')}\n\n`;
      }
    });

    return {diagnosticDetails}
  }

  const createReport = () => {
    const sectionTitle        = `### ${title}`;
    const tableHeader         = createTableHeader();
    const {diagnosticDetails} = createTableBody();

    // Build row showing validation result for each config
    const row =
            `| Validator | ${keys.map(key => {
              const cmp      = validations[key];
              const config   = settings[key];
              const hasError = cmp.errors.length > 0;
              const fileName = key + extension;
              const userUsed = isUserConfigUsed(config);
              const basePath = getBasePath({userUsed, userPath, defaultPath,});
              const relPath  = resolvePath(reportPath, basePath, fileName);

              return linkedIcon(hasError ? ICON.ERROR : ICON.OK, relPath);
            }).join(' | ')} |`;

    return (`${sectionTitle}\n\n` +
            `${tableHeader}${row}\n` +
            (diagnosticDetails
              ? `\n### 🔍 Diagnostic Details\n${diagnosticDetails}`
              : '') +
            `\n________________________________\n`);
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
