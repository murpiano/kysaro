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
import {ERROR_CODES, ERROR_NAMES} from '../const';


describe('errors.js', () => {
  describe('LoadFileError Classes (unit)', () => {

    describe('MissingArgumentsError', () => {
      it('should have message when properties are missing (critical)', () => {
        const args = ['fileName'];
        const error = new MissingArgumentsError(args);
        expect(error.name).toBe(ERROR_NAMES.MissingArgumentsError);
        expect(error.message).toContain('Critical: missing required arguments: "fileName".');
        expect(error.meta.code).toBe(ERROR_CODES.MISSING_ARGUMENTS);
        expect(error.meta.isCritical).toBe(true);
      });
    });


    describe('FileNotFoundError', () => {
      it('should have message when user file not found (non-critical)', () => {
        const error = new FileNotFoundError('test.json', '/path/to/file', false);
        expect(error.message).toBe('User test.json not found: /path/to/file.');
        expect(error.meta.code).toBe(ERROR_CODES.USER_NOT_FOUND);
        expect(error.meta.isCritical).toBe(false);
      });

      it('should have message when default file not found (critical)', () => {
        const error = new FileNotFoundError('test.json', '/path/to/file', true);
        expect(error.message).toBe('Critical: default test.json not found: /path/to/file.');
        expect(error.meta.code).toBe(ERROR_CODES.DEFAULT_NOT_FOUND);
        expect(error.meta.isCritical).toBe(true);
      });
    });


    describe('EmptyFileError', () => {
      it('should have message when user file is empty (non-critical)', () => {
        const error = new EmptyFileError('settings.json', '/tmp/settings.json', false);
        expect(error.message).toContain('User settings.json is empty: /tmp/settings.json.');
        expect(error.meta.code).toBe(ERROR_CODES.EMPTY_USER_FILE);
        expect(error.meta.isCritical).toBe(false);
      });

      it('should have message when default file is empty (critical)', () => {
        const error = new EmptyFileError('settings.json', '/tmp/settings.json', true);
        expect(error.message).toContain('Critical: default settings.json is empty: /tmp/settings.json.');
        expect(error.meta.code).toBe(ERROR_CODES.EMPTY_DEFAULT_FILE);
        expect(error.meta.isCritical).toBe(true);
      });
    });


    describe('JsonParseError', () => {
      it('should include original error message', () => {
        const original = new Error('Unexpected token Z in JSON');
        const error = new JsonParseError('/path/test.json', original, false);
        expect(error.name).toBe(ERROR_NAMES.JsonParseError);
        expect(error.message).toContain('Invalid JSON in user settings: /path/test.json.');
        expect(error.meta.originalError).toBe(original);
        expect(error.meta.code).toBe(ERROR_CODES.INVALID_JSON);
      });
    });


    describe('EmptyObjectError', () => {
      it('should have message when user file is empty object (non-critical)', () => {
        const error = new EmptyObjectError('/path/test.json', false);
        expect(error.message).toBe('User config is empty object: /path/test.json.');
        expect(error.meta.code).toBe(ERROR_CODES.EMPTY_USER_OBJECT);
        expect(error.meta.isCritical).toBe(false);
      });

      it('should have message when default file is empty object (critical)', () => {
        const error = new EmptyObjectError('/path/test.json', true);
        expect(error.message).toContain('Critical: default config is empty object: /path/test.json.');
        expect(error.meta.code).toBe(ERROR_CODES.EMPTY_DEFAULT_OBJECT);
        expect(error.meta.isCritical).toBe(true);
      });
    });


    describe('DuplicatePathError', () => {
      it('should have message when user and default paths are identical', () => {
        const path = '/same/path.json';
        const error = new DuplicatePathError(path);
        expect(error.message).toContain('User and default paths are identical: /same/path.json.');
        expect(error.meta.path).toBe(path);
        expect(error.meta.code).toBe(ERROR_CODES.DUPLICATE_PATH);
      });
    });


    describe('MissingPathError', () => {
      it('should have message when user path is missing (non-critical)', () => {
        const error = new MissingPathError('test.json', false);
        expect(error.message).toContain('User settings path is missing for: test.json.');
        expect(error.meta.code).toBe(ERROR_CODES.MISSING_USER_PATH);
        expect(error.meta.isCritical).toBe(false);
      });

      it('should have message when default path is missing (critical)', () => {
        const error = new MissingPathError('test.json', true);
        expect(error.message).toContain('Critical: default settings path is missing for: test.json.');
        expect(error.meta.code).toBe(ERROR_CODES.MISSING_DEFAULT_PATH);
        expect(error.meta.isCritical).toBe(true);
      });
    });


    describe('FatalLoadError', () => {
      it('should have message when failed to load any settings (critical)', () => {
        const error = new FatalLoadError('test.json', 'Unexpected crash');
        expect(error.message).toContain('Critical: failed to load: test.json. Unexpected crash');
        expect(error.meta.isCritical).toBe(true);
        expect(error.meta.code).toBe(ERROR_CODES.FATAL_LOAD);
      });
    });

  })
});
