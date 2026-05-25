const path = require("path");
const {_createFileValidationSection} = require("./file-validation");
const {_createJsonFileUploadSection} = require("./json-file-upload");
const {_createValidatorCreationSection} = require("./validator-creation");
const {_REPORT_KEY, _FILE_KEY_NAME, _DISPLAY_MODE} = require("../../const");


function _normalizeGroupFiles(files, groupName) {
  return files.filter(file => file.group === groupName);
}

function _normalizeEntityState(state, groupName, entity) {
  return (state?.groups?.[groupName]?.[entity] || {});
}


function _createMdReport(state, files, normalizedOptions) {
  const {report} = normalizedOptions.result;

  if (!report?.enabled) {
    return;
  }

  const reportDir = report.dir;
  const groups = Object.keys(state.groups || {});

  groups.forEach(groupName => {
    const groupFiles = _normalizeGroupFiles(files, groupName);

    if (!groupFiles.length) {
      return;
    }

    const settings = _normalizeEntityState(state, groupName, _REPORT_KEY.SETTINGS);
    const schemas = _normalizeEntityState(state, groupName, _REPORT_KEY.SCHEMAS);
    const validators = _normalizeEntityState(state, groupName, _REPORT_KEY.VALIDATORS);
    const validations = _normalizeEntityState(state, groupName, _REPORT_KEY.VALIDATIONS);

    const reportPath = path.join(reportDir, `${groupName}.md`);
    const reportTitle = groupName;

    /*
    |----------------------------------------------------------------------
    | SETTINGS
    |----------------------------------------------------------------------
    */
    _createJsonFileUploadSection({
      allSettings: settings,
      files: groupFiles,
      targetType: _FILE_KEY_NAME.FILE,
      reportPath,
      section: _REPORT_KEY.SETTINGS,
      displayMode: _DISPLAY_MODE.ALWAYS,
      reportTitle
    });

    /*
    |----------------------------------------------------------------------
    | SCHEMAS
    |----------------------------------------------------------------------
    */
    _createJsonFileUploadSection({
      allSettings: schemas,
      files: groupFiles,
      targetType: _FILE_KEY_NAME.SCHEMA,
      reportPath,
      section: _REPORT_KEY.SCHEMAS,
      displayMode: _DISPLAY_MODE.ALWAYS,
      reportTitle
    });

    /*
    |----------------------------------------------------------------------
    | VALIDATORS
    |----------------------------------------------------------------------
    */
    _createValidatorCreationSection({
      validators,
      files: groupFiles,
      reportPath,
      section: _REPORT_KEY.VALIDATORS,
      displayMode: _DISPLAY_MODE.ALWAYS,
      reportTitle
    });

    /*
    |----------------------------------------------------------------------
    | VALIDATIONS
    |----------------------------------------------------------------------
    */
    _createFileValidationSection({
      validations,
      allSettings: settings,
      files: groupFiles,
      reportPath,
      section: _REPORT_KEY.VALIDATIONS,
      displayMode: _DISPLAY_MODE.ALWAYS,
      reportTitle
    });

  });

}


module.exports = {
  _createMdReport
};
