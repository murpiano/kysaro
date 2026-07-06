const {LOADER_ISSUE_CODE} = require("../../../../all/const/loader");
const {toSentenceCase} = require('../../../../all/helpers/text');
const {hasIssues, getErrors, getWarnings} = require('../../../../all/helpers/utils');
const {  formatDisplayPath, getNearestExistingPath, resolveRelativePath
} = require('../../../../all/helpers/path');
const {_REPORT_REGISTRY, _ICON, _DISPLAY_MODE} = require("../../const");
const {_updateReport} = require('./update-report');
const {_buildFileLink, _linkedIcon, _createReport, _normalizeRecommendations, _formatInternalPath,
  _createArgsBlock,
  _createInfoBlock
} = require("./utils");


/**
 * Determines whether file links should be disabled
 * for a validation result.
 *
 * @param {Object} validation
 * @returns {boolean}
 */
function _shouldDisableLinks(validation) {
  return validation?.issues?.some(
    issue => issue.code === LOADER_ISSUE_CODE.VALIDATOR_NOT_AVAILABLE
  );
}


/**
 * Builds a diagnostics markdown block for a validation result.
 *
 * @param {string} key
 * @param {Object} validation
 * @param {Object} settings
 * @param {string} reportPath
 * @returns {string}
 */
function _buildDiagnostics(key, validation, settings, reportPath) {
  const errors = getErrors(validation);
  const warnings = getWarnings(validation);
  let block = `#### ${key}\n`;


  function _renderIssue(issue, icon){
    const disableLinks = issue.code === LOADER_ISSUE_CODE.VALIDATOR_NOT_AVAILABLE;
    const targetPath = disableLinks ? null : getNearestExistingPath(settings?.meta?.resolvedPath);
    const displayPath = formatDisplayPath(targetPath);
    const fileLink = targetPath ? _buildFileLink(reportPath, targetPath, displayPath) : '';
    const recommendation = _normalizeRecommendations(issue.meta?.recommendation)
    const args = _createArgsBlock(issue);
    const info = _createInfoBlock(issue, args);

    const issuePath = issue.meta?.internalPath
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


/**
 * Creates the validation section of the markdown report.
 *
 * @param {Object} params
 * @param {Object} params.validations
 * @param {Object} params.allSettings
 * @param {Array<Object>} params.files
 * @param {string} params.reportPath
 * @param {string} params.section
 * @param {string} params.displayMode
 * @param {string} params.reportTitle
 * @returns {void}
 */
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
        diagnosticDetails += _buildDiagnostics(key, validation, settings, reportPath);
      }

      const disableLinks = _shouldDisableLinks(validation);
      const targetPath = disableLinks ? null : getNearestExistingPath(settings?.meta?.resolvedPath);
      const relPath = targetPath ? resolveRelativePath(reportPath, targetPath) : null;

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
