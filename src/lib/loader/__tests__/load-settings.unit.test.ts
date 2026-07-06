
const loadFileModule =
  require('../../load-file');

const {
  _loadSettings
} = require('../load-settings');

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('_loadSettings', () => {

  test('should return empty state when files are empty', () => {

    const result =
      _loadSettings(
        {},
        {}
      );

    expect(result).toEqual({
      groups: {},
      issues: []
    });
  });

  test('should create group containers', () => {

    jest.spyOn(loadFileModule, 'loadFile')
      .mockReturnValue({
        ok: true,
        issues: []
      });

    const result =
      _loadSettings(
        [
          {
            group: 'commits',
            name: 'commit',
            file: {},
            schema: {}
          }
        ],
        {
          files: {
            strategy: 'USER_FIRST'
          },
          schemas: {
            strategy: 'DEFAULT_ONLY'
          }
        }
      );

    expect(result.groups.commits)
      .toBeDefined();

    expect(result.groups.commits.settings)
      .toBeDefined();

    expect(result.groups.commits.schemas)
      .toBeDefined();
  });

  test('should load settings and schema', () => {

    const spy =
      jest.spyOn(loadFileModule, 'loadFile')
        .mockReturnValue({
          ok: true,
          issues: []
        });

    _loadSettings(
      [
        {
          group: 'commits',
          name: 'commit',
          file: {},
          schema: {}
        }
      ],
      {
        files: {
          strategy: 'USER_FIRST'
        },
        schemas: {
          strategy: 'DEFAULT_ONLY'
        }
      }
    );

    expect(spy)
      .toHaveBeenCalledTimes(2);
  });

  test('should store loaded settings result', () => {

    jest.spyOn(loadFileModule, 'loadFile')
      .mockReturnValue({
        ok: true,
        issues: []
      });

    const result =
      _loadSettings(
        [
          {
            group: 'commits',
            name: 'commit',
            file: {},
            schema: {}
          }
        ],
        {
          files: {
            strategy: 'USER_FIRST'
          },
          schemas: {
            strategy: 'DEFAULT_ONLY'
          }
        }
      );

    expect(
      result.groups.commits.settings.commit
    ).toBeDefined();
  });

  test('should store loaded schema result', () => {

    jest.spyOn(loadFileModule, 'loadFile')
      .mockReturnValue({
        ok: true,
        issues: []
      });

    const result =
      _loadSettings(
        [
          {
            group: 'commits',
            name: 'commit',
            file: {},
            schema: {}
          }
        ],
        {
          files: {
            strategy: 'USER_FIRST'
          },
          schemas: {
            strategy: 'DEFAULT_ONLY'
          }
        }
      );

    expect(
      result.groups.commits.schemas.commit
    ).toBeDefined();
  });

  test('should collect issues from settings and schema', () => {

    jest.spyOn(loadFileModule, 'loadFile')
      .mockReturnValue({
        ok: false,
        issues: [
          {code: 'ERROR'}
        ]
      });

    const result =
      _loadSettings(
        [
          {
            group: 'commits',
            name: 'commit',
            file: {},
            schema: {}
          }
        ],
        {
          files: {
            strategy: 'USER_FIRST'
          },
          schemas: {
            strategy: 'DEFAULT_ONLY'
          }
        }
      );

    expect(result.issues)
      .toHaveLength(2);
  });

  test('should support multiple files', () => {

    jest.spyOn(loadFileModule, 'loadFile')
      .mockReturnValue({
        ok: true,
        issues: []
      });

    const result =
      _loadSettings(
        [
          {
            group: 'commits',
            name: 'commit',
            file: {},
            schema: {}
          },
          {
            group: 'commits',
            name: 'lint',
            file: {},
            schema: {}
          }
        ],
        {
          files: {
            strategy: 'USER_FIRST'
          },
          schemas: {
            strategy: 'DEFAULT_ONLY'
          }
        }
      );

    expect(
      Object.keys(
        result.groups.commits.settings
      )
    ).toHaveLength(2);
  });

});
