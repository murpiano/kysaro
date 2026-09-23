const {runLoader} = require('../loader');

/**
 * Loads settings for the pipeline.
 *
 * Only `commit.json` rules are applied for now: `merge.json` and
 * `request.json` still use the legacy format (see docs/SPEC.md, 3.5).
 * Merge commits are skipped through `ignore.kinds`.
 *
 * @param {Object} configuration Loader configuration.
 * @param {Object} [loaderOptions={}] Loader options.
 * @returns {{settings:{main:Object, commitSettings:Object}|null, issues:Object[]}}
 */
function getSettings(configuration, loaderOptions = {}) {
  const loaded = runLoader(configuration, loaderOptions);

  if (!loaded.ok) {
    return {
      settings: null,
      issues: loaded.reports?.issues || []
    };
  }

  return {
    settings: {
      main: loaded.settings?.main?.main || {},
      commitSettings: loaded.settings?.commits?.commit || {}
    },
    issues: loaded.reports?.issues || []
  };
}

module.exports = {
  getSettings
};
