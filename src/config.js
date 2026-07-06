const path = require('path');

const defaultSettings = require('./settings');

const DIRECTORY = {
  USER: '.bvtrots-dx',
  USER_SETTINGS: ['.bvtrots-dx', 'settings'],
  COMMITS: 'commits',
  SCHEMAS: 'schemas'
};

const settingsDir = {
  user: path.resolve(process.cwd(), ...DIRECTORY.USER_SETTINGS),
  default: defaultSettings.dir};

const settingsGroups =
  Object.fromEntries(
    Object.entries(defaultSettings.filesGroups)
  );

const reportDir = path.resolve(process.cwd(), DIRECTORY.USER);

module.exports = {
  DIRECTORY,
  settingsDir,
  settingsGroups,
  reportDir
};
