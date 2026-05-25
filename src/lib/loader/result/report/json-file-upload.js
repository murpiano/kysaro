const {_updateReport} = require('./update-report');
const {hasIssues, getErrors, getWarnings} = require('../../../../all/helpers/utils');
const {toSentenceCase} = require('../../../../all/helpers/text');
const {formatDisplayPath, resolvePath} = require('../../../../all/helpers/path');
const {_linkedIcon,_createTableHeader, _formatOriginalError, _buildFileLink} = require("./utils");
const {LOAD_FILE_LOAD_STRATEGY, LOAD_FILE_LOAD_SOURCE} = require("../../../../all/const/load-file");
const {LOADER_ENTITY} = require("../../../../all/const/loader");
const {_ICON, _REPORT_REGISTRY, _DISPLAY_MODE} = require("../../const");


function _buildDiagnostics(key, settings, reportPath) {
  const errors = getErrors(settings);
  const warnings = getWarnings(settings);
  let block = `#### ${key}\n`;

  function _renderIssue(issue, icon) {
    const targetPath = issue.meta?.resolvedPath;
    const displayPath = formatDisplayPath(targetPath);

    const fileLink = targetPath
      ? _buildFileLink(reportPath, targetPath, displayPath) : '';

    return (
      `${icon} ${toSentenceCase(issue.message)}` +
      `${_formatOriginalError(issue.meta?.error)}` +
      (fileLink ? ` in ${fileLink}` : '')
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


function _createJsonFileUploadSection({
  allSettings,
  files,
  targetType,
  reportPath,
  section,
  displayMode,
  reportTitle
}) {

  const keys = files.map(file => file.name);
  const globalHasIssues = keys.some(key => hasIssues(allSettings?.[key]));
  const {title, order} = _REPORT_REGISTRY[section];


  function _createTableBody() {
    const userCells = [];
    const defaultCells = [];
    let diagnosticDetails = '';

    files.forEach(file => {
      const key = file.name;
      const settings = allSettings?.[key];
      const target = file[targetType];
      const strategy = settings?.meta?.strategy;
      const source = settings?.meta?.source;
      const isSchema = targetType === LOADER_ENTITY.SCHEMA;
      const errors = getErrors(settings);
      const warnings = getWarnings(settings);
      const hasErrors = errors.length > 0;
      const hasWarnings = warnings.length > 0;


      /*
      |--------------------------------------------------------------------------
      | USER
      |--------------------------------------------------------------------------
      */

      const userPath = target?.userPath
        ? resolvePath(reportPath, target?.userPath, target?.name) : null;

      if (target?.userPath) {
        if (strategy === LOAD_FILE_LOAD_STRATEGY.USER_ONLY) {
          userCells.push(_linkedIcon(hasErrors ? _ICON.ERROR : _ICON.OK, userPath));

        } else if (strategy === LOAD_FILE_LOAD_STRATEGY.USER_FIRST) {
          if (source === LOAD_FILE_LOAD_SOURCE.USER) {
            userCells.push(_linkedIcon(hasWarnings ? _ICON.WARN : _ICON.OK, userPath));

          } else if (hasWarnings) {
            userCells.push(_linkedIcon(_ICON.WARN, userPath));

          } else {
            userCells.push(` ${_ICON.EMPTY} `);

          }

        } else {
          userCells.push(` ${_ICON.EMPTY} `);
        }

      }


      /*
      |--------------------------------------------------------------------------
      | DEFAULT
      |--------------------------------------------------------------------------
      */

      const defaultPath = target?.defaultPath
        ? resolvePath(reportPath, target?.defaultPath, target?.name) : null;

      if (strategy === LOAD_FILE_LOAD_STRATEGY.DEFAULT_ONLY) {
        defaultCells.push(_linkedIcon(hasErrors ? _ICON.ERROR : _ICON.OK, defaultPath));

      } else if (strategy === LOAD_FILE_LOAD_STRATEGY.USER_ONLY) {
        defaultCells.push(` ${_ICON.EMPTY} `);

      } else if (strategy === LOAD_FILE_LOAD_STRATEGY.USER_FIRST) {
        if (isSchema || source === LOAD_FILE_LOAD_SOURCE.DEFAULT) {
          defaultCells.push(_linkedIcon(hasErrors ? _ICON.ERROR : _ICON.OK, defaultPath));

        } else {
          defaultCells.push(` ${_ICON.EMPTY} `);
        }

      } else {
        defaultCells.push(` ${_ICON.EMPTY} `);
      }


      /*
      |--------------------------------------------------------------------------
      | DIAGNOSTICS
      |--------------------------------------------------------------------------
      */

      if (hasWarnings || hasErrors) {
        diagnosticDetails += _buildDiagnostics(key, settings, reportPath);
      }

    });

    return {
      userCells,
      defaultCells,
      diagnosticDetails
    };

  }


  function _createReport() {
    const sectionTitle = `### ${title}`;
    const tableHeader = _createTableHeader(keys, allSettings);
    const {userCells, defaultCells, diagnosticDetails} = _createTableBody();
    const hasUserSettings = files.some(f => !!f[targetType]?.userPath);
    const userRow = hasUserSettings ? `| User | ${userCells.join(' | ')} |\n` : '';
    const defaultRow = `| Default | ${defaultCells.join(' | ')} |`;


    return (
      `${sectionTitle}\n\n` +
      `${tableHeader}` +
      `${userRow}` +
      `${defaultRow}\n` +
      (diagnosticDetails ? diagnosticDetails : '') +
      `\n________________________________\n`
    );

  }


  _updateReport({
    reportPath,
    section,
    reportSection: _createReport(),
    hideIfValid: displayMode === _DISPLAY_MODE.ONLY_ISSUES,
    hasIssues: globalHasIssues,
    order,
    reportTitle
  });

  return globalHasIssues;
}


module.exports = {
  _createJsonFileUploadSection
};
