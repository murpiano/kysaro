
const normalizeFiles =
  require('../normalize-input-files');

const loadSettings =
  require('../load-settings');

const validateSettings =
  require('../validate-settings');

const validationIssues =
  require('../check-validation-issues');

const outputSettings =
  require('../normalize-output-settings');

const report =
  require('../result/report/report');

const cli =
  require('../result/cli');

const {
  _runLoader
} = require('../loader');

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('_runLoader', () => {

  test('should run full loading pipeline', () => {

    jest.spyOn(
      normalizeFiles,
      '_normalizeFiles'
    ).mockReturnValue([
      {name: 'commit'}
    ]);

    const state = {
      groups: {
        commits: {
          settings: {
            commit: {
              data: {
                enabled: true
              }
            }
          },

          schemas: {
            commit: {
              data: {
                type: 'object'
              }
            }
          },

          validators: {},
          validations: {}
        }
      },

      issues: []
    };

    jest.spyOn(
      loadSettings,
      '_loadSettings'
    ).mockReturnValue(state);

    jest.spyOn(
      validateSettings,
      '_generateValidator'
    ).mockReturnValue({
      ok: true,
      data: jest.fn(),
      issues: []
    });

    jest.spyOn(
      validateSettings,
      '_validateSettings'
    ).mockReturnValue({
      ok: true,
      issues: []
    });

    jest.spyOn(
      validationIssues,
      '_checkValidationIssues'
    ).mockReturnValue({
      ok: true,
      hasIssues: false,
      hasCriticalIssues: false
    });

    jest.spyOn(
      outputSettings,
      '_normalizeOutputSettings'
    ).mockReturnValue({
      commits: {}
    });

    const reportSpy = jest
      .spyOn(report, '_createMdReport')
      .mockImplementation(() => {});

    const cliSpy = jest
      .spyOn(cli, '_cliShowResult')
      .mockImplementation(() => {});

    const result = _runLoader(
      {
        settingsGroups: {}
      }
    );

    expect(result.ok)
      .toBe(true);

    expect(result.settings)
      .toEqual({
        commits: {}
      });

    expect(reportSpy)
      .toHaveBeenCalled();

    expect(cliSpy)
      .toHaveBeenCalled();

  });

  test('should collect validator issues', () => {

    jest.spyOn(
      normalizeFiles,
      '_normalizeFiles'
    ).mockReturnValue([]);

    const state = {
      groups: {
        commits: {
          settings: {},
          schemas: {
            test: {
              data: {}
            }
          },
          validators: {},
          validations: {}
        }
      },
      issues: []
    };

    jest.spyOn(
      loadSettings,
      '_loadSettings'
    ).mockReturnValue(state);

    jest.spyOn(
      validateSettings,
      '_generateValidator'
    ).mockReturnValue({
      ok: false,
      issues: [
        {code: 'SCHEMA_INVALID'}
      ]
    });

    jest.spyOn(
      validateSettings,
      '_validateSettings'
    ).mockReturnValue({
      ok: true,
      issues: []
    });

    jest.spyOn(
      validationIssues,
      '_checkValidationIssues'
    ).mockReturnValue({
      ok: false
    });

    jest.spyOn(
      outputSettings,
      '_normalizeOutputSettings'
    ).mockReturnValue({});

    jest.spyOn(
      report,
      '_createMdReport'
    ).mockImplementation(() => {});

    jest.spyOn(
      cli,
      '_cliShowResult'
    ).mockImplementation(() => {});

    const result = _runLoader({
      settingsGroups: {}
    });

    expect(result.reports.issues)
      .toContainEqual({
        code: 'SCHEMA_INVALID'
      });

  });

});
