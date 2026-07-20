const path = require('path');

const {
  _normalizeFiles
} = require('../normalize-input-files');

describe('_normalizeFiles', () => {

  test('should return empty array when no groups exist', () => {

    const result = _normalizeFiles(
      {
        settingsGroups: {}
      },
      {}
    );

    expect(result).toEqual([]);
  });

  test('should create file and schema entries', () => {

    const result = _normalizeFiles(
      {
        settingsDir: {
          default: '/default',
          user: '/user'
        },

        settingsGroups: {
          commits: [
            'commit'
          ]
        }
      },
      {
        files: {
          specialDir: {
            default: 'settings',
            user: 'settings'
          }
        },

        schemas: {
          specialDir: {
            default: 'schemas'
          }
        }
      }
    );

    expect(result).toEqual([
      {
        group: 'commits',
        name: 'commit',

        file: {
          name: 'commit.json',
          defaultPath: path.join('/default', 'commits', 'settings'),
          userPath: path.join('/user', 'commits', 'settings')
        },

        schema: {
          name: 'commit.schema.json',
          defaultPath: path.join('/default', 'schemas')
        }
      }
    ]);
  });

  test('should create entries for multiple groups', () => {

    const result = _normalizeFiles(
      {
        settingsDir: {
          default: '/default',
          user: '/user'
        },

        settingsGroups: {
          commits: ['commit'],
          branch: ['naming']
        }
      },
      {
        files: {
          specialDir: {
            default: 'settings',
            user: 'settings'
          }
        },

        schemas: {
          specialDir: {
            default: 'schemas'
          }
        }
      }
    );

    expect(result).toHaveLength(2);

    expect(result[0].group)
      .toBe('commits');

    expect(result[1].group)
      .toBe('branch');
  });

  test('should create entries for multiple settings in group', () => {

    const result = _normalizeFiles(
      {
        settingsDir: {
          default: '/default',
          user: '/user'
        },

        settingsGroups: {
          commits: [
            'commit',
            'lint'
          ]
        }
      },
      {
        files: {
          specialDir: {
            default: 'settings',
            user: 'settings'
          }
        },

        schemas: {
          specialDir: {
            default: 'schemas'
          }
        }
      }
    );

    expect(result).toHaveLength(2);

    expect(result[0].name)
      .toBe('commit');

    expect(result[1].name)
      .toBe('lint');
  });

  test('should build expected file names', () => {

    const result = _normalizeFiles(
      {
        settingsDir: {
          default: '/default',
          user: '/user'
        },

        settingsGroups: {
          commits: ['header']
        }
      },
      {
        files: {
          specialDir: {
            default: 'settings',
            user: 'settings'
          }
        },

        schemas: {
          specialDir: {
            default: 'schemas'
          }
        }
      }
    );

    expect(result[0].file.name)
      .toBe('header.json');

    expect(result[0].schema.name)
      .toBe('header.schema.json');
  });

});
