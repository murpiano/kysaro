const {pipeline} = require('./lib/pipeline');
const {parseMessage} = require('./lib/parser');
const {KysaroException} = require('./lib/output');
const {createConfiguration} = require('./config');
const {COMMIT_TYPE} = require('./all/const/const');

/**
 * Checks a message with the settings of a project.
 *
 * @param {string} message Message to check.
 * @param {Object} [options]
 * @param {string|null} [options.type=null] Message kind from `COMMIT_TYPE`; detected when `null`.
 * @param {string} [options.cwd=process.cwd()] Project root with optional `.kysaro/settings`.
 * @param {Object} [options.loader={}] Loader options.
 * @returns {Object} KysaroResult.
 */
function lint(message, {type = null, cwd = process.cwd(), loader = {}} = {}) {
  return pipeline(message, type, createConfiguration(cwd), loader);
}

module.exports = {
  lint,
  pipeline,
  parseMessage,
  createConfiguration,
  KysaroException,
  COMMIT_TYPE
};
