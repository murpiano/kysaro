const {_resolveResources} = require('../resolve-resources');
const {ISSUE_SEVERITY} = require('../../../all/const/issue');
const {LOADER_ISSUE_CODE} = require('../../../all/const/loader');
const {LOAD_FILE_LOAD_SOURCE, LOAD_FILE_LOAD_STRATEGY} = require('../../../all/const/load-file');

describe('_resolveResources', () => {

  let loadFileBaseMock;

  beforeEach(() => {
    loadFileBaseMock = jest.fn();
  });

  test('should return empty result when config path is missing', () => {

    const result = _resolveResources({
      config: {},
      meta: {},
      strategy: LOAD_FILE_LOAD_STRATEGY.USER_FIRST,
      entity: 'settings',
      loadFileBase: loadFileBaseMock
    });

    expect(result).toEqual({
      ok: true,
      resources: {},
      issues: []
    });

    expect(loadFileBaseMock).not.toHaveBeenCalled();
  });

  test('should ignore config without fromFiles', () => {

    const result = _resolveResources({
      config: {
        enabled: true
      },
      meta: {
        resolvedPath: '/tmp/config.json'
      },
      strategy: LOAD_FILE_LOAD_STRATEGY.USER_FIRST,
      entity: 'settings',
      loadFileBase: loadFileBaseMock
    });

    expect(result.ok).toBe(true);
    expect(result.resources).toEqual({});
    expect(result.issues).toEqual([]);
  });

  test('should load single resource', () => {

    loadFileBaseMock.mockReturnValue({
      ok: true,
      data: {
        hello: 'world'
      },
      issues: []
    });

    const result = _resolveResources({
      config: {
        fromFiles: ['messages.json']
      },
      meta: {
        name: 'config.json',
        source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
        resolvedPath: '/tmp/config.json'
      },
      strategy: LOAD_FILE_LOAD_STRATEGY.USER_FIRST,
      entity: 'settings',
      loadFileBase: loadFileBaseMock
    });

    expect(result.ok).toBe(true);

    expect(result.resources).toEqual({
      messages: {
        hello: 'world'
      }
    });
  });

  test('should merge resources with same basename', () => {

    loadFileBaseMock
      .mockReturnValueOnce({
        ok: true,
        data: {a: 1},
        issues: []
      })
      .mockReturnValueOnce({
        ok: true,
        data: {b: 2},
        issues: []
      });

    const result = _resolveResources({
      config: {
        fromFiles: [
          'a/messages.json',
          'b/messages.json'
        ]
      },
      meta: {
        name: 'config.json',
        source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
        resolvedPath: '/tmp/config.json'
      },
      strategy: LOAD_FILE_LOAD_STRATEGY.USER_FIRST,
      entity: 'settings',
      loadFileBase: loadFileBaseMock
    });

    expect(result.resources).toEqual({
      messages: {
        a: 1,
        b: 2
      }
    });
  });

  test('should attach owner to child issues', () => {

    loadFileBaseMock.mockReturnValue({
      ok: false,
      data: null,
      issues: [
        {
          code: 'FILE_NOT_FOUND',
          meta: {}
        }
      ]
    });

    const result = _resolveResources({
      config: {
        fromFiles: ['messages.json']
      },
      meta: {
        name: 'settings.json',
        source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
        resolvedPath: '/tmp/config.json'
      },
      strategy: LOAD_FILE_LOAD_STRATEGY.USER_FIRST,
      entity: 'settings',
      loadFileBase: loadFileBaseMock
    });
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          meta: expect.objectContaining({
            owner: 'settings.json'
          })
        })
      ]))
  });

  test('should create dependency issue when resource loading fails', () => {

    loadFileBaseMock.mockReturnValue({
      ok: false,
      issues: [
        {
          code: 'FILE_NOT_FOUND',
          meta: {
            error: null
          }
        }
      ]
    });

    const result = _resolveResources({
      config: {
        fromFiles: ['messages.json']
      },
      meta: {
        name: 'settings.json',
        source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
        resolvedPath: '/tmp/config.json'
      },
      strategy: LOAD_FILE_LOAD_STRATEGY.USER_FIRST,
      entity: 'settings',
      loadFileBase: loadFileBaseMock
    });

    expect(result.ok).toBe(false);

    expect(
      result.issues.some(
        issue =>
          issue.code === LOADER_ISSUE_CODE.DEPENDENCY_LOAD_FAILED
      )
    ).toBe(true);
  });

  test('should use warning severity for user resource in USER_FIRST strategy', () => {

    loadFileBaseMock.mockReturnValue({
      ok: false,
      issues: [
        {
          code: 'FILE_NOT_FOUND',
          meta: {}
        }
      ]
    });

    const result = _resolveResources({
      config: {
        fromFiles: ['messages.json']
      },
      meta: {
        name: 'settings.json',
        source: LOAD_FILE_LOAD_SOURCE.USER,
        resolvedPath: '/tmp/config.json'
      },
      strategy: LOAD_FILE_LOAD_STRATEGY.USER_FIRST,
      entity: 'settings',
      loadFileBase: loadFileBaseMock
    });

    const dependencyIssue = result.issues.find(
      issue =>
        issue.code === LOADER_ISSUE_CODE.DEPENDENCY_LOAD_FAILED
    );

    expect(dependencyIssue.severity)
      .toBe(ISSUE_SEVERITY.WARNING);
  });

  test('should use error severity outside USER_FIRST strategy', () => {

    loadFileBaseMock.mockReturnValue({
      ok: false,
      issues: [
        {
          code: 'FILE_NOT_FOUND',
          meta: {}
        }
      ]
    });

    const result = _resolveResources({
      config: {
        fromFiles: ['messages.json']
      },
      meta: {
        name: 'settings.json',
        source: LOAD_FILE_LOAD_SOURCE.USER,
        resolvedPath: '/tmp/config.json'
      },
      strategy: LOAD_FILE_LOAD_STRATEGY.USER_ONLY,
      entity: 'settings',
      loadFileBase: loadFileBaseMock
    });

    const dependencyIssue = result.issues.find(
      issue =>
        issue.code === LOADER_ISSUE_CODE.DEPENDENCY_LOAD_FAILED
    );

    expect(dependencyIssue.severity)
      .toBe(ISSUE_SEVERITY.ERROR);
  });

});
