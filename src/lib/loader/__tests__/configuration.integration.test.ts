const fs = require('fs');
const os = require('os');
const path = require('path');

const {createConfiguration} = require('../../../config');
const {runLoader} = require('../index');

describe('createConfiguration', () => {

  let cwd: string;

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'kysaro-config-'));
  });

  afterEach(() => {
    fs.rmSync(cwd, {recursive: true, force: true});
  });

  test('should skip user settings and reports when .kysaro is absent', () => {
    const configuration = createConfiguration(cwd);

    expect(configuration.settingsDir.user).toBeNull();
    expect(configuration.reportDir).toBeNull();
  });

  test('should use .kysaro directories when they exist', () => {
    fs.mkdirSync(path.join(cwd, '.kysaro', 'settings'), {recursive: true});

    const configuration = createConfiguration(cwd);

    expect(configuration.settingsDir.user).toBe(path.join(cwd, '.kysaro', 'settings'));
    expect(configuration.reportDir).toBe(path.join(cwd, '.kysaro'));
  });

  test('should load defaults silently without .kysaro', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});

    const loaded = runLoader(createConfiguration(cwd));

    expect(loaded.ok).toBe(true);
    expect(loaded.reports.issues.filter((issue: any) => issue.severity)).toEqual([]);
    expect(loaded.settings.commits.commit.header.format).toBe('type(scope): subject');
    expect(log).not.toHaveBeenCalled();
    expect(fs.readdirSync(cwd)).toEqual([]);

    log.mockRestore();
  });

  test('should not warn about user files that are absent', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mainDir = path.join(cwd, '.kysaro', 'settings', 'main');
    const main = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../settings/main/main.json'), 'utf8'));

    delete main.$schema;
    main.validator.severity = 'warning';
    fs.mkdirSync(mainDir, {recursive: true});
    fs.writeFileSync(path.join(mainDir, 'main.json'), JSON.stringify(main));

    const loaded = runLoader(createConfiguration(cwd));

    expect(loaded.ok).toBe(true);
    expect(loaded.settings.main.main.validator.severity).toBe('warning');
    expect(loaded.reports.issues.filter((issue: any) => issue.severity)).toEqual([]);
    expect(log).not.toHaveBeenCalled();

    log.mockRestore();
  });
});
