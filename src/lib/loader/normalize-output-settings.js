const {_stripRuntimeFields} = require('./strip-runtime-fields');


/**
 * Removes runtime-only fields from resources.
 *
 * @param {Object} [resources={}] Resource collection.
 * @returns {Object}
 */
function _normalizeResources(resources = {}) {
  const normalized = {};

  Object.entries(resources).forEach(([key, value]) => {
    normalized[key] = _stripRuntimeFields(value);
  });

  return normalized;
}


/**
 * Produces final settings output without runtime metadata.
 *
 * @param {Object} state Loader state.
 * @returns {Object}
 */
function _normalizeOutputSettings(state) {
  const settings = {};

  Object.entries(state.groups).forEach(([groupName, group]) => {
    settings[groupName] = {};

    Object.entries(group.settings).forEach(([name, entry]) => {
      settings[groupName][name] = {
        ..._stripRuntimeFields(entry.data),
        resources: _normalizeResources(entry.resources)
      };

    });

  });

  return settings;
}


module.exports = {
  _normalizeOutputSettings
};
