import fs from 'fs';
import path from 'path';
import os from 'os';
import loadFile from '../load-file';
import {ERROR_CODES, ERROR_NAMES} from "../const";

describe('load-file/core.js', () => {
  describe('loadFile (integration)', () => {
    const fileName = 'test.json';

    let rootDir: string;
    let userDir: string;
    let defaultDir: string;

    const write = (dir: string, content: string) => {
      fs.writeFileSync(path.join(dir, fileName), content, 'utf-8');
    };

    const setup = ({
                     defaultContent,
                     userContent,
                     samePath = false,
                   }: {
      defaultContent?: string | null;
      userContent?: string | null;
      samePath?: boolean;
    }) => {
      if(userContent!==null && userContent!==undefined) {
        write(userDir, userContent);
      }

      if(defaultContent!==null && defaultContent!==undefined) {
        write(defaultDir, defaultContent);
      }

      return {
        file: fileName,
        def: samePath ? userDir : defaultDir,
        user: userDir,
      };
    };

    beforeEach(() => {
      rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'load-file-test-'));
      userDir = path.join(rootDir, 'user');
      defaultDir = path.join(rootDir, 'default');

      fs.mkdirSync(userDir, {recursive: true});
      fs.mkdirSync(defaultDir, {recursive: true});
    });

    afterEach(() => {
      fs.rmSync(rootDir, {recursive: true, force: true});
    });


    it('returns fail when file argument is missing (critical)', () => {
      const {def, user} = setup({
        defaultContent: '{"a":2}',
        userContent: '{"a":1}'
      });
      const result = loadFile(null, def, user);
      const error = result.errors.find(e => e.name===ERROR_NAMES.MissingArgumentsError);
      expect(result.ok).toBe(false);
      expect(error).toBeDefined();
      expect(error.meta.isCritical).toBe(true);
    });


    describe('user priority', () => {
      it('returns user config when it is valid', () => {
        const {file, def, user} = setup({
          defaultContent: '{"a":2}',
          userContent: '{"a":1}'
        });
        const result = loadFile(file, def, user);
        expect(result.ok).toBe(true);
        expect(result.data).toEqual({a: 1});
        expect(result.info).toContain('User settings are used');
      });

      it('uses user config if it is valid array', () => {
        const {user, file, def} = setup({defaultContent: '{"a":2}', userContent: '[1,2,3]'});
        const result = loadFile(file, def, user);

        expect(result.ok).toBe(true);
        expect(result.data).toEqual([1,2,3]);
      });

      it('adds warning when paths are equal', () => {
        const {user, file, def} = setup({
          defaultContent: '{"a":2}',
          userContent: '{"a":1}',
          samePath: true
        });
        const result = loadFile(file, def, user);
        const warning = result.warnings.find(w => w.name===ERROR_NAMES.DuplicatePathError);
        expect(result.ok).toBe(true);
        expect(warning).toBeDefined();
        expect(warning.meta.code).toBe(ERROR_CODES.DUPLICATE_PATH);
      });
    });


    describe('returns default config when user config is invalid (non-critical)', () => {
      it.each([
        ['', ERROR_NAMES.EmptyFileError],
        ['{}', ERROR_NAMES.EmptyObjectError],
        ['{bad json}', ERROR_NAMES.JsonParseError],
      ])('returns default config when user config is bad (%s) (non-critical)', (userContent, errorName) => {
        const {file, def, user} = setup({
          defaultContent: '{"a":2}',
          userContent
        });
        const result = loadFile(file, def, user);
        expect(result.ok).toBe(true);
        expect(result.data).toEqual({a: 2});
        expect(result.info).toContain('Default settings are used');
        const warning = result.warnings.find(w => w.name===errorName);
        expect(warning.meta.isCritical).toBe(false);
        const error = result.errors.find(e => e.meta.isCritical===true);
        expect(error).toBeUndefined();
      });

      it('returns default config when user file is missing (non-critical)', () => {
        const {file, def, user} = setup({
          defaultContent: '{"a":2}',
          userContent: '{"a":1}'
        });
        fs.unlinkSync(path.join(userDir, fileName));
        const result = loadFile(file, def, user);
        const warning = result.warnings.find(w => w.name===ERROR_NAMES.FileNotFoundError);
        const error = result.errors.find(e => e.meta.isCritical===true);
        expect(result.ok).toBe(true);
        expect(result.data).toEqual({a: 2});
        expect(warning).toBeDefined();
        expect(warning.meta.code).toBe(ERROR_CODES.USER_NOT_FOUND);
        expect(error).toBeUndefined();
      });

      it('returns default config when user path is missing (non-critical)', () => {
        const {file, def} = setup({
          defaultContent: '{"a":2}',
          userContent: undefined
        });
        const result = loadFile(file, def, false);
        const warning = result.warnings.find(w => w.meta.isCritical===true);
        const error = result.errors.find(e => e.meta.isCritical===true);
        expect(result.ok).toBe(true);
        expect(result.data).toEqual({a: 2});
        expect(result.info).toContain('Default settings are used');
        expect(warning).toBeUndefined();
        expect(error).toBeUndefined();
      });
    });


    describe('default failures (critical)', () => {
      it.each([
        [undefined, ERROR_NAMES.FileNotFoundError],
        ['', ERROR_NAMES.EmptyFileError],
        ['{bad json}', ERROR_NAMES.JsonParseError],
      ])('returns fail when default config is bad (%s) (critical)', (defaultContent, errorName) => {
        const {file, def, user} = setup({
          defaultContent,
          userContent: '{bad json}'
        });
        const result = loadFile(file, def, user);
        const error = result.errors.find(e => e.name===errorName);
        expect(result.ok).toBe(false);
        expect(result.data).toBeNull();
        expect(error).toBeDefined();
        expect(error.meta.isCritical).toBe(true);
      });

      it('returns fail when default path is missing', () => {
        const {file} = setup({
          defaultContent: '{"a":2}',
          userContent: '{bad json}'
        });
        const result = loadFile(file, null, null);
        const error = result.errors.find(e => e.name===ERROR_NAMES.MissingPathError);
        expect(result.ok).toBe(false);
        expect(result.data).toBeNull();
        expect(error).toBeDefined();
        expect(error.meta.code).toBe(ERROR_CODES.MISSING_DEFAULT_PATH);
        expect(error.meta.isCritical).toBe(true);
      });
    });


    describe('path edge cases', () => {
      it('fails when paths are equal and user is invalid', () => {
        const {file, def, user} = setup({
          defaultContent: '{"a":2}',
          userContent: '',
          samePath: true
        });
        const result = loadFile(file, def, user);
        const error = result.errors.find(e => e.name===ERROR_NAMES.FatalLoadError);
        expect(result.ok).toBe(false);
        expect(result.data).toBeNull();
        expect(error).toBeDefined();
        expect(error.meta.code).toBe(ERROR_CODES.FATAL_LOAD);
        expect(error.meta.isCritical).toBe(true);
      });
    });


    describe('error accumulation', () => {
      it('collects user warning + default error + fatal', () => {
        const {file, def, user} = setup({
          defaultContent: '{bad json}',
          userContent: '{}'
        });
        const result = loadFile(file, def, user);
        expect(result.ok).toBe(false);
        expect(result.warnings).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: ERROR_NAMES.EmptyObjectError
            }),
          ])
        );
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({name: ERROR_NAMES.JsonParseError}),
            expect.objectContaining({name: ERROR_NAMES.FatalLoadError}),
            expect.objectContaining({
              meta:
                expect.objectContaining({isCritical: true})
            })
          ])
        );
      });

      it('collects multiple errors from user and default', () => {
        const {file, def, user} = setup({
          defaultContent: '',
          userContent: '{bad json}'
        });
        const result = loadFile(file, def, user);
        expect(result.ok).toBe(false);
        expect(result.warnings).toEqual(
          expect.arrayContaining([
            expect.objectContaining({name: ERROR_NAMES.JsonParseError}),
          ])
        );
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({name: ERROR_NAMES.EmptyFileError}),
            expect.objectContaining({name: ERROR_NAMES.FatalLoadError}),
            expect.objectContaining({
              meta:
                expect.objectContaining({isCritical: true})
            })
          ])
        )
      });
    });
  });
})
