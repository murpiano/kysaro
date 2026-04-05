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

    const coloredKeys = keys.map(key =>
                                   validations[key].errors?.length ? mdRed(key) : key
    );
    return buildTableHeader(keys, coloredKeys);
  }

  const createTableBody = () => {
    let diagnosticDetails = '';

    keys.forEach(key => {
      const validation      = validations[key];
      const config   = settings[key];
      const userUsed = isUserConfigUsed(config);

      const basePath    = path.join(
        getBasePath({userUsed, userPath, defaultPath}),
        key + extension
      );
      const displayPath = formatDisplayPath(basePath);

      if (validation.errors.length) {
        diagnosticDetails += `#### 🔴 CRITICAL [${key}]\n`;
        diagnosticDetails += `**Errors:**\n${validation.errors.map((e, i) => {
          
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
