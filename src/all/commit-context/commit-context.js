const {resolveSourceValues} = require('./resolve-source-values');

/**
 * Creates context shared by pipeline stages.
 *
 * @param {{main:Object, commitSettings:Object}} settings Loaded settings.
 * @param {string} commitType Message kind from `COMMIT_TYPE`.
 * @returns {{
 *   settings:Object,
 *   commitType:string,
 *   sources:{types:string[]|null, scopes:string[]|null, tokens:string[]|null}
 * }}
 */
function createCommitContext(settings, commitType) {
  const commitSettings = settings?.commitSettings || {};
  const resources = commitSettings.resources || {};

  return {
    settings,
    commitType,
    sources: {
      types: resolveSourceValues(commitSettings.header?.type?.value, resources),
      scopes: resolveSourceValues(commitSettings.header?.scope?.source, resources),
      tokens: resolveSourceValues(commitSettings.footer?.token?.source, resources)
    }
  };
}

module.exports = {
  createCommitContext
};
