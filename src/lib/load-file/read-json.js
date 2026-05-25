const fs = require('fs');
const path = require('path');

const {LOAD_FILE_ISSUE_CODE} = require('../../all/const/load-file');


function _createResult(filePath) {

  return {
    ok: true,
    data: null,
    issues: [],
    meta: {
      name: filePath ? path.basename(filePath) : null,
      requestedPath: filePath || null,
      resolvedPath: filePath || null
    }
  };
}


function _createIssue({code, filePath, error = null}) {

  return {
    code,
    meta: {
      name: filePath ? path.basename(filePath) : null,
      requestedPath: filePath || null,
      resolvedPath: filePath || null,
      error
    }
  };
}


function _fail(result, issue) {
  result.ok = false;
  result.issues.push(issue);
  return result;
}


function _readJson(filePath) {
  const result = _createResult(filePath);

  /*
  |------------------------------------------------------------------
  | MISSING PATH
  |------------------------------------------------------------------
  */

  if (!filePath) {
    return _fail(
      result,
      _createIssue({code: LOAD_FILE_ISSUE_CODE.PATH_MISSING, filePath})
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
      _createIssue({code: LOAD_FILE_ISSUE_CODE.FILE_NOT_FOUND, filePath})
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
      _createIssue({code: LOAD_FILE_ISSUE_CODE.FATAL_LOAD, filePath, error})
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
      _createIssue({code: LOAD_FILE_ISSUE_CODE.EMPTY_FILE, filePath})
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
      _createIssue({code: LOAD_FILE_ISSUE_CODE.INVALID_JSON, filePath, error})
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
      _createIssue({code: LOAD_FILE_ISSUE_CODE.EMPTY_OBJECT, filePath})
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
      _createIssue({code: LOAD_FILE_ISSUE_CODE.EMPTY_OBJECT, filePath})
    );
  }

  return result;
}


module.exports = {
  _readJson
};
