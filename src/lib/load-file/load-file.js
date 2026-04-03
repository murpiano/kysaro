/**
 * @file Core logic for loading configuration files.
 *
 * @description
 * Implements full file loading strategy with fallback:
 *
 * 1. Attempts to load user configuration (if provided)
 * 2. Falls back to default configuration
 * 3. Handles edge cases:
 *    - missing paths
 *    - duplicate paths
 *    - invalid JSON
 *    - critical failures
 *
 * Ensures a consistent structured response without throwing exceptions.
 *
 * @architecture
 * Flow:
 * user → fallback → default → fail
 *
 * @returnsContract
 * Always returns an object:
 * {
 *   ok: boolean,
 *   data: Object|null,
 *   info: string[],
 *   warnings: Error[],
 *   errors: Error[]
 * }
 *
 * @sideEffects
 * - Reads files from filesystem via readJson
 * - Mutates warnings/errors arrays passed to readJson
 *
 * @note
 * - Does NOT throw exceptions
 * - Errors are collected and returned in structured form
 * - Distinguishes between critical and non-critical failures
 */

const path     = require('path');
const readJson = require('./read-json');
const {
        MissingArgumentsError,
        DuplicatePathError,
        FatalLoadError,
        MissingPathError
      }        = require('./errors');


/**
 * Loads configuration file with fallback strategy.
 *
 * @param {string} fileName - Name of the configuration file (e.g. "config.json")
 * @param {string} defaultSettingsDir - Path to default configuration directory
 * @param {string|false} [userSettingsDir=false] - Path to user configuration directory
 *
 * @returns {{
 *   ok: boolean,
 *   data: Object|null,
 *   info: string[],
 *   warnings: Array<Error>,
 *   errors: Array<Error>
 * }}
 *
 * @description
 * Loading strategy:
 *
 * 1. If userSettingsDir is provided:
 *    - Attempts to load user config
 *    - If valid → returns user config
 *    - If invalid → falls back to default
 *
 * 2. If user config path equals default path:
 *    - Emits warning
 *    - May produce fatal error if user config is invalid
 *
 * 3. Loads default config:
 *    - If valid → returns default config
 *    - If invalid → returns critical failure
 *
 * 4. Handles missing arguments and paths
 *
 * @returns
 * - ok: true if config successfully loaded
 * - data: parsed JSON or null
 * - info: informational messages (e.g. which config was used)
 * - warnings: non-critical issues
 * - errors: critical or blocking issues
 *
 * @example
 * loadFile('config.json', './defaults', './user')
 */
const loadFile = (fileName, defaultSettingsDir, userSettingsDir = false) => {
  const info     = [];
  const warnings = [];
  const errors   = [];


  if (!fileName) {
    errors.push(new MissingArgumentsError(['fileName'], true));
    return {ok: false, data: null, info, warnings, errors};
  }

  const defaultPath = defaultSettingsDir
    ? path.resolve(defaultSettingsDir, fileName)
    : null;

  if (userSettingsDir !== false) {
    if (!userSettingsDir) {
      warnings.push(new MissingPathError(fileName));
    } else {
      const userPath      = path.resolve(userSettingsDir, fileName);
      const pathsAreEqual =
              userPath && defaultPath && userPath === defaultPath;

      if (pathsAreEqual) {
        warnings.push(new DuplicatePathError(userPath));
      }

      const userData = readJson(fileName, userPath, {
        isCritical: false,
        warnings,
        errors
      });

      if (userData && Object.keys(userData).length !== 0) {
        info.push('User settings are used');
        return {ok: true, data: userData, info, warnings, errors};
      }

      if (pathsAreEqual) {
        errors.push(
          new FatalLoadError(
            fileName,
            'user settings are incorrect, paths to default settings and user settings are identical'
          )
        );
        return {ok: false, data: null, info, warnings, errors};
      }
    }
  }



  if (!defaultPath) {
    errors.push(new MissingPathError(fileName, true));
    return {ok: false, data: null, info, warnings, errors};
  }

  const defaultData = readJson(fileName, defaultPath, {
    isCritical: true,
    warnings,
    errors
  });

  if (defaultData) {
    info.push('Default settings are used');
    return {ok: true, data: defaultData, info, warnings, errors};
  }

  errors.push(new FatalLoadError(fileName));
  return {ok: false, data: null, info, warnings, errors};
}

module.exports = loadFile;
