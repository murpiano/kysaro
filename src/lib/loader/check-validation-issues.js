const {hasErrors} = require("../../all/helpers/utils");

function _checkValidationIssues(state) {
  const groups = Object.values(state.groups || {});

  const allContainers = groups.flatMap(group => [
      ...Object.values(group.settings || {}),
      ...Object.values(group.schemas || {}),
      ...Object.values(group.validators || {}),
      ...Object.values(group.validations || {})
    ]);

  const hasCriticalIssues = allContainers.some(hasErrors);

  return {
    ok: !hasCriticalIssues,
    hasIssues: state.issues.length > 0,
    hasCriticalIssues
  };
}


module.exports = {
  _checkValidationIssues
};
