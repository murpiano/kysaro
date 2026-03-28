import fs from 'fs';
import path from 'path';
import os from 'os';
import loadFile from '../engine';
import { ERROR_NAMES, ERROR_CODES } from "../const";


describe('loadFile (integration)', () => {
  const fileName = 'config.json';

  let rootDir: string;
  let userDir: string;
  let defaultDir: string;


  const write = (dir: string, content: string) => {
    fs.writeFileSync(path.join(dir, fileName), content, 'utf-8');
  };


  const setup = (
    userContent?: string,
    defaultContent?: string,
    samePath = false
  ) => {
    if (userContent !== undefined) write(userDir, userContent);
    if (defaultContent !== undefined) write(defaultDir, defaultContent);

    return {
      user: userDir,
      file: fileName,
      def: samePath ? userDir : defaultDir,
    };
  };


  beforeEach(() => {
    rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'load-file-test-'));
    userDir = path.join(rootDir, 'user');
    defaultDir = path.join(rootDir, 'default');

    fs.mkdirSync(userDir, { recursive: true });
    fs.mkdirSync(defaultDir, { recursive: true });
  });


  afterEach(() => {
    fs.rmSync(rootDir, { recursive: true, force: true });
  });


  it('returns fail when file argument is missing', () => {
    const { user, def } = setup('{"a":1}', '{"a":2}');
    const result = loadFile(user, null, def);
    const error = result.errors.find( e => e.name === ERROR_NAMES.MissingArgumentsError );
    expect(result.ok).toBe(false);
    expect(error).toBeDefined();
  });


  describe('user priority', () => {
    it('returns user config when it is valid', () => {
      const { user, file, def } = setup('{"a":1}', '{"a":2}');
      const result = loadFile(user, file, def);
      expect(result.ok).toBe(true);
      expect(result.data).toEqual({ a: 1 });
      expect(result.info).toContain('User settings are used');
    });


    it('adds warning when paths are equal', () => {
      const { user, file, def } = setup('{"a":1}', '{"a":2}', true);
      const result = loadFile(user, file, def);
      const warning = result.warnings.find( w => w.name === ERROR_NAMES.DuplicatePathError );
      expect(result.ok).toBe(true);
      expect(warning).toBeDefined();
      expect(warning.meta.code).toBe(ERROR_CODES.DUPLICATE_PATH);
    });
  });


  describe('returns default config when user config is invalid', () => {
    it.each([
      ['', ERROR_NAMES.EmptyFileError],
      ['{}', ERROR_NAMES.EmptyObjectError],
      ['{bad json}', ERROR_NAMES.JsonParseError],
    ])('returns default config when user config is bad (%s)', (userContent, errorName) => {
      const { user, file, def } = setup(userContent, '{"a":2}');
      const result = loadFile(user, file, def);
      expect(result.ok).toBe(true);
      expect(result.data).toEqual({ a: 2 });
      expect(result.info).toContain('Default settings are used');
    });


    it('returns default config when user file is missing', () => {
      const { user, file, def } = setup('{"a":1}', '{"a":2}');
      fs.unlinkSync(path.join(userDir, fileName));
      const result = loadFile(user, file, def);
      const warning = result.warnings.find( w => w.name === ERROR_NAMES.FileNotFoundError );
      expect(result.ok).toBe(true);
      expect(result.data).toEqual({ a: 2 });
      expect(warning).toBeDefined();
      expect(warning.meta.code).toBe(ERROR_CODES.USER_NOT_FOUND);
    });


    it('returns default config when user path is missing', () => {
      const { file, def } = setup(undefined, '{"a":2}');
      const result = loadFile(null, file, def);
      const warning = result.warnings.find( w => w.name === ERROR_NAMES.MissingPathError );
      expect(result.ok).toBe(true);
      expect(result.data).toEqual({ a: 2 });
      expect(warning).toBeDefined();
      expect(warning.meta.code).toBe(ERROR_CODES.MISSING_USER_PATH);
    });
  });


  describe('default failures', () => {
    it.each([
      [undefined, ERROR_NAMES.FileNotFoundError],
      ['', ERROR_NAMES.EmptyFileError],
      ['{bad json}', ERROR_NAMES.JsonParseError],
    ])('returns fail when default config is bad (%s)', (defaultContent, errorName) => {
      const { user, file, def } = setup('{bad json}', defaultContent);
      const result = loadFile(user, file, def);
      const error = result.errors.find( e => e.name === errorName );
      expect(result.ok).toBe(false);
      expect(result.data).toBeNull();
      expect(error).toBeDefined();
    });


    it('returns fail when default path is missing', () => {
      const { file } = setup('{bad json}', '{"a":2}');
      const result = loadFile(null, file, null);
      const error = result.errors.find( e => e.name === ERROR_NAMES.MissingPathError );
      expect(result.ok).toBe(false);
      expect(result.data).toBeNull();
      expect(error).toBeDefined();
      expect(error.meta.code).toBe(ERROR_CODES.MISSING_DEFAULT_PATH);
    });
  });


  describe('path edge cases', () => {
    it('fails when paths are equal and user is invalid', () => {
      const { user, file, def } = setup('', '{"a":2}', true);
      const result = loadFile(user, file, def);
      const error = result.errors.find( e => e.name === ERROR_NAMES.FatalLoadError );
      expect(result.ok).toBe(false);
      expect(result.data).toBeNull();
      expect(error).toBeDefined();
      expect(error.meta.code).toBe(ERROR_CODES.FATAL_LOAD);
    });
  });


  describe('error accumulation', () => {
    it('collects user warning + default error + fatal', () => {
      const { user, file, def } = setup('{}', '{bad json}');
      const result = loadFile(user, file, def);
      expect(result.ok).toBe(false);
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name:ERROR_NAMES.EmptyObjectError }),
        ])
      );

      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: ERROR_NAMES.JsonParseError }),
          expect.objectContaining({ name: ERROR_NAMES.FatalLoadError }),
        ])
      );
    });


    it('collects multiple errors from user and default', () => {
      const { user, file, def } = setup('{bad json}', '');
      const result = loadFile(user, file, def);
      expect(result.ok).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: ERROR_NAMES.JsonParseError }),
          expect.objectContaining({ name: ERROR_NAMES.EmptyFileError }),
          expect.objectContaining({ name: ERROR_NAMES.FatalLoadError }),
        ])
      );
    });
  });
});
