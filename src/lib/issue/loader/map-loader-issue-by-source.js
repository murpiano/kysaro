const {_createLoadFileIssue} = require('../load-file/create-load-file-issue');
const {LOAD_FILE_ISSUE_CODE} = require('../../../all/const/load-file');


function _mapLoaderIssueBySource({
  issue,
  source,
  severity,
  entity
}) {

  const prefixedCode =
    source
      ? `${source.toUpperCase()}_${issue.code}`
      : null;

  const resolvedCode =
    prefixedCode &&
    LOAD_FILE_ISSUE_CODE[prefixedCode]
      ? prefixedCode
      : issue.code;

  return _createLoadFileIssue({
    code: resolvedCode,
    severity,

    meta: {
      ...issue.meta,

      source,
      entity
    }
  });
}


module.exports = {
  _mapLoaderIssueBySource
};
