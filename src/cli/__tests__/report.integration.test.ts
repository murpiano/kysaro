const fs = require('fs');
const os = require('os');
const path = require('path');

const {run, EXIT_CODE} = require('../index');
const {buildReport, REPORT_MODE} = require('../report');
const {lint, COMMIT_TYPE} = require('../../index');

function createStream() {
  const stream = {
    output: '',
    write(chunk: string) {
      stream.output += chunk;
      return true;
    }
  };

  return stream;
}

describe('check report', () => {

  let cwd: string;
  let log: jest.SpyInstance;

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'kysaro-report-'));
    log = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    log.mockRestore();
    fs.rmSync(cwd, {recursive: true, force: true});
  });

  const io = (env: Record<string, string> = {}) =>
    ({cwd, env, stdin: null, stdout: createStream(), stderr: createStream()});

  test('should list problems, suggested message and fix commands', () => {
    const result = lint('feat(UI): add colors.\n\nBody text', {type: COMMIT_TYPE.COMMIT, cwd});
    const report = buildReport([{label: 'Commit message', result}], {mode: REPORT_MODE.HOOK, cwd});

    expect(report).toContain('## ✖ Commit message — invalid');
    expect(report).toContain('| 1 | header.scope | Scope "UI" must be in lower case | `SCOPE_CASE` |');
    expect(report).toContain('### Write it like this\n\n```text\nfeat(ui): add colors\n\nBody text\n```');
    expect(report).toContain('git commit -e -F .git/COMMIT_EDITMSG');
    expect(report).toContain('Kind: commit · Rules: package default `commit.json`');
  });

  test('should count messages only when many are checked', () => {
    const one = lint('feat(UI): add colors', {type: COMMIT_TYPE.COMMIT, cwd});
    const single = buildReport([{label: 'Commit message', result: one}], {mode: REPORT_MODE.HOOK, cwd});
    const many = buildReport([
      {label: 'Commit 1a2b3c4', result: one},
      {label: 'Commit 5d6e7f8', result: one}
    ], {mode: REPORT_MODE.RANGE, cwd});

    expect(single).not.toContain('message(s)');
    expect(many).toContain('✖ 2 of 2 message(s) are invalid');
  });

  test('should point at the header part that has the problem', () => {
    const result = lint('feat(UI): add colors', {type: COMMIT_TYPE.COMMIT, cwd});
    const report = buildReport([{label: 'Commit message', result}], {mode: REPORT_MODE.HOOK, cwd});

    expect(report).toContain('```text\nfeat(UI): add colors\n     ^^\n```');
  });

  test('should explain how to fix a merge commit', () => {
    const result = lint("Merge branch 'feature'", {type: COMMIT_TYPE.MERGE, cwd});
    const report = buildReport([{label: 'Commit message', result}], {mode: REPORT_MODE.HOOK, cwd});

    expect(report).toContain('git pull --rebase');
  });

  test('should write .kysaro/report.md when .kysaro exists', async () => {
    fs.mkdirSync(path.join(cwd, '.kysaro'));
    fs.writeFileSync(path.join(cwd, 'MSG'), 'bad message\n');
    const streams = io();

    await expect(run(['MSG', '--type', 'commit'], streams)).resolves.toBe(EXIT_CODE.INVALID);

    expect(streams.stderr.output).toContain(`How to fix: ${path.join('.kysaro', 'report.md')}`);
    expect(fs.readFileSync(path.join(cwd, '.kysaro', 'report.md'), 'utf8')).toContain('`HEADER_FORMAT`');

    await run(['-m', 'feat: add colors', '--type', 'commit'], io());

    expect(fs.readFileSync(path.join(cwd, '.kysaro', 'report.md'), 'utf8')).toContain('✔ Commit message — valid');
  });

  test('should print one line in the terminal when the hook wrote a report', async () => {
    fs.mkdirSync(path.join(cwd, '.kysaro'));
    fs.writeFileSync(path.join(cwd, 'MSG'), 'feat: Add colors\n');
    const streams = io();

    await expect(run(['MSG', '--type', 'commit'], streams)).resolves.toBe(EXIT_CODE.INVALID);

    expect(streams.stderr.output).toBe(
      '[kysaro] ✖ Commit message is invalid\n'
      + `[kysaro] How to fix: ${path.join('.kysaro', 'report.md')}\n`
    );
  });

  test('should print every problem when no report was written', async () => {
    fs.writeFileSync(path.join(cwd, 'MSG'), 'feat: Add colors\n');
    const streams = io();

    await expect(run(['MSG', '--type', 'commit'], streams)).resolves.toBe(EXIT_CODE.INVALID);

    expect(streams.stderr.output).toContain('Suggested header: feat: add colors');
  });

  test('should not create .kysaro', async () => {
    await run(['-m', 'bad', '--type', 'commit'], io());

    expect(fs.existsSync(path.join(cwd, '.kysaro'))).toBe(false);
  });

  test('should append the report to the GitHub job summary', async () => {
    const summary = path.join(cwd, 'summary.md');

    await run(['-m', 'bad', '--type', 'commit'], io({GITHUB_STEP_SUMMARY: summary}));

    expect(fs.readFileSync(summary, 'utf8')).toContain('# Kysaro report');
  });
});
