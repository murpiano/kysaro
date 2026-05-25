function getIssuesBySeverity(settings, severity) {
  return (settings?.issues || []).filter(
    issue => issue.severity === severity
  )
}

function getErrors(settings) {
  return getIssuesBySeverity(settings, 'error');
}

function getWarnings(settings) {
  return getIssuesBySeverity(settings, 'warning');
}

function hasErrors(settings) {
  return getErrors(settings).length > 0;
}

function hasWarnings(settings) {
  return getWarnings(settings).length > 0;
}

function hasIssues(settings) {
  return (settings?.issues || []).length > 0;
}

function isEmptyObj(obj) {
  return Object.keys(obj).length < 1;
}


module.exports = {
  getIssuesBySeverity,
  getErrors,
  getWarnings,
  hasErrors,
  hasWarnings,
  hasIssues,
  isEmptyObj
}
