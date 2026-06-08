const readJsonModule = require('../read-json');
const issueModule = require('../../issue');
const {_loadFileBase} = require('../load-file-base');

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('_loadFileBase', () => {

  test('should call readJson with file path and name', () => {

    const readJsonSpy = jest
      .spyOn(readJsonModule, '_readJson')
      .mockReturnValue({
        issues: [],
        meta: {}
      });

    _loadFileBase({
      source: 'USER',
      filePath: '/tmp/config.json',
      severity: 'warning',
      entity: 'settings',
      name: 'config.json'
    });

    expect(readJsonSpy)
      .toHaveBeenCalledWith(
        '/tmp/config.json',
        'config.json'
      );
  });

  test('should map every issue through mapLoaderIssueBySource', () => {

    jest.spyOn(readJsonModule, '_readJson')
      .mockReturnValue({
        issues: [
          {code: 'A'},
          {code: 'B'}
        ],
        meta: {}
      });

    const mapperSpy = jest
      .spyOn(issueModule, 'mapLoaderIssueBySource')
      .mockImplementation(v => v);

    _loadFileBase({
      source: 'USER',
      filePath: '/tmp/config.json',
      severity: 'warning',
      entity: 'settings',
      name: 'config.json'
    });

    expect(mapperSpy)
      .toHaveBeenCalledTimes(2);

    expect(mapperSpy)
      .toHaveBeenNthCalledWith(
        1,
        {
          issue: {code: 'A'},
          source: 'USER',
          severity: 'warning',
          entity: 'settings'
        }
      );

    expect(mapperSpy)
      .toHaveBeenNthCalledWith(
        2,
        {
          issue: {code: 'B'},
          source: 'USER',
          severity: 'warning',
          entity: 'settings'
        }
      );
  });

  test('should return mapped issues', () => {

    jest.spyOn(readJsonModule, '_readJson')
      .mockReturnValue({
        issues: [
          {code: 'RAW'}
        ],
        meta: {}
      });

    jest.spyOn(issueModule, 'mapLoaderIssueBySource')
      .mockReturnValue({
        code: 'MAPPED'
      });

    const result = _loadFileBase({
      source: 'USER',
      filePath: '/tmp/config.json',
      severity: 'warning',
      entity: 'settings',
      name: 'config.json'
    });

    expect(result.issues).toEqual([
      {code: 'MAPPED'}
    ]);
  });

  test('should append source to result', () => {

    jest.spyOn(readJsonModule, '_readJson')
      .mockReturnValue({
        issues: [],
        meta: {}
      });

    const result = _loadFileBase({
      source: 'USER',
      filePath: '/tmp/config.json',
      severity: 'warning',
      entity: 'settings',
      name: 'config.json'
    });

    expect(result.source)
      .toBe('USER');
  });

  test('should append source to meta', () => {

    jest.spyOn(readJsonModule, '_readJson')
      .mockReturnValue({
        issues: [],
        meta: {
          name: 'config.json'
        }
      });

    const result = _loadFileBase({
      source: 'USER',
      filePath: '/tmp/config.json',
      severity: 'warning',
      entity: 'settings',
      name: 'config.json'
    });

    expect(result.meta).toEqual({
      name: 'config.json',
      source: 'USER'
    });
  });

  test('should create meta when it is missing', () => {

    jest.spyOn(readJsonModule, '_readJson')
      .mockReturnValue({
        issues: []
      });

    const result = _loadFileBase({
      source: 'USER',
      filePath: '/tmp/config.json',
      severity: 'warning',
      entity: 'settings',
      name: 'config.json'
    });

    expect(result.meta).toEqual({
      source: 'USER'
    });
  });

  test('should preserve other loaded properties', () => {

    jest.spyOn(readJsonModule, '_readJson')
      .mockReturnValue({
        ok: true,
        data: {
          hello: 'world'
        },
        issues: [],
        meta: {}
      });

    const result = _loadFileBase({
      source: 'USER',
      filePath: '/tmp/config.json',
      severity: 'warning',
      entity: 'settings',
      name: 'config.json'
    });

    expect(result.ok)
      .toBe(true);

    expect(result.data).toEqual({
      hello: 'world'
    });
  });

});
