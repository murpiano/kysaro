const {isEmptyObj} = require("../../all/helpers/utils");
const {loadFile} = require("../load-file");
const {LOADER_ENTITY} = require("../../all/const/loader");


function _createState() {

  return {
    groups: {},
    issues: []
  };
}


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


function _pushIssues(state, result) {

  state.issues.push(
    ...(result?.issues || [])
  );
}


function _loadSettings(normalizedFiles, configuration) {
  const state = _createState();

  if (isEmptyObj(normalizedFiles)) {
    return state;
  }

  normalizedFiles.forEach(file => {
    const group = file.group;
    _ensureGroup(state, group);


    const settings = loadFile(
      {
        ...file.file,
        category: LOADER_ENTITY.SETTINGS
      },
      configuration.files.strategy
    );

    const schema = loadFile(
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

  });

  return state;
}


module.exports = {
  _loadSettings
};
