const {_createIssue} = require('../issue');
const {ISSUE_SOURCE} = require('../../../all/const/issue');
const {LOAD_FILE_ISSUE_MESSAGE} = require('../../../all/const/load-file');


function _resolveMessage(code) {
  const normalizedCode = code
  .replace(/^USER_/, '')
  .replace(/^DEFAULT_/, '');

  let message = LOAD_FILE_ISSUE_MESSAGE[normalizedCode];

  if (!message) {
    return code;
  }

  if (code.startsWith('USER_')) {
    return message.replace('{source}', 'User');
  }

  if (code.startsWith('DEFAULT_')) {
    return message.replace('{source}', 'Default');
  }

  return message;
}


function _createLoadFileIssue({code, severity, meta = {}}) {

  return _createIssue({
    code,
    message: _resolveMessage(code),
    severity,
    source: ISSUE_SOURCE.LOADER,
    meta
  });
}


module.exports = {
  _createLoadFileIssue
};
