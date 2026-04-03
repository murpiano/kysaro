/**
 * @file JSON file reader utility.
 *
 * @description
 * Reads and parses JSON files from filesystem.
 *
 * Handles common file-related errors:
 * - file not found
 * - empty file
 * - invalid JSON syntax
 * - empty JSON object
 *
 * Does NOT throw exceptions. All errors are collected into
 * provided `errors` / `warnings` arrays.
 *
 * @architecture
 * This module is a low-level I/O utility used by load-file module.
 * It does not decide fallback logic or configuration validity.
 *
 * @sideEffects
 * - Reads files from filesystem
 * - Mutates provided `errors` and `warnings` arrays
 *
 * @note
 * - Returns `null` on failure
 * - Returns parsed object on success
 * - Empty object `{}` is allowed but reported as an issue
 */

const fs = require('fs');
const {
        FileNotFoundError,
        EmptyFileError,
        EmptyObjectError,
        JsonParseError
      }  = require('./errors');


/**
 * Reads and parses a JSON file.
 *
 * @param {string} fileName - Name of the file (used for error messages)
 * @param {string|null} filePath - Absolute path to file
 * @param {{
 *   isCritical?: boolean,
 *   errors: Array<Error>,
 *   warnings: Array<Error>
 * }} [options={}] - Error handling configuration
 *
 * @returns {Object|null}
 *
 * @description
 * Processing steps:
 *
 * 1. Validates file existence
 * 2. Reads file content
 * 3. Checks for empty content
 * 4. Parses JSON
 * 5. Validates that result is a non-null object
 * 6. Reports empty object as a warning/error (non-blocking)
 *
 * @behavior
 * - If `isCritical` is true → errors are pushed into `errors`
 * - Otherwise → pushed into `warnings`
 *
 * @returns
 * - Parsed object if successful
 * - `null` if any critical failure occurred
 *
 * @sideEffects
 * Mutates:
 * - options.errors
 * - options.warnings
 *
 * @example
 * const errors = [];
 * const warnings = [];
 *
 * const data = readJson('config.json', '/path/config.json', {
 *   isCritical: true,
 *   errors,
 *   warnings
 * });
 */
module.exports = (fileName, filePath, options = {}) => {
  const { isCritical = false, errors=[], warnings=[] } = options;
  if (!filePath) return null;

  try {
    if (!fs.existsSync(filePath)) {
      const err = new FileNotFoundError(fileName, filePath, isCritical);
      isCritical ? errors.push(err) : warnings.push(err);
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf8').trim();

    if (!content) {
      const err = new EmptyFileError(fileName, filePath, isCritical);
      isCritical ? errors.push(err) : warnings.push(err);
      return null;
    }

    const data = JSON.parse(content);

    if (Object.keys(data).length === 0) {
      const err = new EmptyObjectError(filePath, isCritical);
      isCritical ? errors.push(err) : warnings.push(err);
    }

    return data;

  } catch (e) {
    const err = new JsonParseError(filePath, e, isCritical);
    isCritical ? errors.push(err) : warnings.push(err);
    return null;
  }
}
