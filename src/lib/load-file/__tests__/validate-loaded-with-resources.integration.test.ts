const resourcesModule = require('../resolve-resources');
const { _validateLoadedWithResources } = require('../validate-loaded-with-resources');

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('_validateLoadedWithResources', () => {

  test('should call resolveResources with correct arguments', () => {

    const spy = jest
      .spyOn(resourcesModule, '_resolveResources')
      .mockReturnValue({
        resources: {},
        issues: []
      });

    const loaded = {
      data: {hello: 'world'},
      meta: {name: 'config.json'},
      issues: [],
      ok: true
    };

    _validateLoadedWithResources(
      loaded,
      'USER_FIRST',
      'settings'
    );

    expect(spy).toHaveBeenCalledWith({
      config: loaded.data,
      meta: loaded.meta,
      strategy: 'USER_FIRST',
      entity: 'settings'
    });
  });

  test('should append resolved resources', () => {

    jest.spyOn(
      resourcesModule,
      '_resolveResources'
    ).mockReturnValue({
      resources: {
        messages: {
          hello: 'world'
        }
      },
      issues: []
    });

    const result =
      _validateLoadedWithResources(
        {
          data: {},
          meta: {},
          issues: [],
          ok: true
        },
        'USER_FIRST',
        'settings'
      );

    expect(result.resources).toEqual({
      messages: {
        hello: 'world'
      }
    });
  });

  test('should append dependency issues', () => {

    const dependencyIssue = {
      code: 'DEPENDENCY_LOAD_FAILED',
      severity: 'warning'
    };

    jest.spyOn(
      resourcesModule,
      '_resolveResources'
    ).mockReturnValue({
      resources: {},
      issues: [dependencyIssue]
    });

    const result =
      _validateLoadedWithResources(
        {
          data: {},
          meta: {},
          issues: [],
          ok: true
        },
        'USER_FIRST',
        'settings'
      );

    expect(result.issues).toContain(
      dependencyIssue
    );
  });

  test('should preserve existing issues', () => {

    const existingIssue = {
      code: 'CONFIG_INVALID'
    };

    const dependencyIssue = {
      code: 'DEPENDENCY_LOAD_FAILED'
    };

    jest.spyOn(
      resourcesModule,
      '_resolveResources'
    ).mockReturnValue({
      resources: {},
      issues: [dependencyIssue]
    });

    const result =
      _validateLoadedWithResources(
        {
          data: {},
          meta: {},
          issues: [existingIssue],
          ok: true
        },
        'USER_FIRST',
        'settings'
      );

    expect(result.issues).toEqual([
      existingIssue,
      dependencyIssue
    ]);
  });

  test('should set ok to true when no error issues exist', () => {

    jest.spyOn(
      resourcesModule,
      '_resolveResources'
    ).mockReturnValue({
      resources: {},
      issues: [
        {severity: 'warning'}
      ]
    });

    const result =
      _validateLoadedWithResources(
        {
          data: {},
          meta: {},
          issues: [],
          ok: true
        },
        'USER_FIRST',
        'settings'
      );

    expect(result.ok).toBe(true);
  });

  test('should set ok to false when error issue exists', () => {

    jest.spyOn(
      resourcesModule,
      '_resolveResources'
    ).mockReturnValue({
      resources: {},
      issues: [
        {severity: 'warning'},
        {severity: 'error'}
      ]
    });

    const result =
      _validateLoadedWithResources(
        {
          data: {},
          meta: {},
          issues: [],
          ok: true
        },
        'USER_FIRST',
        'settings'
      );

    expect(result.ok).toBe(false);
  });

  test('should not mutate original loaded object reference', () => {

    jest.spyOn(
      resourcesModule,
      '_resolveResources'
    ).mockReturnValue({
      resources: {},
      issues: []
    });

    const loaded = {
      data: {},
      meta: {},
      issues: [],
      ok: true
    };

    const result =
      _validateLoadedWithResources(
        loaded,
        'USER_FIRST',
        'settings'
      );

    expect(result).not.toBe(loaded);
  });

});
