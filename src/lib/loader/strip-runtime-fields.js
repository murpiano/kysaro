const _META_FIELD = {
  SCHEMA: '$schema',
  TITLE: 'title',
  DESCRIPTION: 'description',
  PRESET: 'preset',
}


/**
 * Removes runtime-only metadata fields from configuration objects.
 *
 * Root-level metadata fields are removed recursively while preserving
 * the remaining structure.
 *
 * @param {*} input Source value.
 * @param {boolean} [isRoot=true] Indicates whether current object is root.
 * @returns {*}
 */
function _stripRuntimeFields(input, isRoot = true) {

  if (!input || typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(item =>
      _stripRuntimeFields(item, false)
    );
  }

  const result = {};

  Object.entries(input).forEach(([key, value]) => {

    if (isRoot && (
        key === _META_FIELD.SCHEMA ||
        key === _META_FIELD.TITLE ||
        key === _META_FIELD.DESCRIPTION ||
        key === _META_FIELD.PRESET
      )
    ) {
      return;
    }

    result[key] = _stripRuntimeFields(value, false);
  });

  return result;
}


module.exports = {
  _stripRuntimeFields
};
