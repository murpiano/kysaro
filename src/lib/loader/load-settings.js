const {LOADER_ENTITY} = require("../../all/const/loader");
const {isEmptyObj} = require("../../all/helpers/utils");
const loadFileModule = require('../load-file');
const path = require("path");


/**
 * Creates initial loader state.
 *
 * @returns {{
 *   groups:Object,
 *   issues:Array
 * }}
 */
function _createState() {

  return {
    groups: {},
    issues: []
  };
}


/**
 * Ensures group container exists in state.
 *
 * @param {Object} state Loader state.
 * @param {string} group Group name.
 * @returns {void}
 */
function _ensureGroup(state, group) {

  if (state.groups[group]) {
    return;
  }

  state.groups[group] = {
    settings: {},
    schemas: {},
    validators: {},
    validations: {},
    resources: {}
  };
}


/**
 * Appends issues from load result into global state.
 *
 * @param {Object} state Loader state.
 * @param {Object} result File load result.
 * @returns {void}
 */
function _pushIssues(state, result) {

  state.issues.push(
    ...(result?.issues || [])
  );
}


/**
 * Loads settings and schemas into normalized state.
 *
 * @param {Array<Object>} normalizedFiles Normalized file descriptors.
 * @param {Object} configuration Runtime configuration.
 * @returns {Object}
 */
function _loadSettings(normalizedFiles, configuration) {
  const state = _createState();

  if (isEmptyObj(normalizedFiles)) {
    return state;
  }

  normalizedFiles.forEach(file => {
    const group = file.group;
    _ensureGroup(state, group);


    const settings = loadFileModule.loadFile(
      {
        ...file.file,
        category: LOADER_ENTITY.SETTINGS
      },
      configuration.files.strategy
    );

    const schema = loadFileModule.loadFile(
      {
        ...file.schema,
        category: LOADER_ENTITY.SCHEMA
      },
      configuration.schemas.strategy
    );


    state.groups[group].settings[file.name] = settings;
    state.groups[group].schemas[file.name] = schema;

    _pushIssues(state, settings);
    _pushIssues(state, schema);

    const reportDir =
      configuration?.result?.report?.dir;

    if (reportDir) {
      state.groups[group].reportPath =
        path.join(reportDir, `${group}.md`);
    }

  });

  return state;
}


module.exports = {
  _loadSettings
};
