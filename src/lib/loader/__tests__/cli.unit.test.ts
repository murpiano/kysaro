
const logger =
  require('../../../all/helpers/logger');

const pathHelper =
  require('../../../all/helpers/path');

const {
  _cliShowResult,
  _CLI_MODE,
  _CLI_MESSAGE
} = require('../result/cli');

describe('_cliShowResult', () => {

  beforeEach(() => {
    jest.restoreAllMocks();

    jest.spyOn(logger, 'logError')
      .mockImplementation(() => {});

    jest.spyOn(logger, 'logWarn')
      .mockImplementation(() => {});

    jest.spyOn(logger, 'logSuccess')
      .mockImplementation(() => {});

    jest.spyOn(logger, 'logDetails')
      .mockImplementation(() => {});

    jest.spyOn(pathHelper, 'formatCliPath')
      .mockImplementation(path => `formatted:${path}`);
  });

  test('should do nothing when cli disabled', () => {

    _cliShowResult(
      {
        details: {
          commits: {
            hasIssues: true,
            hasCriticalIssues: true,
            reportPath: '/tmp/report.md'
          }
        }
      },
      {
        result: {
          cli: {
            enabled: false,
            mode: _CLI_MODE.ALWAYS
          }
        }
      }
    );

    expect(logger.logError)
      .not.toHaveBeenCalled();

    expect(logger.logWarn)
      .not.toHaveBeenCalled();

    expect(logger.logSuccess)
      .not.toHaveBeenCalled();
  });

  test('should do nothing in NEVER mode', () => {

    _cliShowResult(
      {
        details: {
          commits: {
            hasIssues: true,
            hasCriticalIssues: true,
            reportPath: '/tmp/report.md'
          }
        }
      },
      {
        result: {
          cli: {
            enabled: true,
            mode: _CLI_MODE.NEVER
          }
        }
      }
    );

    expect(logger.logError)
      .not.toHaveBeenCalled();
  });

  test('should show critical error and help path', () => {

    _cliShowResult(
      {
        details: {
          commits: {
            hasIssues: true,
            hasCriticalIssues: true,
            reportPath: '/tmp/report.md'
          }
        }
      },
      {
        result: {
          cli: {
            enabled: true,
            mode: _CLI_MODE.ALWAYS
          }
        }
      }
    );

    expect(logger.logError)
      .toHaveBeenCalledWith(
        `${_CLI_MESSAGE.SETTINGS_ERROR}. ${_CLI_MESSAGE.FIX_TO_PROCEED}`
      );

    expect(pathHelper.formatCliPath)
      .toHaveBeenCalledWith('/tmp/report.md');

    expect(logger.logDetails)
      .toHaveBeenCalledWith(
        'formatted:/tmp/report.md'
      );

    expect(logger.logWarn)
      .not.toHaveBeenCalled();
  });

  test('should show warning and help path', () => {

    _cliShowResult(
      {
        details: {
          commits: {
            hasIssues: true,
            hasCriticalIssues: false,
            reportPath: '/tmp/report.md'
          }
        }
      },
      {
        result: {
          cli: {
            enabled: true,
            mode: _CLI_MODE.ISSUES
          }
        }
      }
    );

    expect(logger.logWarn)
      .toHaveBeenCalledWith(
        _CLI_MESSAGE.SETTINGS_WARNING
      );

    expect(logger.logDetails)
      .toHaveBeenCalledWith(
        'formatted:/tmp/report.md'
      );

    expect(logger.logError)
      .not.toHaveBeenCalled();
  });

  test('should not show warning in CRITICAL mode', () => {

    _cliShowResult(
      {
        details: {
          commits: {
            hasIssues: true,
            hasCriticalIssues: false,
            reportPath: '/tmp/report.md'
          }
        }
      },
      {
        result: {
          cli: {
            enabled: true,
            mode: _CLI_MODE.CRITICAL
          }
        }
      }
    );

    expect(logger.logWarn)
      .not.toHaveBeenCalled();

    expect(logger.logDetails)
      .not.toHaveBeenCalled();
  });

  test('should show success in ALWAYS mode', () => {

    _cliShowResult(
      {
        details: {
          commits: {
            hasIssues: false,
            hasCriticalIssues: false,
            reportPath: '/tmp/report.md'
          }
        }
      },
      {
        result: {
          cli: {
            enabled: true,
            mode: _CLI_MODE.ALWAYS
          }
        }
      }
    );

    expect(logger.logSuccess)
      .toHaveBeenCalledWith(
        _CLI_MESSAGE.SETTINGS_SUCCESS
      );
  });

  test('should not show success in ISSUES mode', () => {

    _cliShowResult(
      {
        details: {
          commits: {
            hasIssues: false,
            hasCriticalIssues: false,
            reportPath: '/tmp/report.md'
          }
        }
      },
      {
        result: {
          cli: {
            enabled: true,
            mode: _CLI_MODE.ISSUES
          }
        }
      }
    );

    expect(logger.logSuccess)
      .not.toHaveBeenCalled();
  });

  test('should process multiple groups', () => {

    _cliShowResult(
      {
        details: {
          commits: {
            hasIssues: false,
            hasCriticalIssues: false,
            reportPath: '/a.md'
          },

          lint: {
            hasIssues: true,
            hasCriticalIssues: false,
            reportPath: '/b.md'
          }
        }
      },
      {
        result: {
          cli: {
            enabled: true,
            mode: _CLI_MODE.ALWAYS
          }
        }
      }
    );

    expect(logger.logSuccess)
      .toHaveBeenCalledTimes(1);

    expect(logger.logWarn)
      .toHaveBeenCalledTimes(1);
  });

});
