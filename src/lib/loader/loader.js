const loadFile                               = require('../load-file');
const {
        CONSOLE_ICON, logMessageHelper
      }                                      = require('../../utils/utils');
const generateSettingsReport                 = require('./report/settings');
const generateValidatorsReport               = require('./report/validators');
const generateValidationReport               = require('./report/validation');
const {hasAnyIssues, formatDisplayPath}      = require('./report/utils');
const {REPORT_KEYS, EXTENSION, DISPLAY_MODE} = require('./const');
const {generateValidator, validateConfig}    = require('./validate-config');

const loadConfig = (state, keys, paths) => {
  keys.forEach(key => {
    state.settings[key]    = loadFile(key + EXTENSION.JSON, paths.default, paths.user);
    state.schemas[key]     = loadFile(key + EXTENSION.SCHEMA, paths.default);
    state.validators[key]  = generateValidator(key, state.schemas[key]?.data);
    state.validations[key] = validateConfig(key, state.validators[key]?.data, state.settings[key]?.data);
  });
}

const generateLoadingReport = (state, keys, paths, reportPath) => {
  generateSettingsReport(state.settings, keys, EXTENSION.JSON, paths.default, paths.user, reportPath, REPORT_KEYS.SETTINGS, DISPLAY_MODE.ALWAYS);
  generateSettingsReport(state.schemas, keys, EXTENSION.SCHEMA, paths.default, false, reportPath, REPORT_KEYS.SCHEMAS, DISPLAY_MODE.ALWAYS);
  generateValidatorsReport(state.validators, state.settings, keys, EXTENSION.SCHEMA, paths.default, paths.user, reportPath, REPORT_KEYS.VALIDATORS, DISPLAY_MODE.ALWAYS);
  generateValidationReport(state.validations, state.settings, keys, EXTENSION.JSON, paths.default, paths.user, reportPath, REPORT_KEYS.VALIDATIONS, DISPLAY_MODE.ALWAYS);
}

const isConfigValid = (state, keys, reportPath) => {
  const hasIssues   = Object.values(state).some(source => hasAnyIssues(source, keys));
  const hasCritical = Object.values(state).some(source => keys.some(key =>
                                                                      source[key]?.errors?.some(e => e.meta?.isCritical)));

  if (hasIssues) {
    const getHelp = () => console.log(logMessageHelper(CONSOLE_ICON.INFO, false, true, formatDisplayPath(reportPath)));

    if (hasCritical) {
      console.log(logMessageHelper(CONSOLE_ICON.ERROR, 'Critical configuration error detected. Please fix to proceed.',));
      getHelp();
      return false;
    }

    console.log(logMessageHelper(CONSOLE_ICON.WARN, 'Warning configuration detected.',));
    getHelp();
  }

  return true;
}

const runLoader = (keys, paths, reportPath) => {
  const state = {
    settings: {},
    schemas: {},
    validators: {},
    validations: {},
  };

  loadConfig(state, keys, paths);
  generateLoadingReport(state, keys, paths, reportPath);
  const isValid = isConfigValid(state, keys, reportPath);

  return {
    ok: isValid,
    settings: state.settings
  };
};

module.exports = {runLoader};

if (require.main === module) {
  const { ConfigPaths, reportPath } = require('./config');
  const { keys } = require('./settings');

  if (!runLoader(keys, ConfigPaths, reportPath).ok) {
    process.exit(1);
  }
}
