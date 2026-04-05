/**
 * @file Settings report generator.
 *
 * @description
 * Generates a markdown report section for configuration loading results.
 *
 * Includes:
 * - table showing user/default config usage
 * - visual status indicators (✅ ⚠️ ❌ ➖)
 * - detailed diagnostics for loading issues (errors & warnings)
 *
 * @responsibility
 * Focuses on configuration loading stage:
 * - file existence
 * - JSON parsing
 * - empty file/object checks
 *
 * @architecture
 * - Builds section content (table + diagnostics)
 * - Delegates file update to updateReport()
 * - Does NOT mutate input data
 *
 * @diagnostics
 * - Displays both warnings and errors
 * - Includes file path if available (meta.path)
 * - Uses error.toString() for consistent formatting
 *
 * @returns {boolean}
 * Returns true if any issues (warnings or errors) were found
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
        isDefaultConfigUsed,
        buildTableHeader, formatDisplayPath, getBasePath,
      }                                     = require('./utils');

/**
 * Builds diagnostic block for a specific config key.
 *
 * @param {string} key - Configuration key
 * @param {{
 * errors: Array<any>,
 * warnings: Array<any>
 * }} config
 * @returns {string} Markdown formatted diagnostics block
 *
 * @description
 * Generates a detailed section with errors and warnings
 * for inclusion in the report.
 */

const buildDiagnostics = (key, config) => {
  const {errors, warnings} = config;
  const hasErrors          = errors.length > 0;

  let block = `#### ${hasErrors ? '🔴 CRITICAL' : '🟡 WARNING'} [${key}]\n`;

  const renderList = (list) => list.map(item => {
    const fullPath    = item.meta?.path;
    const displayPath = formatDisplayPath(fullPath);

    return `* ${item}${fullPath ? ` in \`${displayPath}\`` : ''}`;
  }).join('\n');

  if (warnings.length > 0) {
    block += `**Warnings:**\n${renderList(warnings)}\n`;
  }

  if (hasErrors) {
    block += `\n**Errors:**\n${renderList(errors)}\n`;
  }

  return block + '\n';
};

/**
 * Generates and writes settings report section.
 *
 * @param {Object} settings - Loaded configuration map
 * @param {string[]} keys - Configuration keys
 * @param {string} extension - File extension (e.g. ".json")
 * @param {string} defaultPath - Path to default configs
 * @param {string|false} [userPath=false] - Path to user configs (optional)
 * @param {string} [section] - Report section key
 * @param {boolean} [hideIfValid=false] - Hide section if no issues
 *
 * @returns {boolean} hasIssues - Whether any issues were found
 *
 * @description
 * - Builds status table for settings
 * - Marks config source (user/default)
 * - Adds visual clickable indicators (success, warning, error)
 * - Appends diagnostic details if issues exist
 * - Delegates writing to updateReport()
 */
module.exports = (
  settings,
  keys,
  extension,
  defaultPath,
  userPath,
  reportPath,
  section,
  displayMode
) => {
  const hasIssues      = hasAnyIssues(settings, keys);
  const {title, order} = REPORT_REGISTRY[section];

  const createTableHeader = () => {

    // Highlight keys where config failed to load
    const coloredKeys = keys.map(key => {
      const isLoaded = settings[key].info.some(msg =>
                                                 msg.includes('settings are used')
      );
      return isLoaded ? key : mdRed(key);
    });
    return buildTableHeader(keys, coloredKeys);
  }

  const createTableBody = () => {
    const userCells       = [];
    const defaultCells    = [];
    let diagnosticDetails = '';

    keys.forEach(key => {
      const config      = settings[key];
      const fileName    = key + extension;
      const hasErrors   = config.errors.length > 0;
      const hasWarnings = config.warnings.length > 0;
      const defaultUsed = isDefaultConfigUsed(config);
      const userUsed    = isUserConfigUsed(config);
      const defRel      = resolvePath(reportPath, defaultPath, fileName);
      const usrRel      = userPath
        ? resolvePath(reportPath, userPath, fileName)
        : null;

      if (userPath) {
        if (userUsed) {
          userCells.push(linkedIcon(hasWarnings ? ICON.WARN : ICON.OK, usrRel));
        } else if (hasErrors || hasWarnings) {
          userCells.push(linkedIcon(ICON.WARN, usrRel));
        } else {
          userCells.push(` ${ICON.EMPTY} `);
        }
      }

      if (defaultUsed) {
        const hasCritical = config.errors.some(
          e => e.meta?.isCritical
        );
        defaultCells.push(linkedIcon(hasCritical ? ICON.ERROR : ICON.OK, defRel));
      } else if (hasErrors && !userUsed) {
        defaultCells.push(linkedIcon(ICON.ERROR, defRel));
      } else {
        defaultCells.push(` ${ICON.EMPTY} `);
      }

      // Collect detailed diagnostics for problematic configs
      if (hasErrors || hasWarnings) {
        diagnosticDetails += buildDiagnostics(key, config);
      }
    });

    return {userCells, defaultCells, diagnosticDetails}
  }

  const createReport = () => {
    const sectionTitle                                 = `### ${title}`;
    const tableHeader                                  = createTableHeader();
    const {userCells, defaultCells, diagnosticDetails} = createTableBody();

    const userRow    = userPath
      ? `| User | ${userCells.join(' | ')} |\n`
      : '';
    const defaultRow = `| Default | ${defaultCells.join(' | ')} |`;

    return (
      `${sectionTitle}\n\n` +
      `${tableHeader}` +
      `${userRow}` +
      `${defaultRow}\n` +
      (diagnosticDetails
        ? `\n### 🔍 Diagnostic Details\n${diagnosticDetails}`
        : '') +
      `\n________________________________\n`)
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
