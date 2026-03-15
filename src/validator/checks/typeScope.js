module.exports = (parsed, context) => {
  const { emojiMap, authorizedScopes } = context;
  const { type, scope, emoji } = parsed;

  const validTypes = [...Object.keys(emojiMap), 'merge'];
  if (!type || !validTypes.includes(type)) return [false, `Invalid type: ${type}`];

  if (!scope) return [false, 'Scope is mandatory'];
  if (!authorizedScopes.includes(scope)) {
    return [false, `Scope (${scope}) is not authorized. Check scopes.json` ];
  }

  if (type !== 'merge' && emojiMap[type] !== emoji) {
    return [false, `Type "${type}" must use emoji ${emojiMap[type]}`];
  }

  return [true];
};
