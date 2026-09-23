const fs = require('fs');
const path = require('path');

const defaultSettings = require('./settings');

const DIRECTORY = {
  USER: '.kysaro',
  USER_SETTINGS: ['.kysaro', 'settings'],
  COMMITS: 'commits',
  SCHEMAS: 'schemas'
};

const settingsGroups =
  Object.fromEntries(
    Object.entries(defaultSettings.filesGroups)
  );

const existingDir = dir => (fs.existsSync(dir) ? dir : null);

/**
 * Creates loader configuration for a project directory.
 *
 * User settings are read only when `.kysaro/settings` exists, and reports
 * are written only when `.kysaro` exists. Without them the package
 * defaults are used silently.
 *
 * @param {string} [cwd=process.cwd()] Project root.
 * @returns {{
 *   DIRECTORY:Object,
 *   settingsDir:{user:string|null, default:string},
 *   settingsGroups:Object,
 *   reportDir:string|null
 * }}
 */
function createConfiguration(cwd = process.cwd()) {
  return {
    DIRECTORY,
    settingsDir: {
      user: existingDir(path.resolve(cwd, ...DIRECTORY.USER_SETTINGS)),
      default: defaultSettings.dir
    },
    settingsGroups,
    reportDir: existingDir(path.resolve(cwd, DIRECTORY.USER))
  };
}

module.exports = {
  DIRECTORY,
  settingsGroups,
  createConfiguration
};
