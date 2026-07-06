const {LOAD_FILE_LOAD_STRATEGY} = require("../../all/const/load-file");
const {reportDir} = require("../../config");
const {_CLI_MODE} = require("./result/cli");
const {_STATE_KEY} = require("./const");
const normalizeInputFiles = require("./normalize-input-files");
const loadSettingsModule = require("./load-settings");
const validateSettingsModule = require("./validate-settings");
const validationIssuesModule = require("./check-validation-issues");
const normalizeOutputModule = require("./normalize-output-settings");
const reportModule = require("./result/report/report");
const cliModule = require("./result/cli");


/**
 * Internal directory aliases.
 *
 * @type {Object}
 */
const _SPECIAL_DIR = {
  DEFAULT: '',
  SCHEMAS: 'schemas',
  COMMITS: 'commits',
}


/**
 * Deeply merges source object into target object.
 *
 * Arrays are replaced, not merged.
 *
 * @param {Object} target Base object.
 * @param {Object} source Override object.
 * @returns {Object}
 */
function _deepMerge(target, source) {
  if (!source || typeof source !== 'object') {
    return {...target};
  }

  const result = {...target};

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = _deepMerge(result[key] || {}, source[key]);
      } else if (source[key] !== undefined) {
        result[key] = source[key];
      }
    }
  }

  return result;
}


/**
 * Default loader configuration.
 *
 * @type {Object}
 */
const _DEFAULT_LOADER_OPTIONS = {
  files: {
    strategy: LOAD_FILE_LOAD_STRATEGY.USER_FIRST,
    specialDir: {
      user: _SPECIAL_DIR.DEFAULT,
      default: _SPECIAL_DIR.DEFAULT
    }
  },

  schemas: {
    enabled: true,
    strategy: LOAD_FILE_LOAD_STRATEGY.DEFAULT_ONLY,
    specialDir: {
      default: _SPECIAL_DIR.SCHEMAS
    }
  },

  validation: {
    enabled: true
  },

  result: {
    report: {
      enabled: true,
      dir: reportDir
    },

    cli: {
      enabled: true,
      mode: _CLI_MODE.ISSUES
    }
  }
};


/**
 * Loads, validates and normalizes settings.
 *
 * Pipeline:
 * - normalize input files
 * - load settings and schemas
 * - create validators
 * - validate settings
 * - generate report
 * - print CLI output
 *
 * @param {Object} configuration Loader configuration.
 * @param {Object} [userLoaderOptions={}] User options.
 * @returns {{
 *   ok:boolean,
 *   settings:Object,
 *   reports:Object
 * }}
 */
function _runLoader(configuration, userLoaderOptions = {}) {
  const options = _deepMerge(_DEFAULT_LOADER_OPTIONS, userLoaderOptions);
  const normalizedFiles = normalizeInputFiles._normalizeFiles(configuration, options);
  const state = loadSettingsModule._loadSettings(normalizedFiles, options);

  /*
  |--------------------------------------------------------------------------
  | VALIDATORS
  |--------------------------------------------------------------------------
  */

  Object.values(state.groups).forEach(group => {
    Object.keys(group.schemas).forEach(name => {

      const schema = group.schemas[name];
      const validator = validateSettingsModule._generateValidator(name, schema.data);

      group[_STATE_KEY.VALIDATORS][name] = validator;
      state.issues.push(...(validator?.issues || []));

    });
  });


  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  Object.values(state.groups).forEach(group => {
    Object.keys(group.settings).forEach(name => {

      const validation = validateSettingsModule._validateSettings(
        name,
        group.validators[name]?.data,
        group.settings[name]?.data
      );

      group[_STATE_KEY.VALIDATIONS][name] = validation;
      state.issues.push(...(validation?.issues || []));

    });
  });

  const validation = validationIssuesModule._checkValidationIssues(state);

  reportModule._createMdReport(state, normalizedFiles, options);
  cliModule._cliShowResult(validation, options);


  return {
    ok: validation.ok,
    settings: normalizeOutputModule._normalizeOutputSettings(state),
    reports:
    state
  };
}


module.exports = {
  _runLoader
};
