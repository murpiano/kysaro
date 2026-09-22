const {WHEN_MODE} = require('../const');

const includesIgnoreCase = (list, value) =>
  typeof value === 'string' &&
  list.some(item => item.toLowerCase() === value.toLowerCase());

/**
 * Resolves `required` setting: `true`, `false` or `{when: {...}}`.
 *
 * `when` fields: `type`, `notType`, `tokens`, `mode` (`and` by default).
 * A type listed in `notType` never matches, whatever the mode.
 *
 * @param {boolean|{when:Object}} required
 * @param {Object} ast Parsed message.
 * @returns {boolean}
 */
function isRequired(required, ast) {
  if (typeof required === 'boolean') {
    return required;
  }

  const when = required?.when;

  if (!when) {
    return false;
  }

  const type = ast.header.type;

  if (Array.isArray(when.notType) && includesIgnoreCase(when.notType, type)) {
    return false;
  }

  const conditions = [];

  if (Array.isArray(when.type)) {
    conditions.push(includesIgnoreCase(when.type, type));
  }

  if (Array.isArray(when.notType)) {
    conditions.push(true);
  }

  if (Array.isArray(when.tokens)) {
    conditions.push(ast.footer.tokens.some(token => includesIgnoreCase(when.tokens, token.key)));
  }

  if (!conditions.length) {
    return false;
  }

  return when.mode === WHEN_MODE.OR
    ? conditions.some(Boolean)
    : conditions.every(Boolean);
}

module.exports = {
  isRequired
};
