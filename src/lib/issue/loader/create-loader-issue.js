const {_createIssue} = require('../issue');
const {ISSUE_SOURCE} = require('../../../all/const/issue');
const {LOADER_ISSUE_MESSAGE} = require('../../../all/const/loader');


function _createLoaderIssue({
  code,
  severity,
  meta = {},
  message = null
}) {

  return _createIssue({
    code,
    message: message || LOADER_ISSUE_MESSAGE[code] || code,
    severity,
    source: ISSUE_SOURCE.LOADER,
    meta
  });
}


module.exports = {
  _createLoaderIssue
};
