const {logDetails, logError, logWarn, logSuccess} = require("../../../all/helpers/logger");
const {formatCliPath} = require("../../../all/helpers/path");


const _CLI_MODE = {
  ALWAYS: 'always',
  NEVER: 'never',
  ISSUES: 'issues',
  CRITICAL: 'critical',
}

const _CLI_MESSAGE = {
  SETTINGS_SUCCESS: 'Settings loaded successfully',
  SETTINGS_ERROR: 'Critical settings error detected',
  SETTINGS_WARNING: 'Warning settings detected',
  FIX_TO_PROCEED: 'Please fix to proceed',
}


function _cliShowResult(isValid, normalizedOptions) {
  const {report, cli} = normalizedOptions.result;
  const {hasIssues, hasCriticalIssues} = isValid;

  if (!cli.enabled || cli.mode === _CLI_MODE.NEVER) return;

  if (hasIssues) {
    const getHelp = () => logDetails(formatCliPath(report.path))

    if (hasCriticalIssues) {
      logError(`${_CLI_MESSAGE.SETTINGS_ERROR}. ${_CLI_MESSAGE.FIX_TO_PROCEED}`);
      getHelp();
      return;
    }

    if (cli.mode !== _CLI_MODE.CRITICAL) {

      logWarn(_CLI_MESSAGE.SETTINGS_WARNING);
      getHelp();
    }

  } else if (cli.mode === _CLI_MODE.ALWAYS) {

    logSuccess(_CLI_MESSAGE.SETTINGS_SUCCESS)
  }
}

module.exports = {
  _cliShowResult,
  _CLI_MODE,
  _CLI_MESSAGE,
}
