const {resolveSourceValues} = require('./resolve-source-values');


function createCommitContext(settings) {
  const commitSettings = settings.commitSettings;

  const resources = commitSettings.resources || {};

  return {
    settings,
    validTypes: resolveSourceValues(
      commitSettings?.header?.type?.value, resources?.types
    ),

    validScopes: resolveSourceValues(
      commitSettings?.header?.scope?.value, resources?.scopes
    ),

    validTokens: resolveSourceValues(
      commitSettings?.footer?.token?.value, resources?.tokens
    )
  };
}


module.exports = {
  createCommitContext
};
