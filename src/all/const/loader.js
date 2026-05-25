const LOADER_ENTITY = {
  SETTINGS: 'settings',
  SCHEMA: 'schema',
  VALIDATOR: 'validator',
  VALIDATION: 'validation'
}

const LOADER_DEPENDENCY_TYPE = {
  RESOURCE: 'resource',
  // SCHEMA: 'schema',
  // EXTENDS: 'extends',
  // IMPORT: 'import',
  // PRESET: 'preset'
}

const LOADER_ISSUE_CODE = {
  SCHEMA_CORRUPTED: 'SCHEMA_CORRUPTED',
  SCHEMA_INVALID: 'SCHEMA_INVALID',
  VALIDATOR_NOT_AVAILABLE: 'VALIDATOR_NOT_AVAILABLE',
  SETTINGS_REQUIRED_PROPERTY: 'SETTINGS_REQUIRED_PROPERTY',
  SETTINGS_UNKNOWN_PROPERTY: 'SETTINGS_UNKNOWN_PROPERTY',
  SETTINGS_UNALLOWED_TYPE: 'SETTINGS_UNALLOWED_TYPE',
  SETTINGS_UNALLOWED_VALUES: 'SETTINGS_UNALLOWED_VALUES',
  SETTINGS_VALIDATION_ERROR: 'SETTINGS_VALIDATION_ERROR'
};

const LOADER_ISSUE_MESSAGE = {
  SCHEMA_CORRUPTED: 'Schema is corrupted or missing',
  SCHEMA_INVALID: 'Schema is invalid',
  VALIDATOR_NOT_AVAILABLE: 'Validator is not available',
  SETTINGS_REQUIRED_PROPERTY: 'Missing property',
  SETTINGS_UNKNOWN_PROPERTY: 'Unknown property',
  SETTINGS_UNALLOWED_TYPE: 'Expected type',
  SETTINGS_UNALLOWED_VALUES: 'Unallowed values',
  SETTINGS_VALIDATION_ERROR: 'Validation error',
}

const LOADER_INFO_MESSAGE = {
  CHECK_SCHEMA_STATUS: 'Check the schema load status in the "💾 Settings Schemas" ↑',
  CHECK_VALIDATOR_STATUS: 'Check the validator status in the "👮‍♂️ Validators" ↑',
}

const LOADER_RECOMMENDATION_MESSAGE = {
  RESTORE_SCHEMA: 'Restore the original state of the schema or, if you haven\'t edited it, reinstall the package: npm install bvtrots-dx@latest',
  ENSURE_SYNTAX: 'Ensure syntax errors in schema or reinstall the package: npm install bvtrots-dx@latest',
  ENSURE_ERRORS: 'Ensure errors in settings file or reinstall the package: npm install bvtrots-dx@latest',
}

const LOADER_SCHEMA_VALIDATION_ERROR_KEYWORD = {
  REQUIRED: 'required',
  ADDITIONAL_PROPERTIES: 'additionalProperties',
  TYPE: 'type',
  ENUM: 'enum',
}


module.exports = {
  LOADER_ENTITY,
  LOADER_DEPENDENCY_TYPE,
  LOADER_ISSUE_CODE,
  LOADER_ISSUE_MESSAGE,
  LOADER_INFO_MESSAGE,
  LOADER_RECOMMENDATION_MESSAGE,
  LOADER_SCHEMA_VALIDATION_ERROR_KEYWORD
}
