const {_loadFileBase} = require("./load-file-base");
const path = require("path");
const {LOAD_FILE_LOAD_SOURCE} = require("../../all/const/load-file");
const {ISSUE_SEVERITY} = require("../../all/const/issue");
const {mapLoaderIssueBySource} = require("../issue");


function _collectFromFiles(config, found = []) {

  if (!config || typeof config !== 'object') {
    return found;
  }

  Object.entries(config).forEach(([key, value]) => {

    if (key === 'fromFiles' && Array.isArray(value)) {
      found.push(...value);
      return;
    }

    if (value && typeof value === 'object') {
      _collectFromFiles(value, found);
    }
  });

  return found;
}


function _resolveResources({config, meta}) {
  const resources = {};
  const issues = [];

  let ok = true;

  const configPath = meta?.resolvedPath;

  if (!configPath) {
    return {ok, resources, issues};
  }

  const configDir = path.dirname(configPath);

  const resourcePaths = _collectFromFiles(config);

  resourcePaths.forEach(resourcePath => {
    const absolutePath = path.resolve(configDir, resourcePath);

    const loaded = _loadFileBase({
      source: meta.source,
      filePath: absolutePath,
      severity: meta.source === LOAD_FILE_LOAD_SOURCE.USER ? ISSUE_SEVERITY.WARNING : ISSUE_SEVERITY.ERROR,
      mapIssue: mapLoaderIssueBySource
    });

    issues.push(...(loaded.issues || []));

    if (!loaded.ok) {
      ok = false;
      return;
    }

    const resourceName = path.basename(absolutePath, path.extname(absolutePath));

    resources[resourceName] = {
      ...(resources[resourceName] || {}), ...loaded.data
    };
  });

  return {
    ok, resources, issues
  };
}


module.exports = {
  _resolveResources
};
