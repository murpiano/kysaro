const {COMMIT_TYPE} = require('../../all/const/const');
const {runLoader} = require('../loader');

/**
 * Settings file for each message kind.
 */
const SETTINGS_BY_KIND = {
  [COMMIT_TYPE.COMMIT]: 'commit',
  [COMMIT_TYPE.MERGE]: 'merge',
  [COMMIT_TYPE.REQUEST]: 'request'
};

/**
 * Loads settings for the pipeline.
 *
 * @param {Object} configuration Loader configuration.
 * @param {string} commitType Message kind from `COMMIT_TYPE`.
 * @param {Object} [loaderOptions={}] Loader options.
 * @returns {{
 *   settings:{main:Object, commitSettings:Object, rules:string}|null,
 *   issues:Object[]
 * }} `rules` is the name of the applied settings file.
 */
function getSettings(configuration, commitType, loaderOptions = {}) {
  const loaded = runLoader(configuration, loaderOptions);
  const issues = loaded.reports?.issues || [];

  if (!loaded.ok) {
    return {settings: null, issues};
  }

  const rules = SETTINGS_BY_KIND[commitType] || SETTINGS_BY_KIND[COMMIT_TYPE.COMMIT];

  return {
    settings: {
      main: loaded.settings?.main?.main || {},
      commitSettings: loaded.settings?.commits?.[rules] || {},
      rules
    },
    issues
  };
}

module.exports = {
  getSettings,
  SETTINGS_BY_KIND
};
