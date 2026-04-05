import {
  DuplicatePathError,
  EmptyFileError,
  EmptyObjectError,
  FatalLoadError,
  FileNotFoundError,
  JsonParseError,
  MissingArgumentsError,
  MissingPathError
} from '../errors'
import {ERROR_CODES, ERROR_NAMES} from '../errors-const';


describe('errors.js', () => {
  describe('LoadFileError Classes (unit)', () => {

    describe('MissingArgumentsError', () => {
      it('should have message when properties are missing (critical)', () => {
        const args = ['fileName'];
        const error = new MissingArgumentsError(args);
        expect(error.name).toBe(ERROR_NAMES.MissingArgumentsError);
        expect(error.message).toContain('(critical) missing required arguments: "fileName"');
        expect(error.meta.code).toBe(ERROR_CODES.MISSING_ARGUMENTS);
        expect(error.meta.isCritical).toBe(true);
      });
    });


    describe('FileNotFoundError', () => {
      it('should have message when user file not found (non-critical)', () => {
        const error = new FileNotFoundError('test.json', '/path/to/file', false);
        expect(error.message).toBe('user settings "test.json" not found');
        expect(error.meta.code).toBe(ERROR_CODES.USER_NOT_FOUND);
        expect(error.meta.isCritical).toBe(false);
      });

      it('should have message when default file not found (critical)', () => {
        const error = new FileNotFoundError('test.json', '/path/to/file', true);
        expect(error.message).toBe('(critical) default settings "test.json" not found');
        expect(error.meta.code).toBe(ERROR_CODES.DEFAULT_NOT_FOUND);
        expect(error.meta.isCritical).toBe(true);
      });
    });


    describe('EmptyFileError', () => {
      it('should have message when user file is empty (non-critical)', () => {
        const error = new EmptyFileError('settings.json', '/tmp/settings.json', false);
        expect(error.message).toContain('user settings "settings.json" is empty');
        expect(error.meta.code).toBe(ERROR_CODES.EMPTY_USER_FILE);
        expect(error.meta.isCritical).toBe(false);
      });

      it('should have message when default file is empty (critical)', () => {
        const error = new EmptyFileError('settings.json', '/tmp/settings.json', true);
        expect(error.message).toContain('(critical) default settings "settings.json" is empty');
        expect(error.meta.code).toBe(ERROR_CODES.EMPTY_DEFAULT_FILE);
        expect(error.meta.isCritical).toBe(true);
      });
    });


    describe('JsonParseError', () => {
      it('should include original error message', () => {
        const original = new Error('Unexpected token Z in JSON');
        const error = new JsonParseError('test.json', '/path/test.json', original, false);
        expect(error.name).toBe(ERROR_NAMES.JsonParseError);
        expect(error.message).toContain('invalid JSON in user settings "test.json"');
        expect(error.meta.originalError).toBe(original);
        expect(error.meta.code).toBe(ERROR_CODES.INVALID_JSON);
      });
    });


    describe('EmptyObjectError', () => {
      it('should have message when user file is empty object (non-critical)', () => {
        const error = new EmptyObjectError('test.json', '/path/test.json', false);
        expect(error.message).toBe('user settings "test.json" is empty object');
        expect(error.meta.code).toBe(ERROR_CODES.EMPTY_USER_OBJECT);
        expect(error.meta.isCritical).toBe(false);
      });

      it('should have message when default file is empty object (critical)', () => {
        const error = new EmptyObjectError('test.json', '/path/test.json', true);
        expect(error.message).toContain('(critical) default settings "test.json" is empty object');
        expect(error.meta.code).toBe(ERROR_CODES.EMPTY_DEFAULT_OBJECT);
        expect(error.meta.isCritical).toBe(true);
      });
    });


    describe('DuplicatePathError', () => {
      it('should have message when user and default paths are identical', () => {
        const path = '/same/path.json';
        const error = new DuplicatePathError('test.json', path);
        expect(error.message).toContain('user and default paths are identical for "test.json"');
        expect(error.meta.path).toBe(path);
        expect(error.meta.code).toBe(ERROR_CODES.DUPLICATE_PATH);
      });
    });


    describe('MissingPathError', () => {
      it('should have message when user path is missing (non-critical)', () => {
        const error = new MissingPathError('test.json', false);
        expect(error.message).toContain('user settings path is missing for "test.json"');
        expect(error.meta.code).toBe(ERROR_CODES.MISSING_USER_PATH);
        expect(error.meta.isCritical).toBe(false);
      });

      it('should have message when default path is missing (critical)', () => {
        const error = new MissingPathError('test.json', true);
        expect(error.message).toContain('(critical) default settings path is missing for "test.json"');
        expect(error.meta.code).toBe(ERROR_CODES.MISSING_DEFAULT_PATH);
        expect(error.meta.isCritical).toBe(true);
      });
    });


    describe('FatalLoadError', () => {
      it('should have message when failed to load any settings (critical)', () => {
        const error = new FatalLoadError('test.json', 'Unexpected crash');
        expect(error.message).toContain('(critical) failed to load "test.json". Unexpected crash');
        expect(error.meta.isCritical).toBe(true);
        expect(error.meta.code).toBe(ERROR_CODES.FATAL_LOAD);
      });
    });
  })
});
