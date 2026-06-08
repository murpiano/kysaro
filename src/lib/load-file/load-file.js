const path = require('path');
const {ISSUE_SEVERITY} = require('../../all/const/issue');
const {LOADER_ENTITY} = require('../../all/const/loader');
const {
  LOAD_FILE_LOAD_SOURCE,
  LOAD_FILE_LOAD_STRATEGY,
  LOAD_FILE_ISSUE_CODE,
  LOAD_FILE_INFO_MESSAGE,
  LOAD_FILE_RECOMMENDATION_MESSAGE } = require('../../all/const/load-file');
const {createLoadFileIssue} = require("../issue");
const {joinIfExists} = require('../../all/helpers/path');
const loadFileBaseModule = require('./load-file-base');
const validateLoadedWithResourcesModule = require('./validate-loaded-with-resources');



/**
 * Creates initial load result structure.
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.strategy
 * @returns {Object}
 */
function _createResult({name, strategy}) {

  return {
    ok: false,
    data: null,
    resources: {},
    issues: [],
    meta: {
      name,
      strategy,
      requestedPath: null,
      resolvedPath: null,
      basedir: null,
      source: null
    }
  };
}


/**
 * Resolves file path from base directory and file name.
 *
 * @param {string|null} basePath
 * @param {string|null} name
 * @returns {string|null}
 */
function _resolveFilePath(basePath, name) {

  if (!basePath || !name) {
    return null;
  }

  return joinIfExists(basePath, name);
}


/**
 * Copies loaded result into final result object and updates metadata.
 *
 * @param {Object} result
 * @param {Object} loaded
 * @param {string|null} requestedPath
 * @returns {Object}
 */
function _applyLoaded(result, loaded, requestedPath) {
  result.ok = loaded.ok;
  result.data = loaded.data;
  result.resources = loaded.resources || {};
  result.issues.push(...(loaded.issues || []));
  result.meta.source = loaded.source;
  result.meta.requestedPath = requestedPath;
  result.meta.resolvedPath = loaded.meta?.resolvedPath || null;

  const actualPath = loaded.meta?.resolvedPath;

  if (actualPath) {
    result.meta.basedir = path.dirname(actualPath);
  }

  return result;
}


/**
 * Loads file and validates referenced resources when required.
 *
 * Resource validation is performed only for SETTINGS entities.
 *
 * @param {Object} params
 * @param {string} params.source
 * @param {string|null} params.filePath
 * @param {string} params.severity
 * @param {string} params.entity
 * @param {string} params.strategy
 * @param {string} params.name
 * @returns {Object}
 */
function _loadAndValidate({
  source,
  filePath,
  severity,
  entity,
  strategy,
  name
}) {

  const loaded = loadFileBaseModule._loadFileBase({
    source,
    filePath,
    severity,
    entity,
    name
  });

  if (!loaded.ok) {
    return loaded;
  }

  if (entity !== LOADER_ENTITY.SETTINGS) {
    return loaded;
  }

  return validateLoadedWithResourcesModule._validateLoadedWithResources(loaded, strategy, entity);
}


/**
 * Loads configuration file according to selected strategy.
 *
 * Supports:
 * - DEFAULT_ONLY
 * - USER_ONLY
 * - USER_FIRST
 *
 * Performs resource validation for SETTINGS entities.
 *
 * @param {Object} options
 * @param {string} options.name
 * @param {string|null} options.defaultPath
 * @param {string|null} [options.userPath=null]
 * @param {string} [options.entity]
 * @param {string} [strategy]
 * @returns {Object}
 */
function _loadFile(
  {
    name,
    defaultPath,
    userPath = null,
    entity = LOADER_ENTITY.SETTINGS
  },
  strategy = LOAD_FILE_LOAD_STRATEGY.USER_FIRST
) {

  const result = _createResult({name, strategy});

  /*
  |------------------------------------------------------------------
  | MISSING ARGUMENTS
  |------------------------------------------------------------------
  */

  if (!name) {

    result.issues.push(
      createLoadFileIssue({
        code: LOAD_FILE_ISSUE_CODE.MISSING_ARGUMENTS,
        severity: ISSUE_SEVERITY.ERROR,
        meta: {
          name,
          info: LOAD_FILE_INFO_MESSAGE.MISSING_ARGUMENTS,
          args: ['name'],
          recommendation: LOAD_FILE_RECOMMENDATION_MESSAGE.MISSING_ARGUMENTS,
          entity
        }
      })
    );

    return result;
  }

  /*
  |------------------------------------------------------------------
  | INVALID STRATEGY
  |------------------------------------------------------------------
  */

  const validStrategies = Object.values(LOAD_FILE_LOAD_STRATEGY);

  if (!validStrategies.includes(strategy)) {

    result.issues.push(
      createLoadFileIssue({
        code: LOAD_FILE_ISSUE_CODE.INVALID_STRATEGY,
        severity: ISSUE_SEVERITY.ERROR,
        meta: {
          name,
          target: strategy,
          strategy,
          info: LOAD_FILE_INFO_MESSAGE.INVALID_STRATEGY,
          args: validStrategies,
          recommendation: LOAD_FILE_RECOMMENDATION_MESSAGE.INVALID_STRATEGY,
          entity
        }
      })
    );

    return result;
  }

  const defaultFilePath = _resolveFilePath(defaultPath, name);
  const userFilePath = _resolveFilePath(userPath, name);

  if (
    strategy === LOAD_FILE_LOAD_STRATEGY.USER_FIRST &&
    userPath !== null &&
    !userFilePath
  ) {

    result.issues.push(
      createLoadFileIssue({
        code: LOAD_FILE_ISSUE_CODE.USER_PATH_MISSING,
        severity: ISSUE_SEVERITY.ERROR,
        meta: {
          name,
          source: LOAD_FILE_LOAD_SOURCE.USER,
          entity
        }
      })
    );
  }

  /*
  |------------------------------------------------------------------
  | DEFAULT ONLY
  |------------------------------------------------------------------
  */

  if (strategy === LOAD_FILE_LOAD_STRATEGY.DEFAULT_ONLY) {

    const loaded = _loadAndValidate({
      source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
      filePath: defaultFilePath,
      severity: ISSUE_SEVERITY.ERROR,
      entity,
      strategy,
      name
    });

    return _applyLoaded(result, loaded, defaultFilePath);
  }

  /*
  |------------------------------------------------------------------
  | USER ONLY
  |------------------------------------------------------------------
  */

  if (strategy === LOAD_FILE_LOAD_STRATEGY.USER_ONLY) {

    const loaded = _loadAndValidate({
      source: LOAD_FILE_LOAD_SOURCE.USER,
      filePath: userFilePath,
      severity: ISSUE_SEVERITY.ERROR,
      entity,
      strategy,
      name
    });

    return _applyLoaded(result, loaded, userFilePath);
  }

  /*
  |------------------------------------------------------------------
  | USER FIRST
  |------------------------------------------------------------------
  */

  const pathsAreEqual =
    userFilePath &&
    defaultFilePath &&
    path.normalize(userFilePath) === path.normalize(defaultFilePath);

  /*
  |------------------------------------------------------------------
  | USER LOAD
  |------------------------------------------------------------------
  */

  if (userFilePath) {

    const userLoaded = _loadAndValidate({
      source: LOAD_FILE_LOAD_SOURCE.USER,
      filePath: userFilePath,
      severity: ISSUE_SEVERITY.WARNING,
      entity,
      strategy,
      name
    });

    if (userLoaded.ok) {
      return _applyLoaded(result, userLoaded, userFilePath);
    }

    result.issues.push(...(userLoaded.issues || []));
  }

  /*
  |------------------------------------------------------------------
  | DUPLICATE PATHS
  |------------------------------------------------------------------
  */

  if (pathsAreEqual) {

    result.issues.push(
      createLoadFileIssue({
        code: LOAD_FILE_ISSUE_CODE.DUPLICATE_PATHS,
        severity: ISSUE_SEVERITY.ERROR,
        meta: {
          name,
          source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
          entity,
          requestedPath: defaultFilePath,
          resolvedPath: defaultFilePath
        }
      })
    );

    result.ok = false;

    return result;
  }

  /*
  |------------------------------------------------------------------
  | DEFAULT LOAD
  |------------------------------------------------------------------
  */

  const defaultLoaded = _loadAndValidate({
    source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
    filePath: defaultFilePath,
    severity: ISSUE_SEVERITY.ERROR,
    entity,
    strategy,
    name
  });

  return _applyLoaded(result, defaultLoaded, defaultFilePath);
}


module.exports = {
  _loadFile
};
