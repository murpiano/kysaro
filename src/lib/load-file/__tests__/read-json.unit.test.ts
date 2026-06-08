const fs = require('fs');
const os = require('os');
const path = require('path');

const {_readJson} = require('../read-json');
const {LOAD_FILE_ISSUE_CODE} = require('../../../all/const/load-file');

describe('_readJson', () => {

  let tempDir = '';

  beforeEach(() => {
    tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'read-json-test-')
    );
  });

  afterEach(() => {
    fs.rmSync(tempDir, {
      recursive: true,
      force: true
    });
  });

  function createFile(name, content) {
    const filePath = path.join(tempDir, name);

    fs.writeFileSync(filePath, content, 'utf8');

    return filePath;
  }


  describe('SUCCESS', () => {

    test('should load valid json object', () => {
      const filePath = createFile(
        'config.json',
        JSON.stringify({
          enabled: true,
          version: 1
        })
      );

      const result = _readJson(filePath);

      expect(result.ok).toBe(true);
      expect(result.data).toEqual({
        enabled: true,
        version: 1
      });

      expect(result.issues).toEqual([]);

      expect(result.meta).toEqual({
        name: 'config.json',
        requestedPath: filePath,
        resolvedPath: filePath
      });
    });

    test('should use projestded name', () => {
      const filePath = createFile(
        'config.json',
        JSON.stringify({
          enabled: true
        })
      );

      const result = _readJson(
        filePath,
        'settings'
      );

      expect(result.ok).toBe(true);
      expect(result.meta.name)
        .toBe('settings');
    });

  });

  describe('PATH_MISSING', () => {

    test('should fail when filePath is not projestded', () => {
      const result = _readJson(null, null);

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: LOAD_FILE_ISSUE_CODE.PATH_MISSING
          })
        ]))
    });

  });

  describe('FILE_NOT_FOUND', () => {

    test('should fail when file does not exist', () => {
      const filePath = path.join(
        tempDir,
        'missing.json'
      );

      const result = _readJson(filePath);

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: LOAD_FILE_ISSUE_CODE.FILE_NOT_FOUND
          })
        ]))
    });

  });

  describe('EMPTY_FILE', () => {

    test('should fail when file is empty', () => {
      const filePath = createFile(
        'config.json',
        ''
      );

      const result = _readJson(filePath);

      expect(result.ok).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: LOAD_FILE_ISSUE_CODE.EMPTY_FILE
          })
        ]))
    });

    test('should fail when file contains only whitespace', () => {
      const filePath = createFile(
        'config.json',
        '   \n\t   '
      );

      const result = _readJson(filePath);

      expect(result.ok).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: LOAD_FILE_ISSUE_CODE.EMPTY_FILE
          })
        ]))
    });

  });

  describe('INVALID_JSON', () => {

    test('should fail when json is invalid', () => {
      const filePath = createFile(
        'config.json',
        '{invalid'
      );

      const result = _readJson(filePath);

      expect(result.ok).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: LOAD_FILE_ISSUE_CODE.INVALID_JSON
          })
        ]))
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            meta: expect.objectContaining({
              error: expect.any(Error)
            })
          })
        ]))

    });

  });

  describe('EMPTY_OBJECT', () => {

    test('should fail when root is null', () => {
      const filePath = createFile(
        'config.json',
        'null'
      );

      const result = _readJson(filePath);

      expect(result.ok).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: LOAD_FILE_ISSUE_CODE.EMPTY_OBJECT
          })
        ]))
    });

    test('should fail when root is array', () => {
      const filePath = createFile(
        'config.json',
        '[]'
      );

      const result = _readJson(filePath);

      expect(result.ok).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: LOAD_FILE_ISSUE_CODE.EMPTY_OBJECT
          })
        ]))
    });

    test('should fail when object is empty', () => {
      const filePath = createFile(
        'config.json',
        '{}'
      );

      const result = _readJson(filePath);

      expect(result.ok).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: LOAD_FILE_ISSUE_CODE.EMPTY_OBJECT
          })
        ]))
    });

  });


});
