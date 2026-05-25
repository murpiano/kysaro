const {_updateReport} = require('./update-report');
const {LOADER_ISSUE_CODE} = require("../../../../all/const/loader");
const {hasIssues, getErrors, getWarnings} = require('../../../../all/helpers/utils');
const {toSentenceCase} = require('../../../../all/helpers/text');
const {  formatDisplayPath, getNearestExistingPath, resolveRelativePath
} = require('../../../../all/helpers/path');
const {_buildFileLink, _linkedIcon, _createReport, _normalizeRecommendations} = require("./utils");
const {_REPORT_REGISTRY, _ICON, _DISPLAY_MODE} = require("../../const");


function _shouldDisableLinks(validation) {
  return validation?.issues?.some(
    issue => issue.code === LOADER_ISSUE_CODE.VALIDATOR_NOT_AVAILABLE
  );
}


function _formatInternalPath(path) {
  return path ? path : '';
}


function _buildDiagnostics(key, validation, settings, reportPath) {
  const errors = getErrors(validation);
  const warnings = getWarnings(validation);
  let block = `#### ${key}\n`;


  function _renderIssue(issue, icon){
    const disableLinks = issue.code === LOADER_ISSUE_CODE.VALIDATOR_NOT_AVAILABLE;

    const targetPath = disableLinks
      ? null : getNearestExistingPath(settings?.meta?.resolvedPath);

    const displayPath = formatDisplayPath(targetPath);

    const fileLink = targetPath
      ? _buildFileLink(reportPath, targetPath, displayPath) : '';

    const recommendation = _normalizeRecommendations(issue.meta?.recommendation)

    const args =
      Array.isArray(issue.meta?.args) &&
      issue.meta.args.length > 0
        ? ` ${issue.meta.args
        .map(arg =>
          `<span style="color:#589df6">${String(arg).replace(/^'|'$/g, '')}</span>`
        )
        .join(', ')}`
        : '';

    const info =
      issue.meta?.info
        ? `<br><sup style="color: #888;"> &nbsp; &nbsp; &nbsp; &nbsp; ${issue.meta.info} ${args}</sup>`
        : '';

    const issuePath =
      issue.meta?.internalPath
        ? ` at <code>${_formatInternalPath(issue.meta.internalPath)}</code>`
        : '';

    return (
      `${icon} ${toSentenceCase(issue.message)}` +
      `${issuePath}` +
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


function _createFileValidationSection({
  validations,
  allSettings,
  files,
  reportPath,
  section,
  displayMode,
  reportTitle
}) {

  const keys = files.map(file => file.name);
  const globalHasIssues = keys.some(key => hasIssues(validations?.[key]));
  const {title, order} = _REPORT_REGISTRY[section];

  function _createTableBody() {
    let diagnosticDetails = '';

    const row = `| Validator | ${files.map(file => {
      const key = file.name;
      const validation = validations?.[key];
      const settings = allSettings?.[key];
      const hasErrors = getErrors(validation).length > 0;

      if (hasIssues(validation)) {
        diagnosticDetails +=
          _buildDiagnostics(key, validation, settings, reportPath);
      }

      const disableLinks = _shouldDisableLinks(validation);

      const targetPath = disableLinks
          ? null : getNearestExistingPath(settings?.meta?.resolvedPath);

      const relPath = targetPath
          ? resolveRelativePath(reportPath, targetPath) : null;

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
    reportSection: _createReport(title, keys, validations, _createTableBody()),
    hideIfValid: displayMode === _DISPLAY_MODE.ONLY_ISSUES,
    hasIssues: globalHasIssues,
    order,
    reportTitle
  });

}


module.exports = {
  _createFileValidationSection
};
