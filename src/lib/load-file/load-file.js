const {_loadFileBase} = require('./load-file-base');
const {_validateLoadedWithResources} = require("./validate-loaded-with-resources");
const {joinIfExists} = require('../../all/helpers/path');
const path = require('path');
const {ISSUE_SEVERITY} = require('../../all/const/issue');
const {LOADER_ENTITY} = require("../../all/const/loader");
const {LOAD_FILE_LOAD_SOURCE, LOAD_FILE_LOAD_STRATEGY, LOAD_FILE_ISSUE_CODE} = require("../../all/const/load-file");
const {createLoaderIssue} = require('../issue');


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


function _resolveFilePath(basePath, name) {

  if (!basePath || !name) {
    return null;
  }

  return joinIfExists(basePath, name);
}


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


function _loadAndValidate({source, filePath, severity, entity}) {
  const loaded = _loadFileBase({source, filePath, severity, entity});

  if (!loaded.ok) {
    return loaded;
  }

  if (entity !== LOADER_ENTITY.SETTINGS) {
    return loaded;
  }

  return _validateLoadedWithResources(loaded);
}


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
      createLoaderIssue({
        code: LOAD_FILE_ISSUE_CODE.MISSING_ARGUMENTS,
        severity: ISSUE_SEVERITY.ERROR,
        meta: {
          name,
          args: ['name'],
          entity
        }
      })
    );

    return result;
  }


  /*
  |------------------------------------------------------------------
  | BAD STRATEGY
  |------------------------------------------------------------------
  */

  const validStrategies = Object.values(LOAD_FILE_LOAD_STRATEGY);

  if (!validStrategies.includes(strategy)) {

    result.issues.push(createLoaderIssue({
        code: LOAD_FILE_ISSUE_CODE.INVALID_STRATEGY,
        severity: ISSUE_SEVERITY.ERROR,
        meta: {
          name,
          strategy,
          available:
          validStrategies,
          entity
        }
      })
    );

    return result;
  }

  const defaultFilePath = _resolveFilePath(defaultPath, name);
  const userFilePath = _resolveFilePath(userPath, name);

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
      entity
    });

    _applyLoaded(result, loaded, defaultFilePath);

    if (!loaded.ok) {
      result.issues.push(createLoaderIssue({
          code: LOAD_FILE_ISSUE_CODE.DEFAULT_FATAL_LOAD,
          severity: ISSUE_SEVERITY.ERROR,
          meta: {
            name,
            strategy,
            path:
            defaultFilePath,
            source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
            entity
          }
        })
      );
    }

    return result;
  }

  /*
  |------------------------------------------------------------------
  | USER ONLY
  |------------------------------------------------------------------
  */

  if (strategy === LOAD_FILE_LOAD_STRATEGY.USER_ONLY) {
    const loaded = _loadAndValidate({
      source: LOAD_FILE_LOAD_STRATEGY.USER,
      filePath: userFilePath,
      severity: ISSUE_SEVERITY.ERROR,
      entity
    });

    _applyLoaded(result, loaded, userFilePath);

    if (!loaded.ok) {
      result.issues.push(createLoaderIssue({
          code: LOAD_FILE_ISSUE_CODE.USER_FATAL_LOAD,
          severity: ISSUE_SEVERITY.ERROR,
          meta: {
            name,
            strategy,
            path: userFilePath,
            source: LOAD_FILE_LOAD_SOURCE.USER,
            entity
          }
        })
      );
    }

    return result;
  }

  /*
  |------------------------------------------------------------------
  | USER FIRST
  |------------------------------------------------------------------
  */

  const pathsAreEqual = userFilePath && defaultFilePath &&
    path.normalize(userFilePath) === path.normalize(defaultFilePath);

  if (pathsAreEqual) {
    result.issues.push(createLoaderIssue({
        code: LOAD_FILE_ISSUE_CODE.DUPLICATE_PATHS,
        severity: ISSUE_SEVERITY.WARNING,
        meta: {
          name,
          userPath:
          userFilePath,
          defaultPath: defaultFilePath,
          entity
        }
      })
    );
  }

  /*
  |------------------------------------------------------------------
  | USER
  |------------------------------------------------------------------
  */

  if (userFilePath) {
    const userLoaded = _loadAndValidate({
      source: LOAD_FILE_LOAD_SOURCE.USER,
      filePath: userFilePath,
      severity: ISSUE_SEVERITY.WARNING,
      entity
    });

    if (userLoaded.ok) {
      return _applyLoaded(result, userLoaded, userFilePath);
    }

    result.issues.push(...(userLoaded.issues || []));
  }

  /*
  |------------------------------------------------------------------
  | DEFAULT
  |------------------------------------------------------------------
  */

  const defaultLoaded = _loadAndValidate({
    source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
    filePath: defaultFilePath,
    severity: ISSUE_SEVERITY.ERROR,
    entity
  });

  _applyLoaded(result, defaultLoaded, defaultFilePath);

  if (!defaultLoaded.ok) {
    result.issues.push(createLoaderIssue({
        code: LOAD_FILE_ISSUE_CODE.DEFAULT_FATAL_LOAD,
        severity: ISSUE_SEVERITY.ERROR,
        meta: {
          name,
          strategy,
          path:
          defaultFilePath,
          source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
          entity
        }
      })
    );
  }

  return result;
}


module.exports = {
  _loadFile
};
