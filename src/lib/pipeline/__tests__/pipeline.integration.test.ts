const fs = require('fs');
const os = require('os');
const path = require('path');

const {lint, KysaroException, COMMIT_TYPE} = require('../../../index');

const DEFAULT_SETTINGS = path.resolve(__dirname, '../../../settings');

function copySettings(cwd: string) {
  const target = path.join(cwd, '.kysaro', 'settings');

  fs.cpSync(DEFAULT_SETTINGS, target, {
    recursive: true,
    filter: (source: string) => !source.includes(`${path.sep}schemas`) && !source.endsWith('.js') && !source.endsWith('.ts')
  });

  fs.readdirSync(target, {recursive: true})
    .filter((file: string) => file.endsWith('.json'))
    .forEach((file: string) => {
      const filePath = path.join(target, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      delete data.$schema;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    });

  return target;
}

function editSettings(cwd: string, file: string, edit: (data: any) => void) {
  const filePath = path.join(cwd, '.kysaro', 'settings', file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  edit(data);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

describe('lint', () => {

  let cwd: string;
  let log: jest.SpyInstance;

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'kysaro-pipeline-'));
    log = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    log.mockRestore();
    fs.rmSync(cwd, {recursive: true, force: true});
  });

  const check = (message: string, options: any = {}) =>
    lint(message, {type: COMMIT_TYPE.COMMIT, cwd, ...options});

  test('should accept a valid message with package defaults', () => {
    const result = check('feat(cli): Add init command\n\nExplain the change.\n\nRefs: #1\n');

    expect(result.status).toBe('valid');
    expect(result.issues).toEqual([]);
    expect(result.parsed.ast.header.type).toBe('feat');
  });

  test('should reject an invalid message', () => {
    const result = check('Added stuff');

    expect(result.status).toBe('invalid');
    expect(result.issues.map((issue: any) => issue.code)).toContain('HEADER_FORMAT');
  });

  test('should validate the normalized message', () => {
    const result = check('\n\nfeat: Add colors   \n# comment\n\n\n');

    expect(result.status).toBe('valid');
    expect(result.final).toBe('feat: Add colors\n');
  });

  test('should reject an empty message', () => {
    const result = check('# only a comment\n');

    expect(result.status).toBe('invalid');
    expect(result.issues.map((issue: any) => issue.code)).toEqual(['MESSAGE_IS_EMPTY']);
  });

  test.each([
    ['Revert "feat: Add colors"'],
    ['fixup! feat: Add colors']
  ])('should ignore "%s"', (message) => {
    const result = check(message);

    expect(result.status).toBe('ignored');
    expect(result.ignored).toBe(true);
  });

  test('should reject the default git merge message', () => {
    const result = check("Merge branch 'main' into feature", {type: COMMIT_TYPE.MERGE});

    expect(result.status).toBe('invalid');
    expect(result.issues.map((issue: any) => issue.code)).toContain('HEADER_FORMAT');
  });

  test('should apply merge.json to merge commits', () => {
    const header = 'feat(cli): Add init command (#12)';

    expect(check(header, {type: COMMIT_TYPE.MERGE}).issues.map((issue: any) => issue.code)).toEqual(['BODY_REQUIRED']);

    const result = check(`${header}\n\n${'Adds the init command that installs the hook. '.repeat(2)}`, {type: COMMIT_TYPE.MERGE});

    expect(result.status).toBe('valid');
    expect(result.rules).toBe('merge');
    expect(result.kind).toBe(COMMIT_TYPE.MERGE);
  });

  test('should apply request.json to pull requests', () => {
    const description = 'This pull request adds the init command. It installs the hook and copies settings.';
    const result = check(`feat(cli): Add init command (#12)\n\n${description}`, {type: COMMIT_TYPE.REQUEST});

    expect(result.rules).toBe('request');
    expect(result.issues.map((issue: any) => issue.code)).toEqual(['HEADER_REFERENCE_FORBIDDEN']);
    expect(check('feat(cli): Add init command\n\nToo short', {type: COMMIT_TYPE.REQUEST}).issues.map((issue: any) => issue.code))
      .toEqual(['BODY_TOO_SHORT']);
  });

  test('should ignore merge commits when merge is in ignore.kinds', () => {
    copySettings(cwd);
    editSettings(cwd, 'main/main.json', data => {
      data.ignore.kinds = ['merge'];
    });

    expect(check('whatever', {type: COMMIT_TYPE.MERGE}).status).toBe('ignored');
  });

  test('should apply user settings from .kysaro/settings', () => {
    copySettings(cwd);
    editSettings(cwd, 'commits/commit.json', data => {
      data.header.scope.required = true;
    });

    const result = check('feat: Add colors');

    expect(result.issues.map((issue: any) => issue.code)).toEqual(['SCOPE_REQUIRED']);
  });

  test('should report warnings without failing', () => {
    copySettings(cwd);
    editSettings(cwd, 'main/main.json', data => {
      data.validator.severity = 'warning';
    });

    const result = check('feat: add colors');

    expect(result.status).toBe('valid');
    expect(result.issues).toEqual([expect.objectContaining({code: 'SUBJECT_CASE', severity: 'warning'})]);
  });

  test('should throw KysaroException in throw mode', () => {
    copySettings(cwd);
    editSettings(cwd, 'main/main.json', data => {
      data.output.invalid = 'throw';
    });

    expect(() => check('bad')).toThrow(KysaroException);
  });

  test('should fall back to defaults when user settings are invalid', () => {
    copySettings(cwd);
    fs.writeFileSync(path.join(cwd, '.kysaro', 'settings', 'commits', 'commit.json'), '{ broken');

    const result = check('feat: Add colors');

    expect(result.status).toBe('valid');
  });
});
