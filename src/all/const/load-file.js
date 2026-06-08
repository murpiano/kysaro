const LOAD_FILE_LOAD_SOURCE = {
  USER: 'user',
  DEFAULT: 'default'
};

const LOAD_FILE_LOAD_STRATEGY = {
  DEFAULT_ONLY: 'DEFAULT_ONLY',
  USER_ONLY: 'USER_ONLY',
  USER_FIRST: 'USER_FIRST'
};

const LOAD_FILE_ISSUE_CODE = {
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  INVALID_JSON: 'INVALID_JSON',
  EMPTY_FILE: 'EMPTY_FILE',
  EMPTY_OBJECT: 'EMPTY_OBJECT',
  PATH_MISSING: 'PATH_MISSING',
  FATAL_LOAD: 'FATAL_LOAD',

  USER_FILE_NOT_FOUND: 'USER_FILE_NOT_FOUND',
  USER_PATH_MISSING: 'USER_PATH_MISSING',
  USER_INVALID_JSON: 'USER_INVALID_JSON',
  USER_EMPTY_FILE: 'USER_EMPTY_FILE',
  USER_EMPTY_OBJECT: 'USER_EMPTY_OBJECT',

  DEFAULT_INVALID_JSON: 'DEFAULT_INVALID_JSON',
  DEFAULT_EMPTY_FILE: 'DEFAULT_EMPTY_FILE',
  DEFAULT_EMPTY_OBJECT: 'DEFAULT_EMPTY_OBJECT',
  DEFAULT_FILE_NOT_FOUND: 'DEFAULT_FILE_NOT_FOUND',
  DEFAULT_PATH_MISSING: 'DEFAULT_PATH_MISSING',

  DUPLICATE_PATHS: 'DUPLICATE_PATHS',
  MISSING_ARGUMENTS: 'MISSING_ARGUMENTS',
  INVALID_STRATEGY: 'INVALID_STRATEGY',
};

const LOAD_FILE_ISSUE_MESSAGE = {
  FILE_NOT_FOUND: '{source} settings file not found',
  INVALID_JSON: '{source} settings file contains invalid JSON',
  EMPTY_FILE: '{source} settings file is empty',
  EMPTY_OBJECT: '{source} settings file is empty object',
  DUPLICATE_PATHS: 'User and default paths are identical',
  PATH_MISSING: '{source} settings path is missing',
  INVALID_STRATEGY: 'Invalid load strategy',
  MISSING_ARGUMENTS: 'Missing required arguments',
};

const LOAD_FILE_INFO_MESSAGE = {
  INVALID_STRATEGY: 'Use available strategy',
  MISSING_ARGUMENTS: 'Add required arguments',
}

const LOAD_FILE_RECOMMENDATION_MESSAGE = {
  INVALID_STRATEGY: 'Restore the valid argument \'strategy\' to loadFile function or reinstall the package: npm install bvtrots-dx@latest',
  MISSING_ARGUMENTS: 'Restore the valid argument \'name\' to loadFile function or reinstall the package: npm install bvtrots-dx@latest',
}

module.exports = {
  LOAD_FILE_LOAD_SOURCE,
  LOAD_FILE_LOAD_STRATEGY,
  LOAD_FILE_ISSUE_CODE,
  LOAD_FILE_ISSUE_MESSAGE,
  LOAD_FILE_INFO_MESSAGE,
  LOAD_FILE_RECOMMENDATION_MESSAGE
};
