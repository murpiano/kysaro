import fs from 'fs';
import path from 'path';
import os from 'os';
import readJson from '../read-json';
import {ERROR_CODES, ERROR_NAMES} from '../const';
import {expect} from "vitest";


describe('read-json.js', () => {
  describe('readJson (unit)', () => {
    let dir: string;
    const fileName = 'test.json';

    const fullPath = () => path.join(dir, fileName);

    beforeEach(() => {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'));
    });

    afterEach(() => {
      fs.rmSync(dir, {recursive: true, force: true});
    });

    const run = (content: string, isCritical = false) => {
      const errors = [];
      const warnings = [];

      if(content!==null) {
        fs.writeFileSync(fullPath(), content);
      }

      const data = readJson(fileName, fullPath(), {isCritical, errors, warnings});

      return {data, errors, warnings};
    };


    it('returns null when user file path is missing', () => {
      const data = readJson(fileName, null, {errors: [], warnings: []});
      expect(data).toBeNull();
    });

    it('returns data when user file is valid JSON', () => {
      const {data} = run('{"a":1}');
      expect(data).toEqual({a: 1});
    });

    it('should push to warnings when user file not found', () => {
      const {warnings} = run(null);
      const warning = warnings.find(w => w.name===ERROR_NAMES.FileNotFoundError);
      expect(warning).toBeDefined();
      expect(warning.meta.code).toBe(ERROR_CODES.USER_NOT_FOUND);
      expect(warning.meta.isCritical).toBe(false);
    });

    it('should push to errors when default file not found (critical)', () => {
      const errors: any[] = [];
      const warnings: any[] = [];

      readJson('test.json', '/fake/path', {
        isCritical: true,
        errors,
        warnings
      });

      const error = errors.find(w => w.name===ERROR_NAMES.FileNotFoundError);
      expect(error.meta.code).toBe(ERROR_CODES.DEFAULT_NOT_FOUND);
      expect(error.meta.isCritical).toBe(true);
    });

    it('should push to warnings when user file is empty', () => {
      const {warnings} = run('');
      const warning = warnings.find(w => w.name===ERROR_NAMES.EmptyFileError);
      expect(warning).toBeDefined();
      expect(warning.meta.code).toBe(ERROR_CODES.EMPTY_USER_FILE);
      expect(warning.meta.isCritical).toBe(false);
    });

    it('should push to warnings when user file is empty object', () => {
      const {warnings} = run('{}');
      const warning = warnings.find(w => w.name===ERROR_NAMES.EmptyObjectError);
      expect(warning).toBeDefined();
      expect(warning.meta.code).toBe(ERROR_CODES.EMPTY_USER_OBJECT);
      expect(warning.meta.isCritical).toBe(false);
    });

    it('should push to warnings when user file is invalid JSON', () => {
      const {warnings} = run('{bad json}');
      const warning = warnings.find(w => w.name===ERROR_NAMES.JsonParseError);
      expect(warning).toBeDefined();
      expect(warning.meta.code).toBe(ERROR_CODES.INVALID_JSON);
      expect(warning.meta.isCritical).toBe(false);
    });

    it('should push to errors when critical', () => {
      const {errors} = run('', true);
      const error = errors.find(w => w.name===ERROR_NAMES.EmptyFileError);
      expect(error).toBeDefined();
      expect(error.meta.code).toBe(ERROR_CODES.EMPTY_DEFAULT_FILE);
      expect(error.meta.isCritical).toBe(true);
    });

    it('should handle array JSON (edge case)', () => {
      const {data} = run('[1,2,3]');
      expect(data).toEqual([1,2,3]);
    });

    it('should not crash if options are undefined', () => {
      // @ts-ignore
      const data = readJson('test.json', '/fake/path', {});
      expect(data).toBeNull();
    });

  });
})
