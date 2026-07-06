
const {
  _normalizeOutputSettings
} = require('../normalize-output-settings');

describe('_normalizeOutputSettings', () => {

  test('should return empty object for empty groups', () => {

    const result = _normalizeOutputSettings({
      groups: {}
    });

    expect(result).toEqual({});
  });

  test('should normalize single setting', () => {

    const state = {
      groups: {
        commits: {
          settings: {
            commit: {
              data: {
                title: 'Title',
                enabled: true
              },
              resources: {}
            }
          }
        }
      }
    };

    const result =
      _normalizeOutputSettings(state);

    expect(result).toEqual({
      commits: {
        commit: {
          enabled: true,
          resources: {}
        }
      }
    });
  });

  test('should strip runtime fields from setting data', () => {

    const state = {
      groups: {
        commits: {
          settings: {
            commit: {
              data: {
                $schema: 'schema.json',
                title: 'Title',
                description: 'Description',
                preset: 'recommended',
                enabled: true
              },
              resources: {}
            }
          }
        }
      }
    };

    const result =
      _normalizeOutputSettings(state);

    expect(result).toEqual({
      commits: {
        commit: {
          enabled: true,
          resources: {}
        }
      }
    });
  });

  test('should strip runtime fields from resources', () => {

    const state = {
      groups: {
        commits: {
          settings: {
            commit: {
              data: {
                enabled: true
              },
              resources: {
                types: {
                  title: 'Types',
                  values: ['feat', 'fix']
                }
              }
            }
          }
        }
      }
    };

    const result =
      _normalizeOutputSettings(state);

    expect(result).toEqual({
      commits: {
        commit: {
          enabled: true,
          resources: {
            types: {
              values: ['feat', 'fix']
            }
          }
        }
      }
    });
  });

  test('should process multiple groups', () => {

    const state = {
      groups: {
        commits: {
          settings: {
            commit: {
              data: {
                enabled: true
              },
              resources: {}
            }
          }
        },

        branch: {
          settings: {
            naming: {
              data: {
                pattern: 'feature/*'
              },
              resources: {}
            }
          }
        }
      }
    };

    const result =
      _normalizeOutputSettings(state);

    expect(result).toEqual({
      commits: {
        commit: {
          enabled: true,
          resources: {}
        }
      },

      branch: {
        naming: {
          pattern: 'feature/*',
          resources: {}
        }
      }
    });
  });

  test('should process multiple settings in group', () => {

    const state = {
      groups: {
        commits: {
          settings: {
            commit: {
              data: {
                enabled: true
              },
              resources: {}
            },

            lint: {
              data: {
                strict: true
              },
              resources: {}
            }
          }
        }
      }
    };

    const result =
      _normalizeOutputSettings(state);

    expect(result).toEqual({
      commits: {
        commit: {
          enabled: true,
          resources: {}
        },

        lint: {
          strict: true,
          resources: {}
        }
      }
    });
  });

});
