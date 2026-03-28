const {ERROR_NAMES, ERROR_CODES} = require('./const');


class LoadFileError extends Error {
  constructor(message, meta = {}) {
    super(message);
    this.name = ERROR_NAMES.LoadFileError;
    this.meta = meta;
  }
}


class MissingArgumentsError extends LoadFileError {
  constructor(args, isCritical = true) {
    super(`Critical: arguments "${args.join(', ')}" are mandatory`, {
      code: ERROR_CODES.MISSING_ARGUMENTS, isCritical, args
    });
    this.name = ERROR_NAMES.MissingArgumentsError;
  }
}


class FileNotFoundError extends LoadFileError {
  constructor(file, path, isCritical = false) {
    super(isCritical
            ?
            `Critical: default ${file} missing: ${path}`
            :
            `User ${file} not found: ${path}. Using defaults...`,
          {
            code: isCritical ? ERROR_CODES.DEFAULT_NOT_FOUND : ERROR_CODES.USER_NOT_FOUND,
            file,
            path,
            isCritical
          });
    this.name = ERROR_NAMES.FileNotFoundError;
  }
}


class EmptyFileError extends LoadFileError {
  constructor(file, path, isCritical = false) {
    super(isCritical
            ?
            `Critical: default ${file} is physically empty: ${path}`
            :
            `User ${file} is physically empty: ${path}`,
          {
            code: isCritical ? ERROR_CODES.EMPTY_DEFAULT_FILE : ERROR_CODES.EMPTY_USER_FILE,
            file,
            path,
            isCritical
          });
    this.name = ERROR_NAMES.EmptyFileError;
  }
}


class JsonParseError extends LoadFileError {
  constructor(path, originalError, isCritical = false) {
    super(`${isCritical
            ?
            `Critical: invalid JSON in default settings ${path}: `
            :
            `Invalid JSON in user settings ${path}: `} ${originalError.message}`,
          {
            code: ERROR_CODES.INVALID_JSON, path, isCritical, originalError
          });
    this.name          = ERROR_NAMES.JsonParseError;
    this.originalError = originalError;
  }
}


class EmptyObjectError extends LoadFileError {
  constructor(path, isCritical = false) {
    super(isCritical
            ?
            `Critical: default file ${path} is an empty object {}. Package might be broken.`
            :
            `User file ${path} is an empty object {}. Using defaults...`,
          {
            code: isCritical ? ERROR_CODES.EMPTY_DEFAULT_OBJECT : ERROR_CODES.EMPTY_USER_OBJECT,
            path,
            isCritical
          });
    this.name = ERROR_NAMES.EmptyObjectError;
  }
}


class DuplicatePathError extends LoadFileError {
  constructor(path) {
    super(`user and default setting paths are identical: ${path}`, {
      code: ERROR_CODES.DUPLICATE_PATH, path
    });
    this.name = ERROR_NAMES.DuplicatePathError;
  }
}


class MissingPathError extends LoadFileError {
  constructor(file, isCritical = false) {
    super(isCritical
            ?
            `Critical: Default ${file} settings directory is not provided`
            :
            `User ${file} settings directory is not provided. Using defaults...`,
          {
            code: isCritical ? ERROR_CODES.MISSING_DEFAULT_PATH : ERROR_CODES.MISSING_USER_PATH,
            file,
            isCritical
          });
    this.name = ERROR_NAMES.MissingPathError;
  }
}


class FatalLoadError extends LoadFileError {
  constructor(file, msg, isCritical = true) {
    super(`Critical: failed to load settings ${file}. ${msg}`, {
      code: ERROR_CODES.FATAL_LOAD, file, isCritical
    });
    this.name = ERROR_NAMES.FatalLoadError;
  }
}


module.exports = {
  LoadFileError,
  MissingArgumentsError,
  FileNotFoundError,
  EmptyFileError,
  JsonParseError,
  EmptyObjectError,
  DuplicatePathError,
  MissingPathError,
  FatalLoadError,
};
