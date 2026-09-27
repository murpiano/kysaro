const fs = require('fs');
const os = require('os');
const path = require('path');
const {execFileSync} = require('child_process');

const {run, EXIT_CODE} = require('../index');

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

const MERGE_BODY = 'Merges the colors feature. It adds a palette and a dark theme switch.';

describe('kysaro --range', () => {

  let cwd: string;
  let log: jest.SpyInstance;
  const gitEnv: Record<string, string | undefined> = {};

  beforeAll(() => {
    Object.keys(process.env)
      .filter(key => key.startsWith('GIT_'))
      .forEach(key => {
        gitEnv[key] = process.env[key];
        delete process.env[key];
      });
  });

  afterAll(() => {
    Object.assign(process.env, gitEnv);
  });

  const git = (...args: string[]) =>
    execFileSync('git', args, {cwd, env: process.env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim();

  const commit = (message: string) => git('commit', '-q', '--allow-empty', '--no-verify', '-m', message);

  const check = async (range: string) => {
    const io = {cwd, stdin: null, stdout: createStream(), stderr: createStream()};
    const code = await run(['--range', range], io);

    return {code, output: io.stderr.output};
  };

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'kysaro-range-'));
    log = jest.spyOn(console, 'log').mockImplementation(() => {});

    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'Test');
    commit('chore: Initial commit');
  });

  afterEach(() => {
    log.mockRestore();
    fs.rmSync(cwd, {recursive: true, force: true});
  });

  test('should pass a range of valid commits', async () => {
    commit('feat: Add colors');
    commit('fix(ui): Repair palette');

    await expect(check('HEAD~2..HEAD')).resolves.toEqual({code: EXIT_CODE.OK, output: ''});
  });

  test('should report every invalid commit with its sha', async () => {
    commit('added stuff');
    commit('feat: Add colors');
    commit('fix: repair');

    const sha = git('rev-parse', '--short=7', 'HEAD~2');
    const {code, output} = await check('HEAD~3..HEAD');

    expect(code).toBe(EXIT_CODE.INVALID);
    expect(output).toContain(`Commit ${sha} is invalid`);
    expect(output).toContain('2 of 3 commit(s) are invalid');
  });

  test('should reject fixup commits', async () => {
    commit('feat: Add colors');
    commit('fixup! feat: Add colors');

    const {code, output} = await check('HEAD~2..HEAD');

    expect(code).toBe(EXIT_CODE.INVALID);
    expect(output).toContain('git rebase -i --autosquash');
  });

  test('should check merge commits with merge rules', async () => {
    git('checkout', '-q', '-b', 'feature');
    commit('feat: Add colors');
    git('checkout', '-q', 'main');
    git('merge', '-q', '--no-ff', '--no-verify', '-m', "Merge branch 'feature'", 'feature');

    const invalid = await check('HEAD~1..HEAD');

    expect(invalid.code).toBe(EXIT_CODE.INVALID);
    expect(invalid.output).toContain('Header must match');

    git('reset', '-q', '--hard', 'HEAD~1');
    git('merge', '-q', '--no-ff', '--no-verify', '-m', `feat: Add colors (#1)\n\n${MERGE_BODY}`, 'feature');

    await expect(check('HEAD~1..HEAD')).resolves.toEqual({code: EXIT_CODE.OK, output: ''});
  });

  test('should exit 2 for an invalid range', async () => {
    const {code, output} = await check('nope..HEAD');

    expect(code).toBe(EXIT_CODE.ERROR);
    expect(output).toContain('Invalid revision range');
  });
});
