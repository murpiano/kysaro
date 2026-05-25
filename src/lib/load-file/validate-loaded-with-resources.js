const {_resolveResources} = require("./resolve-resources");

function _validateLoadedWithResources(loaded) {

  if (!loaded.ok) {
    return loaded;
  }

  const resolved = _resolveResources({
    config: loaded.data,
    meta: loaded.meta
  });

  loaded.issues.push(
    ...(resolved.issues || [])
  );

  if (!resolved.ok) {
    loaded.ok = false;
    loaded.data = null;
    return loaded;
  }

  loaded.resources = resolved.resources;

  return loaded;
}


module.exports = {
  _validateLoadedWithResources
};
