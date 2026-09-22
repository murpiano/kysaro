/**
 * Looks a value up in a list of allowed values, ignoring case.
 *
 * @param {string} value
 * @param {string[]|null} allowed `null` means any value is allowed.
 * @returns {{known:boolean, match:string|null}} `match` is the spelling from the list.
 */
function lookup(value, allowed) {
  if (!Array.isArray(allowed)) {
    return {known: true, match: null};
  }

  const match = allowed.find(item => item.toLowerCase() === String(value).toLowerCase());

  return {
    known: match !== undefined,
    match: match ?? null
  };
}

/**
 * Formats allowed values for issue messages.
 *
 * @param {string[]} allowed
 * @returns {string}
 */
function formatAllowed(allowed) {
  return allowed.join(', ');
}

module.exports = {
  lookup,
  formatAllowed
};
