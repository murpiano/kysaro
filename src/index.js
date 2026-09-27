const {pipeline, createPipeline} = require('./lib/pipeline');
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

/**
 * Loads project settings once and returns a function that checks messages.
 *
 * @param {Object} [options]
 * @param {string} [options.cwd=process.cwd()]
 * @param {Object} [options.loader={}]
 * @returns {function(string, (string|null)=): Object} `(message, type) => KysaroResult`.
 */
function createLinter({cwd = process.cwd(), loader = {}} = {}) {
  return createPipeline(createConfiguration(cwd), loader);
}

module.exports = {
  lint,
  createLinter,
  pipeline,
  createPipeline,
  parseMessage,
  createConfiguration,
  KysaroException,
  COMMIT_TYPE
};
