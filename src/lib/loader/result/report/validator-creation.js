const {_updateReport} = require("./update-report");
const {hasIssues, getErrors, getWarnings} = require('../../../../all/helpers/utils');
const {toSentenceCase} = require('../../../../all/helpers/text');
const {
  formatDisplayPath, getNearestExistingPath, resolvePath
} = require('../../../../all/helpers/path');
const {
  _buildFileLink,
  _linkedIcon,
  _createReport,
  _normalizeRecommendations
} = require("./utils");
const path = require("path");
const {_formatOriginalError} = require("./utils");
const {_ICON, _REPORT_REGISTRY, _DISPLAY_MODE} = require("../../const");


function _buildDiagnostics(key, validator, reportPath, file) {
  const errors = getErrors(validator);
  const warnings = getWarnings(validator);
  let block = `#### ${key}\n`;

  function _renderIssue(issue, icon) {

    const absolutePath = file?.schema?.defaultPath
        ? path.resolve(file.schema.defaultPath, file.schema.name) : null;

    const targetPath = getNearestExistingPath(absolutePath);
    const displayPath = formatDisplayPath(targetPath);

    const fileLink = targetPath
      ? _buildFileLink(reportPath, targetPath, displayPath) : '';

    const info = issue.meta?.info
        ? `<br><sub>ℹ️ ${issue.meta.info}</sub>` : '';

    const recommendation = _normalizeRecommendations(issue.meta?.recommendation)

    return (
      `${icon} ${toSentenceCase(issue.message)}` +
      `${_formatOriginalError(issue.meta?.error)}` +
      (fileLink ? ` in ${fileLink}` : '') +
      `${info}` +
      `${recommendation}`
    );

  }


  if (warnings.length > 0) {
    block += warnings.map(warning => _renderIssue(warning, _ICON.WARN)).join('<br>\n');
  }

  if (warnings.length > 0 && errors.length > 0) {
    block += '\n\n';
  }

  if (errors.length > 0) {
    block += errors.map(error => _renderIssue(error, _ICON.ERROR)).join('<br>\n');
    block += '\n';
  }

  return block + '\n';
}


function _createValidatorCreationSection({
  validators,
  files,
  reportPath,
  section,
  displayMode,
  reportTitle
}) {

  const keys = files.map(file => file.name);
  const globalHasIssues = keys.some(key => hasIssues(validators?.[key]));
  const {title, order} = _REPORT_REGISTRY[section];

  function _createTableBody() {
    let diagnosticDetails = '';

    const row = `| Schema + Ajv.compile | ${files.map(file => {
      const key = file.name;
      const validator = validators?.[key];
      const hasErrors = getErrors(validator).length > 0;

      if (hasIssues(validator)) {
        diagnosticDetails += _buildDiagnostics(key, validator, reportPath, file);
      }

      const relPath = file.schema
          ? resolvePath(reportPath, file.schema.defaultPath, file.schema.name)
          : null;

      return _linkedIcon(hasErrors ? _ICON.ERROR : _ICON.OK, relPath);

    }).join(' | ')} |`;


    return {
      row,
      diagnosticDetails
    };

  }


  _updateReport({
    reportPath,
    section,
    reportSection: _createReport(title, keys, validators, _createTableBody()),
    hideIfValid: displayMode === _DISPLAY_MODE.ONLY_ISSUES,
    hasIssues: globalHasIssues,
    order,
    reportTitle
  });

}


module.exports = {
  _createValidatorCreationSection
};
