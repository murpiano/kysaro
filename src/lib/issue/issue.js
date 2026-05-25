function _createIssue({
  code,
  message,
  severity,
  source,
  meta = {}
}) {

  return {
    code,
    message,
    severity,
    source,
    meta
  };
}


module.exports = {
  _createIssue
};
