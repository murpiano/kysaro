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
 * Loads settings once for all message kinds.
 *
 * @param {Object} configuration Loader configuration.
 * @param {Object} [loaderOptions={}] Loader options.
 * @returns {{ok:boolean, loaded:Object, issues:Object[]}}
 */
function loadSettings(configuration, loaderOptions = {}) {
  const loaded = runLoader(configuration, loaderOptions);

  return {
    ok: loaded.ok,
    loaded,
    issues: loaded.reports?.issues || []
  };
}

/**
 * Picks settings of a message kind from loaded settings.
 *
 * @param {{ok:boolean, loaded:Object, issues:Object[]}} state Result of `loadSettings`.
 * @param {string} commitType Message kind from `COMMIT_TYPE`.
 * @returns {{
 *   settings:{main:Object, commitSettings:Object, rules:string}|null,
 *   issues:Object[]
 * }} `rules` is the name of the applied settings file.
 */
function selectSettings(state, commitType) {
  if (!state.ok) {
    return {settings: null, issues: state.issues};
  }

  const rules = SETTINGS_BY_KIND[commitType] || SETTINGS_BY_KIND[COMMIT_TYPE.COMMIT];

  return {
    settings: {
      main: state.loaded.settings?.main?.main || {},
      commitSettings: state.loaded.settings?.commits?.[rules] || {},
      rules
    },
    issues: state.issues
  };
}

/**
 * Loads settings of one message kind.
 *
 * @param {Object} configuration Loader configuration.
 * @param {string} commitType Message kind from `COMMIT_TYPE`.
 * @param {Object} [loaderOptions={}] Loader options.
 */
function getSettings(configuration, commitType, loaderOptions = {}) {
  return selectSettings(loadSettings(configuration, loaderOptions), commitType);
}

module.exports = {
  getSettings,
  loadSettings,
  selectSettings,
  SETTINGS_BY_KIND
};
