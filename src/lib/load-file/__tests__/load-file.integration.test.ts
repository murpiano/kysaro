const loadFileBase = require('../load-file-base');
const validateLoadedWithResources = require('../validate-loaded-with-resources');
const {_loadFile} = require('../load-file');
const {
  LOAD_FILE_LOAD_STRATEGY,
  LOAD_FILE_LOAD_SOURCE,
  LOAD_FILE_ISSUE_CODE } = require('../../../all/const/load-file');
const {LOADER_ENTITY} = require('../../../all/const/loader');


beforeEach(() => {
  jest.restoreAllMocks();
});


describe('_loadFile', () => {

  test('should return error when name is missing', () => {

    const result = _loadFile({
      defaultPath: '/default'
    });

    expect(result.ok)
      .toBe(false);

    expect(result.issues[0].code)
      .toBe(LOAD_FILE_ISSUE_CODE.MISSING_ARGUMENTS);
  });


  test('should return error for invalid strategy', () => {

    const result = _loadFile(
      {
        name: 'config.json',
        defaultPath: '/default'
      },
      'INVALID'
    );

    expect(result.ok)
      .toBe(false);

    expect(result.issues[0].code)
      .toBe(LOAD_FILE_ISSUE_CODE.INVALID_STRATEGY);
  });


  test('should load default file for DEFAULT_ONLY strategy', () => {

    const spy = jest
      .spyOn(loadFileBase, '_loadFileBase')
      .mockReturnValue({
        ok: true,
        data: {a: 1},
        resources: {},
        issues: [],
        source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
        meta: {
          resolvedPath: '/default/config.json'
        }
      });

    const result = _loadFile(
      {
        name: 'config.json',
        defaultPath: '/default'
      },
      LOAD_FILE_LOAD_STRATEGY.DEFAULT_ONLY
    );

    expect(spy)
      .toHaveBeenCalledTimes(1);

    expect(result.ok)
      .toBe(true);

    expect(result.data)
      .toEqual({a: 1});
  });


  test('should load user file for USER_ONLY strategy', () => {

    const spy = jest
      .spyOn(loadFileBase, '_loadFileBase')
      .mockReturnValue({
        ok: true,
        data: {user: true},
        resources: {},
        issues: [],
        source: LOAD_FILE_LOAD_SOURCE.USER,
        meta: {
          resolvedPath: '/user/config.json'
        }
      });

    const result = _loadFile(
      {
        name: 'config.json',
        userPath: '/user'
      },
      LOAD_FILE_LOAD_STRATEGY.USER_ONLY
    );

    expect(spy)
      .toHaveBeenCalledTimes(1);

    expect(result.data)
      .toEqual({user: true});
  });


  test('should return user config when USER_FIRST user load succeeds', () => {

    jest.spyOn(
      loadFileBase,
      '_loadFileBase'
    ).mockReturnValue({
      ok: true,
      data: {user: true},
      resources: {},
      issues: [],
      source: LOAD_FILE_LOAD_SOURCE.USER,
      meta: {
        resolvedPath: '/user/config.json'
      }
    });

    const result = _loadFile({
      name: 'config.json',
      defaultPath: '/default',
      userPath: '/user'
    });

    expect(result.data)
      .toEqual({user: true});

    expect(result.meta.source)
      .toBe(LOAD_FILE_LOAD_SOURCE.USER);
  });


  test('should fallback to default when user load fails', () => {

    const spy = jest
      .spyOn(loadFileBase, '_loadFileBase');

    spy
      .mockReturnValueOnce({
        ok: false,
        issues: [{code: 'USER_FAIL'}],
        source: LOAD_FILE_LOAD_SOURCE.USER,
        meta: {}
      })
      .mockReturnValueOnce({
        ok: true,
        data: {default: true},
        resources: {},
        issues: [],
        source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
        meta: {
          resolvedPath: '/default/config.json'
        }
      });

    const result = _loadFile({
      name: 'config.json',
      defaultPath: '/default',
      userPath: '/user'
    });

    expect(spy)
      .toHaveBeenCalledTimes(2);

    expect(result.data)
      .toEqual({default: true});

    expect(result.meta.source)
      .toBe(LOAD_FILE_LOAD_SOURCE.DEFAULT);
  });


  test('should validate resources for settings entity', () => {

    jest.spyOn(
      loadFileBase,
      '_loadFileBase'
    ).mockReturnValue({
      ok: true,
      data: {},
      resources: {},
      issues: [],
      source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
      meta: {
        resolvedPath: '/default/config.json'
      }
    });

    const validateSpy = jest
      .spyOn(
        validateLoadedWithResources,
        '_validateLoadedWithResources'
      )
      .mockReturnValue({
        ok: true,
        data: {},
        resources: {},
        issues: [],
        source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
        meta: {
          resolvedPath: '/default/config.json'
        }
      });

    _loadFile(
      {
        name: 'config.json',
        defaultPath: '/default',
        entity: LOADER_ENTITY.SETTINGS
      },
      LOAD_FILE_LOAD_STRATEGY.DEFAULT_ONLY
    );

    expect(validateSpy)
      .toHaveBeenCalledTimes(1);
  });


  test('should not validate resources for non settings entity', () => {

    jest.spyOn(
      loadFileBase,
      '_loadFileBase'
    ).mockReturnValue({
      ok: true,
      data: {},
      resources: {},
      issues: [],
      source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
      meta: {
        resolvedPath: '/default/config.json'
      }
    });

    const validateSpy = jest.spyOn(
      validateLoadedWithResources,
      '_validateLoadedWithResources'
    );

    _loadFile(
      {
        name: 'config.json',
        defaultPath: '/default',
        entity: LOADER_ENTITY.SCHEMA
      },
      LOAD_FILE_LOAD_STRATEGY.DEFAULT_ONLY
    );

    expect(validateSpy)
      .not.toHaveBeenCalled();
  });


  test('should calculate basedir from resolved path', () => {

    jest.spyOn(
      loadFileBase,
      '_loadFileBase'
    ).mockReturnValue({
      ok: true,
      data: {},
      resources: {},
      issues: [],
      source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
      meta: {
        resolvedPath: '/tmp/config/config.json'
      }
    });

    const result = _loadFile(
      {
        name: 'config.json',
        defaultPath: '/tmp/config'
      },
      LOAD_FILE_LOAD_STRATEGY.DEFAULT_ONLY
    );

    expect(result.meta.basedir)
      .toContain('config');
  });

  test('should return duplicate paths error', () => {

    jest.spyOn(
      loadFileBase,
      '_loadFileBase'
    ).mockReturnValue({
      ok: false,
      issues: [{code: 'FAIL'}],
      source: LOAD_FILE_LOAD_SOURCE.USER,
      meta: {}
    });

    const result = _loadFile({
      name: 'config.json',
      defaultPath: '/same',
      userPath: '/same'
    });

    expect(
      result.issues.some(
          (issue: { code: any; }) => issue.code === LOAD_FILE_ISSUE_CODE.DUPLICATE_PATHS
      )
    ).toBe(true);
  });

  test('should not validate resources when load failed', () => {

    jest.spyOn(
      loadFileBase,
      '_loadFileBase'
    ).mockReturnValue({
      ok: false,
      issues: [{code: 'FAIL'}],
      source: LOAD_FILE_LOAD_SOURCE.DEFAULT,
      meta: {}
    });

    const validateSpy = jest.spyOn(
      validateLoadedWithResources,
      '_validateLoadedWithResources'
    );

    _loadFile(
      {
        name: 'config.json',
        defaultPath: '/default'
      },
      LOAD_FILE_LOAD_STRATEGY.DEFAULT_ONLY
    );

    expect(validateSpy)
      .not.toHaveBeenCalled();
  });

  test('should use warning severity for user load in USER_FIRST', () => {

    const spy = jest
      .spyOn(loadFileBase, '_loadFileBase')
      .mockReturnValue({
        ok: true,
        data: {},
        resources: {},
        issues: [],
        source: LOAD_FILE_LOAD_SOURCE.USER,
        meta: {
          resolvedPath: '/user/config.json'
        }
      });

    _loadFile({
      name: 'config.json',
      defaultPath: '/default',
      userPath: '/user'
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'warning'
      })
    );
  });





});
