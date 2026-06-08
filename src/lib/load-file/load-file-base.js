const issueModule = require('../issue');
const readJsonModule = require('./read-json');


/**
 * Loads JSON file and maps all issues to loader-specific format.
 *
 * @param {Object} params
 * @param {string} params.source
 * @param {string|null} params.filePath
 * @param {string} params.severity
 * @param {string} params.entity
 * @param {string} params.name
 * @returns {Object}
 */
function _loadFileBase({
  source,
  filePath,
  severity,
  entity,
  name
}) {
  const loaded = readJsonModule._readJson(
    filePath,
    name
  );

  loaded.issues = loaded.issues.map(issueItem =>
    issueModule.mapLoaderIssueBySource({
      issue: issueItem,
      source,
      severity,
      entity
    })
  );

  return {
    ...loaded,
    source,
    meta: {
      ...(loaded.meta || {}),
      source
    }
  };
}


module.exports = {
  _loadFileBase
};
