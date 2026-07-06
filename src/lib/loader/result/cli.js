const logger = require("../../../all/helpers/logger");
const pathHelper = require("../../../all/helpers/path");

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


/**
 * Outputs the test results to the CLI.
 *
 * @param {{
 *   ok:boolean,
 *   details:Object
 * }} validation
 * @param {Object} normalizedOptions
 * @returns {void}
 */
function _cliShowResult(validation, normalizedOptions) {
  const {cli} = normalizedOptions.result;

  if (!cli.enabled || cli.mode === _CLI_MODE.NEVER) return;

  Object.values(validation.details).forEach(fileGroup => {
    const {hasIssues, hasCriticalIssues, reportPath} = fileGroup;

    if (hasIssues) {
      const getHelp = () => logger.logDetails(pathHelper.formatCliPath(reportPath))

      if (hasCriticalIssues) {
        logger.logError(`${_CLI_MESSAGE.SETTINGS_ERROR}. ${_CLI_MESSAGE.FIX_TO_PROCEED}`);
        getHelp();
        return;
      }

      if (cli.mode !== _CLI_MODE.CRITICAL) {
        logger.logWarn(_CLI_MESSAGE.SETTINGS_WARNING);
        getHelp();
      }

    } else if (cli.mode === _CLI_MODE.ALWAYS) {

      logger.logSuccess(_CLI_MESSAGE.SETTINGS_SUCCESS)
    }
  })
}

module.exports = {
  _cliShowResult,
  _CLI_MODE,
  _CLI_MESSAGE,
}
