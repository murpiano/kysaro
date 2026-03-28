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
import { ERROR_CODES, ERROR_NAMES } from '../const';


describe( 'LoadFileError Classes', () => {


  describe( 'MissingArgumentsError', () => {
    it( 'should have correct properties', () => {
      const args = [ 'file', 'path' ];
      const error = new MissingArgumentsError( args );
      expect( error.name ).toBe( ERROR_NAMES.MissingArgumentsError );
      expect( error.message ).toContain( 'arguments "file, path" are mandatory' );
      expect( error.meta.code ).toBe( ERROR_CODES.MISSING_ARGUMENTS );
      expect( error.meta.isCritical ).toBe( true );
    } );
  } );


  describe( 'FileNotFoundError', () => {
    it( 'should format message for user file (non-critical)', () => {
      const error = new FileNotFoundError( 'config.json', '/path/to/file', false );
      expect( error.message ).toBe( 'User config.json not found: /path/to/file. Using defaults...' );
      expect( error.meta.code ).toBe( ERROR_CODES.USER_NOT_FOUND );
      expect( error.meta.isCritical ).toBe( false );
    } );

    it( 'should format message for default file (critical)', () => {
      const error = new FileNotFoundError( 'config.json', '/path/to/file', true );
      expect( error.message ).toBe( 'Critical: default config.json missing: /path/to/file' );
      expect( error.meta.code ).toBe( ERROR_CODES.DEFAULT_NOT_FOUND );
    } );
  } );

  describe( 'EmptyFileError', () => {
    it( 'should handle non-critical empty file', () => {
      const error = new EmptyFileError( 'settings.json', '/tmp/settings.json', false );
      expect( error.message ).toContain( 'User settings.json is physically empty' );
      expect( error.meta.code ).toBe( ERROR_CODES.EMPTY_USER_FILE );
    } );

    it( 'should handle critical empty file', () => {
      const error = new EmptyFileError( 'settings.json', '/tmp/settings.json', true );
      expect( error.message ).toContain( 'Critical: default settings.json is physically empty' );
      expect( error.meta.code ).toBe( ERROR_CODES.EMPTY_DEFAULT_FILE );
    } );
  } );

  describe( 'JsonParseError', () => {
    it( 'should include original error message', () => {
      const original = new Error( 'Unexpected token Z in JSON' );
      const error = new JsonParseError( '/path/config.json', original, false );

      expect( error.name ).toBe( ERROR_NAMES.JsonParseError );
      expect( error.message ).toContain( 'Invalid JSON in user settings' );
      expect( error.message ).toContain( original.message );
      expect( error.originalError ).toBe( original );
      expect( error.meta.code ).toBe( ERROR_CODES.INVALID_JSON );
    } );
  } );

  describe( 'EmptyObjectError', () => {
    it( 'should report user file as empty object', () => {
      const error = new EmptyObjectError( '/path/config.json', false );
      expect( error.message ).toBe( 'User file /path/config.json is an empty object {}. Using defaults...' );
      expect( error.meta.code ).toBe( ERROR_CODES.EMPTY_USER_OBJECT );
    } );

    it( 'should report default file as empty object (critical)', () => {
      const error = new EmptyObjectError( '/path/config.json', true );
      expect( error.message ).toContain( 'Critical: default file' );
      expect( error.meta.code ).toBe( ERROR_CODES.EMPTY_DEFAULT_OBJECT );
    } );
  } );

  describe( 'DuplicatePathError', () => {
    it( 'should have fixed message and code', () => {
      const path = '/same/path.json';
      const error = new DuplicatePathError( path );
      expect( error.message ).toContain( 'paths are identical' );
      expect( error.meta.path ).toBe( path );
      expect( error.meta.code ).toBe( ERROR_CODES.DUPLICATE_PATH );
    } );
  } );

  describe( 'MissingPathError', () => {
    it( 'should handle missing user path', () => {
      const error = new MissingPathError( 'config.json', false );
      expect( error.message ).toContain( 'directory is not provided. Using defaults...' );
      expect( error.meta.code ).toBe( ERROR_CODES.MISSING_USER_PATH );
    } );

    it( 'should handle missing default path (critical)', () => {
      const error = new MissingPathError( 'config.json', true );
      expect( error.message ).toContain( 'Critical: Default config.json settings directory' );
      expect( error.meta.code ).toBe( ERROR_CODES.MISSING_DEFAULT_PATH );
    } );
  } );

  describe( 'FatalLoadError', () => {
    it( 'should be critical by default', () => {
      const error = new FatalLoadError( 'config.json', 'Unexpected crash' );
      expect( error.message ).toContain( 'Critical: failed to load settings config.json. Unexpected crash' );
      expect( error.meta.isCritical ).toBe( true );
      expect( error.meta.code ).toBe( ERROR_CODES.FATAL_LOAD );
    } );
  } );

} );
