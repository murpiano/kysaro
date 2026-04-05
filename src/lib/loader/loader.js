const loadFile                               = require('../load-file');
const {greenColor, errorIcon, warnIcon}      = require('../../utils/utils');
const {hasAnyIssues}                         = require('./report/utils');
const {EXTENSION} = require('./const');
const {generateValidator, validateConfig}    = require('./validate-config');

const loadConfig = (state, keys, paths) => {
  keys.forEach(key => {
    state.settings[key]    = loadFile(key + EXTENSION.JSON, paths.default, paths.user);
    state.schemas[key]     = loadFile(key + EXTENSION.SCHEMA, paths.default);
    state.validators[key]  = generateValidator(key, state.schemas[key]?.data);
    state.validations[key] = validateConfig(key, state.validators[key]?.data, state.settings[key]?.data);
  });
}


const isConfigValid = (state, keys) => {
  const hasIssues   = Object.values(state).some(source => hasAnyIssues(source, keys));
  const hasCritical = Object.values(state).some(source => keys.some(key =>
                                                                      source[key]?.errors?.some(e => e.meta?.isCritical)));

  if (hasIssues) {

    if (hasCritical) {
      console.log(` ${errorIcon} [bvtrots-dx] Critical configuration error detected. Please fix to proceed.`);
      return false;
    }

    console.log(` ${warnIcon} [bvtrots-dx] Warning configuration detected.`);
  }

  return true;
}

const runLoader = (keys, paths) => {
  const state = {
    settings: {},
    schemas: {},
    validators: {},
    validations: {},
  };

  loadConfig(state, keys, paths);
  const isValid = isConfigValid(state, keys);

  return {
    ok: isValid,
    settings: state.settings
  };
};

module.exports = {runLoader};
