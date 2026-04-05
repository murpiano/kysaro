
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

module.exports = (validators, settings, keys, extension, defaultPath, userPath, reportPath, section, displayMode) => {
  const hasIssues      = hasAnyIssues(validators, keys);
  const {title, order} = REPORT_REGISTRY[section];

  const createTableHeader = () => {


    const coloredKeys = keys.map(key => validators[key].errors?.length ? mdRed(key) : key);
    return buildTableHeader(keys, coloredKeys);
  }

  const createTableBody = () => {

    let diagnosticDetails = '';

    keys.forEach(key => {
      const cmp      = validators[key];
      const config   = settings[key];
      const userUsed = isUserConfigUsed(config);


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
