const {LOAD_FILE_LOAD_STRATEGY} = require("../../all/const/load-file");
const {reportDir} = require("../../config");
const {_CLI_MODE, _cliShowResult} = require("./result/cli");
const {_normalizeFiles} = require("./normalize-input-files");
const {_loadSettings} = require("./load-settings");
const {_generateValidator, _validateSettings} = require("./validate-settings");
const {_processStage} = require("./process-stage");
const {_STATE_KEY} = require("./const");
const {_checkValidationIssues} = require("./check-validation-issues");
const {_normalizeOutputSettings} = require("./normalize-output-settings");
const {_createMdReport} = require("./result/report/report");

const _SPECIAL_DIR = {
  DEFAULT: '',
  SCHEMAS: 'schemas',
  COMMITS: 'commits',
}


function _deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;

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


function _runLoader(configuration, userLoaderOptions = {}) {
  const options = _deepMerge(_DEFAULT_LOADER_OPTIONS, userLoaderOptions);
  const normalizedFiles = _normalizeFiles(configuration, options);
  const state = _loadSettings(normalizedFiles, options);

  /*
  |--------------------------------------------------------------------------
  | VALIDATORS
  |--------------------------------------------------------------------------
  */

  Object.values(state.groups).forEach(group => {
    Object.keys(group.schemas).forEach(name => {

      const schema = group.schemas[name];
      const validator = _generateValidator(name, schema.data);

      _processStage({
        state,
        group,
        container: _STATE_KEY.VALIDATORS,
        name,
        result: validator
      });
    });
  });


  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  Object.values(state.groups).forEach(group => {
    Object.keys(group.settings).forEach(name => {

      const validation = _validateSettings(
        name,
        group.validators[name]?.data,
        group.settings[name]?.data
      );

      _processStage({
        state,
        group,
        container: _STATE_KEY.VALIDATIONS,
        name,
        result: validation
      });
    });
  });


  const validation = _checkValidationIssues(state);

  _createMdReport(state, normalizedFiles, options);
  _cliShowResult(validation, options);


  return {
    ok: validation.ok,
    settings: _normalizeOutputSettings(state),
    reports:
    state
  };
}


module.exports = {
  _runLoader
};
