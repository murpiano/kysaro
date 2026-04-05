/**
 * @file Errors constants.
 *
 * @description
 * Defines characteristics  errors:
 * - errors names
 * - errors codes
 *
 * Used across of file loading and reading errors.
 */

const ERROR_NAMES = {
                    DuplicatePathError     : 'DuplicatePathError'   ,
                    EmptyFileError         : 'EmptyFileError'       ,
                    EmptyObjectError       : 'EmptyObjectError'     ,
                    FatalLoadError         : 'FatalLoadError'       ,
                    FileNotFoundError      : 'FileNotFoundError'    ,
                    JsonParseError         : 'JsonParseError'       ,
                    LoadFileError          : 'LoadFileError'        ,
                    MissingArgumentsError  : 'MissingArgumentsError',
                    MissingPathError       : 'MissingPathError'     ,
};


const ERROR_CODES = {
                    DEFAULT_NOT_FOUND     : 'DEFAULT_NOT_FOUND'     ,
                    DUPLICATE_PATH        : 'DUPLICATE_PATH'        ,
                    EMPTY_DEFAULT_FILE    : 'EMPTY_DEFAULT_FILE'    ,
                    EMPTY_DEFAULT_OBJECT  : 'EMPTY_DEFAULT_OBJECT'  ,
                    EMPTY_USER_FILE       : 'EMPTY_USER_FILE'       ,
                    EMPTY_USER_OBJECT     : 'EMPTY_USER_OBJECT'     ,
                    FATAL_LOAD            : 'FATAL_LOAD'            ,
                    INVALID_JSON          : 'INVALID_JSON'          ,
                    MISSING_ARGUMENTS     : 'MISSING_ARGUMENTS'     ,
                    MISSING_DEFAULT_PATH  : 'MISSING_DEFAULT_PATH'  ,
                    MISSING_USER_PATH     : 'MISSING_USER_PATH'     ,
                    USER_NOT_FOUND        : 'USER_NOT_FOUND'        ,
};

module.exports = {
  ERROR_NAMES,
  ERROR_CODES,
};
