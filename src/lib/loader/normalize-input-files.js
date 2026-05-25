const {joinIfExists} = require("../../all/helpers/path");

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
