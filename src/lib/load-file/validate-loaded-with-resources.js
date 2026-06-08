const resolveResourcesModule = require('./resolve-resources');

/**
 * Validates loaded configuration together with all referenced resources.
 *
 * Appends dependency issues, resolves resources and recalculates final
 * status based on fatal dependency errors.
 *
 * @param {Object} loaded
 * @param {string} strategy
 * @param {string} entity
 * @returns {Object}
 */
function _validateLoadedWithResources(
  loaded,
  strategy,
  entity
) {
  const result = {...loaded};

  const resolved = resolveResourcesModule._resolveResources({
    config: loaded.data,
    meta: loaded.meta,
    strategy,
    entity
  });

  result.resources = resolved.resources;

  result.issues.push(
    ...(resolved.issues || [])
  );

  const hasFatalDependencyErrors =
    resolved.issues.some(
      issue => issue.severity === 'error'
    );

  result.ok = !hasFatalDependencyErrors;

  return result;
}


module.exports = {
  _validateLoadedWithResources
};
