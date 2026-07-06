const {ISSUE_SEVERITY} = require("../../../all/const/issue");
const {LOAD_FILE_ISSUE_CODE} = require("../../../all/const/load-file");
const {_createLoadFileIssue} = require("../load-file/create-load-file-issue");

function _createDependencyLoadIssue({
  name,
  entity,
  target,
  requestedPath,
  resolvedPath,
  dependencyType,
  internalPath,
  severity = ISSUE_SEVERITY.ERROR
}) {

  return _createLoadFileIssue({
    code: LOAD_FILE_ISSUE_CODE.DEPENDENCY_LOAD_FAILED,
    severity,
    meta: {
      name,
      entity,
      target,
      requestedPath,
      resolvedPath,
      dependencyType,
      internalPath
    }
  });
}


module.exports = {
  _createDependencyLoadIssue
}
