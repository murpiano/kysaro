const path     = require('path');
const readJson = require('./read-json');
const {
        MissingArgumentsError,
        DuplicatePathError,
        FatalLoadError,
        MissingPathError
      }        = require('./errors');


const loadFile = (userSettingsDir, file, defaultSettingsDir) => {
  const info     = [];
  const warnings = [];
  const errors   = [];


  if (!file) {
    errors.push(new MissingArgumentsError(['file'], true));
    return {ok: false, data: null, info, errors, warnings};
  }

  if (!userSettingsDir) {
    warnings.push(new MissingPathError(file));
  }


  const userPath = userSettingsDir
    ? path.resolve(userSettingsDir, file)
    : null;

  const defaultPath = defaultSettingsDir
    ? path.resolve(defaultSettingsDir, file)
    : null;

  const pathsAreEqual =
          userPath && defaultPath && userPath === defaultPath;

  if (pathsAreEqual) {
    warnings.push(new DuplicatePathError(userPath));
  }


  let userData = null;

  if (userPath) {
    userData = readJson(userPath, file, {isCritical: false, errors, warnings});
  }

  if (userData && Object.keys(userData).length !== 0) {
    info.push('User settings are used');
    return {ok: true, data: userData, info, errors, warnings};
  }


  if (!defaultPath) {
    errors.push(new MissingPathError(file, true));
    return {ok: false, data: null, info, errors, warnings};
  }


  if (pathsAreEqual) {
    errors.push(
      new FatalLoadError(
        file,
        'user settings are incorrect, paths to default settings and user settings are identical'
      )
    );
    return {ok: false, data: null, info, errors, warnings};
  }


  const fallbackData = readJson(defaultPath, file, {
    isCritical: true,
    errors,
    warnings
  });

  if (fallbackData) {
    info.push('Default settings are used');
    return {ok: true, data: fallbackData, info, errors, warnings};
  }

  errors.push(new FatalLoadError(file, ''));

  return {ok: false, data: null, info, errors, warnings};
}

module.exports = loadFile;
