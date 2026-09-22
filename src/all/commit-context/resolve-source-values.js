const path = require('path');

const ANY = 'any';

/**
 * Resolves allowed values of a settings source.
 *
 * Source forms:
 * - `"any"` — any value;
 * - `{fromFiles: string[], inline: string[]}` — keys of the resource files
 *   plus inline values. The loader stores resource files by base name.
 *
 * @param {string|{fromFiles?:string[], inline?:string[]}} sourceConfig
 * @param {Object<string, Object>} [resources={}] Loaded resources by base name.
 * @returns {string[]|null} `null` when any value is allowed or the list is empty.
 */
function resolveSourceValues(sourceConfig, resources = {}) {
  if (!sourceConfig || sourceConfig === ANY || typeof sourceConfig !== 'object') {
    return null;
  }

  const values = new Set();

  (sourceConfig.fromFiles || []).forEach(file => {
    const name = path.basename(file, path.extname(file));

    Object.keys(resources?.[name] || {}).forEach(key => values.add(key));
  });

  (sourceConfig.inline || []).forEach(value => values.add(value));

  return values.size ? [...values] : null;
}

module.exports = {
  resolveSourceValues
};
