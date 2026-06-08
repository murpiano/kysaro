const fs = require('fs');
const path = require('path');
const {LOAD_FILE_ISSUE_CODE} = require('../../all/const/load-file');


/**
 * Resolves display name for metadata.
 *
 * @param {string|null} filePath
 * @param {string|null} name
 * @returns {string|null}
 */
function _resolveMetaName(filePath, name) {
  return name || (filePath ? path.basename(filePath) : null);
}


/**
 * Creates initial JSON read result.
 *
 * @param {string|null} filePath
 * @param {string|null} name
 * @returns {Object}
 */
function _createResult(filePath, name) {

  return {
    ok: true,
    data: null,
    issues: [],
    meta: {
      name: _resolveMetaName(filePath, name),
      requestedPath: filePath || null,
      resolvedPath: filePath || null
    }
  };
}


/**
 * Creates read-json issue object.
 *
 * @param {Object} params
 * @param {string} params.code
 * @param {string|null} params.filePath
 * @param {Error|null} [params.error=null]
 * @param {string|null} params.name
 * @returns {Object}
 */
function _createIssue({code, filePath, error = null, name}) {

  return {
    code,
    meta: {
      name: _resolveMetaName(filePath, name),
      requestedPath: filePath || null,
      resolvedPath: filePath || null,
      error
    }
  };
}


/**
 * Marks result as failed and appends issue.
 *
 * @param {Object} result
 * @param {Object} issue
 * @returns {Object}
 */
function _fail(result, issue) {
  result.ok = false;
  result.issues.push(issue);
  return result;
}


/**
 * Reads and validates JSON file.
 *
 * Validation steps:
 * - path exists
 * - file exists
 * - file is readable
 * - file is not empty
 * - JSON is valid
 * - root value is a non-empty object
 *
 * @param {string|null} filePath
 * @param {string|null} name
 * @returns {Object}
 */
function _readJson(filePath = null, name = null) {
  const result = _createResult(filePath, name);

  /*
  |------------------------------------------------------------------
  | MISSING PATH
  |------------------------------------------------------------------
  */

  if (!filePath) {
    return _fail(
      result,
      _createIssue({code: LOAD_FILE_ISSUE_CODE.PATH_MISSING, filePath, name})
    );
  }

  /*
  |------------------------------------------------------------------
  | EXISTS
  |------------------------------------------------------------------
  */

  if (!fs.existsSync(filePath)) {

    return _fail(
      result,
      _createIssue({code: LOAD_FILE_ISSUE_CODE.FILE_NOT_FOUND, filePath, name})
    );
  }

  /*
  |------------------------------------------------------------------
  | READ
  |------------------------------------------------------------------
  */

  let raw = '';

  try {
    raw = fs.readFileSync(filePath, 'utf8');

  } catch (error) {

    return _fail(
      result,
      _createIssue({code: LOAD_FILE_ISSUE_CODE.FATAL_LOAD, filePath, error, name})
    );
  }

  /*
  |------------------------------------------------------------------
  | EMPTY FILE
  |------------------------------------------------------------------
  */

  if (!raw.trim()) {

    return _fail(
      result,
      _createIssue({code: LOAD_FILE_ISSUE_CODE.EMPTY_FILE, filePath, name})
    );
  }

  /*
  |------------------------------------------------------------------
  | PARSE
  |------------------------------------------------------------------
  */

  try {
    result.data = JSON.parse(raw);

  } catch (error) {

    return _fail(
      result,
      _createIssue({code: LOAD_FILE_ISSUE_CODE.INVALID_JSON, filePath, error, name})
    );
  }

  /*
  |------------------------------------------------------------------
  | OBJECT
  |------------------------------------------------------------------
  */

  if (
    typeof result.data !== 'object' ||
    result.data === null ||
    Array.isArray(result.data)
  ) {

    return _fail(
      result,
      _createIssue({code: LOAD_FILE_ISSUE_CODE.EMPTY_OBJECT, filePath, name})
    );
  }

  /*
  |------------------------------------------------------------------
  | EMPTY OBJECT
  |------------------------------------------------------------------
  */

  if (Object.keys(result.data).length === 0) {

    return _fail(
      result,
      _createIssue({code: LOAD_FILE_ISSUE_CODE.EMPTY_OBJECT, filePath, name})
    );
  }

  return result;
}


module.exports = {
  _readJson
};
