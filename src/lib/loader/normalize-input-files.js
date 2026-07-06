const {joinIfExists} = require("../../all/helpers/path");


/**
 * Creates normalized file descriptors for a group.
 *
 * @param {string} group Group name.
 * @param {string[]} names Entity names.
 * @param {Object} configuration Configuration object.
 * @param {Object} options Normalized options.
 * @returns {Array<Object>}
 */
function _createGroupFiles(group, names, configuration, options) {
  const {settingsDir} = configuration;

  const {files: filesOptions, schemas: schemasOptions} = options;

  return names.map(name => ({
    group,
    name,

    file: {
      name: `${name}.json`,
      defaultPath: joinIfExists(settingsDir.default, group, filesOptions.specialDir.default),
      userPath: joinIfExists(settingsDir.user, group, filesOptions.specialDir.user)
    },

    schema: {
      name: `${name}.schema.json`,
      defaultPath: joinIfExists(settingsDir.default, schemasOptions.specialDir.default)
    }
  }));
}


/**
 * Converts configuration groups into normalized file descriptors.
 *
 * @param {Object} configuration Configuration object.
 * @param {Object} normalizedOptions Normalized options.
 * @returns {Array<Object>}
 */
function _normalizeFiles(configuration, normalizedOptions) {
  const {settingsGroups} = configuration;
  const result = [];

  Object.entries(settingsGroups).forEach(([group, names]) => {

    result.push(
      ..._createGroupFiles(group, names, configuration, normalizedOptions)
    );
  });

  return result;
}


module.exports = {
  _normalizeFiles
};
