/**
 * @file Error system for load-file module.
 *
 * @description
 * Provides structured error classes used during configuration loading.
 *
 * All errors extend {@link LoadFileError} and follow unified format:
 * - human-readable message
 * - machine-readable metadata (`meta`)
 *
 * @design
 * - Supports both critical errors and warnings
 * - Errors are NOT thrown — they are collected and returned
 * - Designed for reporting, logging and CI integration
 *
 * @structure
 * Each error contains:
 * - name (error type)
 * - message (readable description)
 * - meta:
 *   - code (stable identifier)
 *   - isCritical (boolean)
 *   - path / file / args (optional context)
 *   - originalError (for parsing errors)
 */

const { ERROR_NAMES, ERROR_CODES } = require('./errors-const');

/**
 * Base error class for load-file module.
 *
 * @extends Error
 *
 * @param {string} message - Human-readable error message
 * @param {Object} meta - Additional structured metadata
 *
 * @property {string} name
 * @property {Object} meta
 */
class LoadFileError extends Error {
  constructor(message, meta = {}) {
    super(message);
    this.name = ERROR_NAMES.LoadFileError;
    this.meta = meta;
  }
}

/**
 * Thrown when required arguments are missing.
 *
 * @param {string[]} args - Missing argument names
 * @param {boolean} [isCritical=true]
 */
class MissingArgumentsError extends LoadFileError {
  constructor(args, isCritical = true) {
    super(`(critical) missing required arguments: "${args.join(',')}"`, {
      code: ERROR_CODES.MISSING_ARGUMENTS,
      isCritical,
      args
    });
    this.name = ERROR_NAMES.MissingArgumentsError;
  }
}

/**
 * Indicates that file does not exist.
 *
 * @param {string} fileName - File name
 * @param {string} path - Full path
 * @param {boolean} [isCritical=false]
 *
 * @note
 * - Critical → default config missing
 * - Non-critical → user config missing
 */
class FileNotFoundError extends LoadFileError {
  constructor(fileName, path, isCritical = false) {
    super(
      isCritical
        ? `(critical) default settings "${fileName}" not found`
        : `user settings "${fileName}" not found`,
      {
        code: isCritical
          ? ERROR_CODES.DEFAULT_NOT_FOUND
          : ERROR_CODES.USER_NOT_FOUND,
        fileName,
        path,
        isCritical
      }
    );
    this.name = ERROR_NAMES.FileNotFoundError;
  }
}

/**
 * Indicates that fileName exists but is empty.
 *
 * @param {string} fileName
 * @param {string} path
 * @param {boolean} [isCritical=false]
 */
class EmptyFileError extends LoadFileError {
  constructor(fileName, path, isCritical = false) {
    super(
      isCritical
        ? `(critical) default settings "${fileName}" is empty`
        : `user settings "${fileName}" is empty`,
      {
        code: isCritical
          ? ERROR_CODES.EMPTY_DEFAULT_FILE
          : ERROR_CODES.EMPTY_USER_FILE,
        fileName,
        path,
        isCritical
      }
    );
    this.name = ERROR_NAMES.EmptyFileError;
  }
}

/**
 * Indicates invalid JSON format.
 *
 * @param {string} path
 * @param {Error} originalError
 * @param {boolean} [isCritical=false]
 *
 * @note
 * originalError is stored in meta.originalError
 */
class JsonParseError extends LoadFileError {
  constructor(fileName, path, originalError, isCritical = false) {
    super(
      isCritical
        ? `invalid JSON in default settings "${fileName}"`
        : `invalid JSON in user settings "${fileName}"`,
      {
        code: ERROR_CODES.INVALID_JSON,
        fileName,
        path,
        isCritical,
        originalError
      }
    );
    this.name = ERROR_NAMES.JsonParseError;
  }
}

/**
 * Indicates that parsed JSON is an empty object {}.
 *
 * @param {string} path
 * @param {boolean} [isCritical=false]
 *
 * @note
 * - For user config → warning
 * - For default config → critical error
 */
class EmptyObjectError extends LoadFileError {
  constructor(fileName, path, isCritical = false) {
    super(
      isCritical
        ? `(critical) default settings "${fileName}" is empty object`
        : `user settings "${fileName}" is empty object`,
      {
        code: isCritical
          ? ERROR_CODES.EMPTY_DEFAULT_OBJECT
          : ERROR_CODES.EMPTY_USER_OBJECT,
        fileName,
        path,
        isCritical
      }
    );
    this.name = ERROR_NAMES.EmptyObjectError;
  }
}

/**
 * Indicates that user and default paths are identical.
 *
 * @param {string} path
 */
class DuplicatePathError extends LoadFileError {
  constructor(fileName, path) {
    super(`user and default paths are identical for "${fileName}"`, {
      code: ERROR_CODES.DUPLICATE_PATH,
      fileName,
      path
    });
    this.name = ERROR_NAMES.DuplicatePathError;
  }
}

/**
 * Indicates missing directory path.
 *
 * @param {string} fileName
 * @param {boolean} [isCritical=false]
 */
class MissingPathError extends LoadFileError {
  constructor(fileName, isCritical = false) {
    super(
      isCritical
        ? `(critical) default settings path is missing for "${fileName}"`
        : `user settings path is missing for "${fileName}"`,
      {
        code: isCritical
          ? ERROR_CODES.MISSING_DEFAULT_PATH
          : ERROR_CODES.MISSING_USER_PATH,
        fileName,
        isCritical
      }
    );
    this.name = ERROR_NAMES.MissingPathError;
  }
}

/**
 * Indicates unrecoverable loading failure.
 *
 * @param {string} file
 * @param {string} [msg]
 * @param {boolean} [isCritical=true]
 */
class FatalLoadError extends LoadFileError {
  constructor(fileName, msg = '', isCritical = true) {
    super(`(critical) failed to load "${fileName}". ${msg}`.trim(), {
      code: ERROR_CODES.FATAL_LOAD,
      fileName,
      isCritical
    });
    this.name = ERROR_NAMES.FatalLoadError;
  }
}

module.exports = {
  LoadFileError,
  MissingArgumentsError,
  FileNotFoundError,
  EmptyFileError,
  JsonParseError,
  EmptyObjectError,
  DuplicatePathError,
  MissingPathError,
  FatalLoadError,
};
