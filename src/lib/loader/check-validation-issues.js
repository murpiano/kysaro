const {ISSUE_SEVERITY} = require("../../all/const/issue");


/**
 * Checks validation issues across all groups and determines
 * whether critical unresolved errors exist.
 *
 * @param {Object} state Loader state.
 * @returns {{
 *   ok:boolean,
 *   details:Object<string,{
 *     ok:boolean,
 *     hasIssues:boolean,
 *     hasCriticalIssues:boolean,
 *     reportPath?:string
 *   }>
 * }}
 */
function _checkValidationIssues(state) {
  const groups = Object.entries(state.groups || {});

  const result = {
    ok: true,
    details: {}
  };

  groups.forEach(([groupName, groupValue]) => {
    const blockResult = {
      ok: true,
      hasIssues: false,
      hasCriticalIssues: false,
      reportPath: groupValue.reportPath
    }

    const allContainers = groups.flatMap(group => [
      ...Object.values(groupValue.settings || {}),
      ...Object.values(groupValue.schemas || {}),
      ...Object.values(groupValue.validators || {}),
      ...Object.values(groupValue.validations || {})
    ]);

    allContainers.forEach(settings => {
      settings.issues.forEach(issue => {
        if (issue.severity) {
          blockResult.hasIssues = true;

          if (issue.severity === ISSUE_SEVERITY.ERROR && !issue.meta.owner) {
            blockResult.hasCriticalIssues = true;
            result.ok = false;
          }
        }
      })

      result.details[groupName] = blockResult;

    })
  })


  return result;
}


module.exports = {
  _checkValidationIssues
};
