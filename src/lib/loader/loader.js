/**
 * @file Configuration loader pipeline.
 *
 * @description
 * Orchestrates full configuration lifecycle:
 *
 * 1. Loads user and default settings
 * 2. Loads JSON schemas
 * 3. Compiles schemas into AJV validators
 * 4. Validates configuration against schemas
 * 5. Generates markdown reports
 *
 * Acts as a high-level coordinator (pipeline), delegating
 * responsibilities to isolated modules:
 * - loadFile (I/O layer)
 * - validation module (pure logic)
 * - report generators (presentation layer)
 *
 * @architecture
 * Pipeline flow:
 * load → compile → validate → report → result
 *
 * @design
 * - Uses dependency injection (`keys`, `paths`, `reportPath`)
 * - Uses local mutable `state` object as pipeline container
 * - Validation layer is pure and decoupled from loader
 * - Loader contains NO business logic (only orchestration)
 *
 * @state
 * Internal pipeline state structure:
 * {
 *   settings: Record<string, LoadResult>,
 *   schemas: Record<string, LoadResult>,
 *   validators: Record<string, ValidatorResult>,
 *   validations: Record<string, ValidationResult>
 * }
 *
 * @sideEffects
 * - Reads files from filesystem (via loadFile)
 * - Writes report to filesystem
 * - Outputs logs to console
 *
 * @cliBehavior
 * When executed directly:
 * - resolves keys and paths from environment
 * - runs full pipeline
 * - exits process on critical errors
 *
 * @testability
 * Fully testable via `runLoader()`:
 * - accepts injected keys
 * - accepts custom paths (fixtures)
 * - accepts custom report output path
 *
 * @note
 * This module is NOT pure and acts as CLI/bootstrap layer.
 */

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

/**
 * Loads and prepares configuration for all keys.
 *
 * @param {Object} state - Mutable pipeline state container
 * @param {string[]} keys - List of configuration keys
 * @param {{ default: string, user?: string }} paths - Paths to config sources
 *
 * @description
 * For each configuration key:
 * - loads user/default settings
 * - loads schema
 * - compiles validator from schema
 * - validates settings using compiled validator
 *
 * Uses raw data (schema, config) and passes them into pure validation functions.
 *
 * @mutates state
 * Populates:
 * - state.settings
 * - state.schemas
 * - state.validators
 * - state.validations
 *
 * @note
 * Does NOT throw. All errors are collected into state.
 */
const loadConfig = (state, keys, paths) => {
  keys.forEach(key => {
    state.settings[key]    = loadFile(key + EXTENSION.JSON, paths.default, paths.user);
    state.schemas[key]     = loadFile(key + EXTENSION.SCHEMA, paths.default);
    state.validators[key]  = generateValidator(key, state.schemas[key]?.data);
    state.validations[key] = validateConfig(key, state.validators[key]?.data, state.settings[key]?.data);
  });
}

/**
 * Generates full configuration report.
 *
 * @param {Object} state - Pipeline state container
 * @param {string[]} keys - Configuration keys
 * @param {{ default: string, user?: string }} paths - Paths to config sources
 * @param {string} reportPath - Absolute path to report file
 *
 * @description
 * Produces markdown report containing:
 * - settings loading results
 * - schema loading results
 * - validator compilation results
 * - validation results
 *
 * Delegates rendering to report modules.
 *
 * @sideEffects
 * Writes report file to disk.
 *
 * @note
 * Report generation is independent of validation result.
 */
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

/**
 * Executes full configuration loading pipeline.
 *
 * @param {string[]} keys - Configuration keys
 * @param {{ default: string, user?: string }} paths - Paths to config sources
 * @param {string} reportPath - Absolute path to report file
 *
 * @returns {{
 *   ok: boolean,
 *   settings: Record<string, any>
 * }}
 *
 * @description
 * Runs all pipeline stages:
 * - loadConfig
 * - generateLoadingReport
 * - isConfigValid
 *
 * Designed for:
 * - CLI usage (real filesystem)
 * - integration testing (fixtures)
 *
 * @sideEffects
 * - File system reads/writes
 * - Console output
 *
 * @note
 * Never throws. All failures are reflected in returned `ok` flag.
 */
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
