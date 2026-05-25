function resolveSourceValues(sourceConfig, resource = {}) {

  if (!sourceConfig || sourceConfig === 'any') {
    return [];
  }

  const values = new Set();

  /*
  |------------------------------------------------------------------
  | INLINE
  |------------------------------------------------------------------
  */

  if (Array.isArray(sourceConfig.inline)) {
    sourceConfig.inline.forEach(value => {
      values.add(value)
    });
  }

  /*
  |------------------------------------------------------------------
  | RESOURCE FILE
  |------------------------------------------------------------------
  */

  Object.keys(resource).forEach(key => {
    values.add(key)
  });
  return [...values];
}


module.exports = {
  resolveSourceValues
};
