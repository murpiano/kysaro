const {
  LOAD_FILE_LOAD_STRATEGY,
  LOAD_FILE_LOAD_SOURCE,
  LOAD_FILE_ISSUE_CODE
} = require("../../../../all/const/load-file");
const {LOADER_ENTITY, LOADER_ISSUE_CODE} = require("../../../../all/const/loader");
const {hasIssues, getErrors, getWarnings} = require('../../../../all/helpers/utils');
const {toSentenceCase} = require('../../../../all/helpers/text');
const {formatDisplayPath, resolvePath} = require('../../../../all/helpers/path');
const {_ICON, _REPORT_REGISTRY, _DISPLAY_MODE} = require("../../const");
const {_updateReport} = require('./update-report');
const {
  _linkedIcon,
  _createTableHeader,
  _formatOriginalError,
  _buildFileLink,
  _normalizeRecommendations, _createArgsBlock, _createInfoBlock,
} = require("./utils");

function isDependencyIssue(issue) {
  return (
    issue.code === LOADER_ISSUE_CODE.DEPENDENCY_LOAD_FAILED ||
    issue.code === LOADER_ISSUE_CODE.DEPENDENCY_NOT_AVAILABLE
  );
}

function _getTargetPath(issue, settings, reportPath) {
  if (isDependencyIssue(issue)) {
    return (issue.meta?.source === LOAD_FILE_LOAD_SOURCE.USER)
      ? resolvePath(reportPath, settings?.meta?.requestedPath)
      : settings?.meta?.resolvedPath
  } else {
    return issue.meta?.resolvedPath
  }
}


function hasMissingArguments(issues) {
  return issues.some(
    issue => issue.code === LOAD_FILE_ISSUE_CODE.MISSING_ARGUMENTS
  );
}

function _buildDiagnostics(key, settings, reportPath) {
  const errors = getErrors(settings);
  const warnings = getWarnings(settings);
  let block = `#### ${key}\n`;

  function _renderIssue(issue, icon) {
    const targetPath = _getTargetPath(issue, settings, reportPath);
    const displayPath = formatDisplayPath(targetPath);
    const fileLink = targetPath ? _buildFileLink(reportPath, targetPath, displayPath) : '';
    const args = _createArgsBlock(issue);
    const info = _createInfoBlock(issue, args);
    const recommendation = _normalizeRecommendations(issue.meta?.recommendation);

    const issueMessage = issue.meta?.owner
        ? issue.message.replace(/^User/i, 'Resource').replace(/^Default/i, 'Resource')
        : issue.message;

    if (issue.code === LOADER_ISSUE_CODE.DEPENDENCY_LOAD_FAILED) {
      const targetPath = issue.meta?.resolvedPath;
      const displayPath = formatDisplayPath(targetPath);

      const fileLink = targetPath
          ? _buildFileLink(reportPath, targetPath, displayPath)
          : '';

      const internalPath = Array.isArray(issue.meta?.internalPath)
          ? issue.meta.internalPath.filter(item => typeof item !== 'number').join('.')
          : '';

      const issuePath = internalPath
          ? ` at <code>${internalPath}</code>`
          : '';

      return (
        `${icon} Failed to load ${issue.meta?.source} settings dependency file` +
        (internalPath ? `${issuePath}`: '') +
        (fileLink ? ` in ${fileLink}`: '')
      );
    }

    return (
      `${icon} ${toSentenceCase(issueMessage)}` +
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
      const issues = settings?.issues || [];

      const userErrors = issues.filter(issue =>
        issue.meta?.source === LOAD_FILE_LOAD_SOURCE.USER &&
        issue.severity === 'error' &&
        !issue.meta?.owner
      );

      const userWarnings = issues.filter(issue =>
        issue.meta?.source === LOAD_FILE_LOAD_SOURCE.USER &&
        issue.severity === 'warning'
      );

      const defaultErrors = issues.filter(issue =>
        issue.meta?.source === LOAD_FILE_LOAD_SOURCE.DEFAULT &&
        issue.severity === 'error'
      );

      const defaultWarnings = issues.filter(issue =>
        issue.meta?.source === LOAD_FILE_LOAD_SOURCE.DEFAULT &&
        issue.severity === 'warning'
      );

      const displayIssues = issues.filter(issue => !issue.meta?.owner);

      const hasErrors = displayIssues.some(issue => issue.severity === 'error');
      const hasWarnings = displayIssues.some(issue => issue.severity === 'warning');

      const userHasErrors = userErrors.length > 0;
      const userHasWarnings = userWarnings.length > 0;

      const defaultHasErrors = defaultErrors.length > 0;
      const defaultHasWarnings = defaultWarnings.length > 0;


      /*
      |--------------------------------------------------------------------------
      | USER
      |--------------------------------------------------------------------------
      */

      const userPath = target?.userPath ? resolvePath(reportPath, target?.userPath, target?.name) : null;
      const missingArguments = hasMissingArguments(issues);
      const safeUserPath = missingArguments ? null : userPath;

      if (strategy === LOAD_FILE_LOAD_STRATEGY.DEFAULT_ONLY) {
        userCells.push(` ${_ICON.OFF} `);

      } else if (
        strategy === LOAD_FILE_LOAD_STRATEGY.USER_FIRST ||
        strategy === LOAD_FILE_LOAD_STRATEGY.USER_ONLY
      ) {

        if (strategy === LOAD_FILE_LOAD_STRATEGY.USER_ONLY) {
          userCells.push(_linkedIcon(hasErrors ? _ICON.ERROR : _ICON.OK, safeUserPath));

        } else if (strategy === LOAD_FILE_LOAD_STRATEGY.USER_FIRST) {

          if (
            hasErrors &&
            !userHasErrors &&
            !defaultHasErrors
          ) {
            userCells.push(_linkedIcon(_ICON.ERROR, safeUserPath));

          } else if (!safeUserPath) {
            userCells.push(_linkedIcon(_ICON.ERROR, safeUserPath));

          } else if (userHasErrors) {
            userCells.push(_linkedIcon(_ICON.ERROR, safeUserPath));

          } else if (userHasWarnings) {
            userCells.push(_linkedIcon(_ICON.WARN, safeUserPath));

          } else if (source === LOAD_FILE_LOAD_SOURCE.USER) {
            userCells.push(_linkedIcon(_ICON.OK, safeUserPath));

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

      const defaultPath = target?.defaultPath ? resolvePath(reportPath, target?.defaultPath, target?.name) : null;
      const safeDefaultPath = missingArguments ? null : defaultPath;

      if (strategy === LOAD_FILE_LOAD_STRATEGY.DEFAULT_ONLY) {
        defaultCells.push(_linkedIcon(hasErrors ? _ICON.ERROR : _ICON.OK, safeDefaultPath));

      } else if (strategy === LOAD_FILE_LOAD_STRATEGY.USER_ONLY) {
        defaultCells.push(` ${_ICON.OFF} `);

      } else if (strategy === LOAD_FILE_LOAD_STRATEGY.USER_FIRST) {

        if (
          hasErrors &&
          !userHasErrors &&
          !defaultHasErrors
        ) {
          defaultCells.push(_linkedIcon(_ICON.ERROR, safeDefaultPath));

        } else if (!target.userPath) {
          defaultCells.push(_linkedIcon(
            defaultHasErrors
              ? _ICON.ERROR
              : defaultHasWarnings
                ? _ICON.WARN
                : _ICON.OK,
            safeDefaultPath
          ));
        } else if (defaultHasErrors) {
          defaultCells.push(_linkedIcon(_ICON.ERROR, safeDefaultPath));

        } else if (defaultHasWarnings) {
          defaultCells.push(_linkedIcon(_ICON.WARN, safeDefaultPath));

        } else if (source === LOAD_FILE_LOAD_SOURCE.DEFAULT) {
          defaultCells.push(_linkedIcon(_ICON.OK, safeDefaultPath));

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
    const userRow = `| User | ${userCells.join(' | ')} |\n`;
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
