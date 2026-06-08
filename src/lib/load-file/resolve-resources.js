const path = require('path');
const {ISSUE_SEVERITY} = require('../../all/const/issue');
const {LOADER_DEPENDENCY_TYPE, LOADER_ISSUE_CODE} = require('../../all/const/loader');
const {LOAD_FILE_LOAD_SOURCE, LOAD_FILE_LOAD_STRATEGY} = require('../../all/const/load-file');
const {createLoaderIssue} = require('../issue');
const {_loadFileBase} = require('./load-file-base');


/**
 * Recursively collects all fromFiles references.
 *
 * @param {Object} config
 * @param {Array<string|number>} [currentPath=[]]
 * @param {Array<Object>} [found=[]]
 * @returns {Array<Object>}
 */
function _collectFromFiles(
  config,
  currentPath = [],
  found = []
) {

  if (!config || typeof config !== 'object') {
    return found;
  }

  Object.entries(config).forEach(([key, value]) => {

    if ( key === 'fromFiles' && Array.isArray(value)) {

      value.forEach((item, index) => {
        found.push({
          path: item,
          internalPath: [...currentPath, key, index]
        });
      });

      return;
    }

    if (value && typeof value === 'object') {
      _collectFromFiles(value, [...currentPath, key], found);
    }

  });

  return found;
}


/**
 * Creates dependency-related loader issue.
 *
 * @param {Object} params
 * @param {string} params.owner
 * @param {string} params.entity
 * @param {string} params.dependencyPath
 * @param {string} params.resolvedPath
 * @param {string} params.dependencyType
 * @param {Array<string|number>} params.internalPath
 * @param {string} params.source
 * @param {string} params.severity
 * @param {Error|null} [params.error=null]
 * @returns {Object}
 */
function _createDependencyIssue({
  owner,
  entity,
  dependencyPath,
  resolvedPath,
  dependencyType,
  internalPath,
  source,
  severity,
  error = null
}) {

  return createLoaderIssue({
    code:resolvedPath ? LOADER_ISSUE_CODE.DEPENDENCY_LOAD_FAILED : LOADER_ISSUE_CODE.DEPENDENCY_NOT_AVAILABLE,
    severity,
    meta: {
      name: owner,
      entity,
      source,
      target: path.basename(dependencyPath),
      dependencyType,
      requestedPath: dependencyPath,
      resolvedPath,
      internalPath,
      error
    }
  });

}


/**
 * Loads and merges all resources referenced through fromFiles.
 *
 * Resources are resolved relative to the parent configuration file.
 *
 * @param {Object} params
 * @param {Object} params.config
 * @param {Object} params.meta
 * @param {string} params.strategy
 * @param {string} params.entity
 * @returns {{
 *   ok: boolean,
 *   resources: Object,
 *   issues: Array
 * }}
 */
function _resolveResources({
  config,
  meta,
  strategy,
  entity,
  loadFileBase = _loadFileBase
}) {

  const resources = {};
  const issues = [];

  let ok = true;
  const configPath = meta?.resolvedPath;

  if (!configPath) {
    return {
      ok,
      resources,
      issues
    };
  }

  const configDir = path.dirname(configPath);

  const resourcesToLoad = _collectFromFiles(config);

  resourcesToLoad.forEach(resource => {

    const absolutePath = path.resolve(configDir, resource.path);

    const isUser = meta.source === LOAD_FILE_LOAD_SOURCE.USER;

    const dependencySeverity =
      strategy === LOAD_FILE_LOAD_STRATEGY.USER_FIRST
        ? (isUser ? ISSUE_SEVERITY.WARNING : ISSUE_SEVERITY.ERROR)
        : ISSUE_SEVERITY.ERROR;

    const loaded = loadFileBase({
      source: meta.source,
      filePath: absolutePath,
      severity: ISSUE_SEVERITY.ERROR,
      entity,
      name: path.basename(absolutePath)
    });

    loaded.issues.forEach(issue => {
      issue.meta.owner = meta.name;
      issues.push(issue);
    });

    if (!loaded.ok) {
      ok = false;

      const firstIssue = loaded.issues[0];

      issues.push(
        _createDependencyIssue({
          owner: meta.name,
          entity,
          dependencyPath: resource.path,
          resolvedPath: meta.resolvedPath,
          dependencyType: LOADER_DEPENDENCY_TYPE.RESOURCE,
          internalPath: resource.internalPath,
          source: meta.source,
          severity: dependencySeverity,
          error: firstIssue?.meta?.error || null
        })
      );

      return;
    }

    const resourceName =
      path.basename(
        absolutePath,
        path.extname(absolutePath)
      );

    resources[resourceName] = {
      ...(resources[resourceName] || {}),
      ...loaded.data
    };

  });

  return {
    ok,
    resources,
    issues
  };

}


module.exports = {
  _resolveResources
};
