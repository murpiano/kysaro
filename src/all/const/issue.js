const ISSUE_SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning'
}

const ISSUE_SOURCE = {
  LOADER: 'loader',
  PIPELINE: 'pipeline',
  VALIDATOR: 'validator',
  ANALYZER: 'analyzer'
}

const ISSUE_CODE = {
  MESSAGE_IS_EMPTY: 'MESSAGE_IS_EMPTY',
  MESSAGE_IS_INVALID: 'MESSAGE_IS_INVALID',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_TYPE: 'INVALID_TYPE',
  UNALLOWED_VALUE: 'UNALLOWED_VALUE'
}

const ISSUE_MESSAGE = {
  MESSAGE_IS_EMPTY: 'Commit message is empty',
  MESSAGE_IS_INVALID: 'Errors were found while checking the commit message.',
  CONFIGURATION_ERROR: 'Kysaro settings are invalid, the message was not checked',
  INVALID_FORMAT: 'Format must match',
  INVALID_TYPE: 'Value must be string',
  MUST_USE_ALLOWED: 'Must use only allowed values',
}

const ISSUE_CATEGORY = {
  FORMAT: 'format',
  ENTITY: 'entity',
  LENGTH: 'length',
  SEMANTIC: 'semantic',
  STRUCTURE: 'structure',
}


module.exports = {
  ISSUE_SEVERITY,
  ISSUE_SOURCE,
  ISSUE_CATEGORY,
  ISSUE_CODE,
  ISSUE_MESSAGE
}
