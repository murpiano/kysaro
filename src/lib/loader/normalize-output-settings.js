const {_stripRuntimeFields} = require('./strip-runtime-fields');


function _normalizeResources(resources = {}) {
  const normalized = {};

  Object.entries(resources).forEach(([key, value]) => {
    normalized[key] = _stripRuntimeFields(value);
  });

  return normalized;
}


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
