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
    commit('chore: initial commit');
  });

  afterEach(() => {
    log.mockRestore();
    fs.rmSync(cwd, {recursive: true, force: true});
  });

  test('should pass a range of valid commits', async () => {
    commit('feat: add colors');
    commit('fix(ui): repair palette');

    await expect(check('HEAD~2..HEAD')).resolves.toEqual({code: EXIT_CODE.OK, output: ''});
  });

  test('should report every invalid commit with its sha', async () => {
    commit('added stuff');
    commit('feat: add colors');
    commit('fix: Repair palette');

    const sha = git('rev-parse', '--short=7', 'HEAD~2');
    const {code, output} = await check('HEAD~3..HEAD');

    expect(code).toBe(EXIT_CODE.INVALID);
    expect(output).toContain(`Commit ${sha} is invalid`);
    expect(output).toContain('2 of 3 commit(s) are invalid');
  });

  test('should reject fixup commits', async () => {
    commit('feat: add colors');
    commit('fixup! feat: add colors');

    const {code, output} = await check('HEAD~2..HEAD');

    expect(code).toBe(EXIT_CODE.INVALID);
    expect(output).toContain('git rebase -i --autosquash');
  });

  test('should check merge commits with merge rules', async () => {
    git('checkout', '-q', '-b', 'feature');
    commit('feat: add colors');
    git('checkout', '-q', 'main');
    git('merge', '-q', '--no-ff', '--no-verify', '-m', "Merge branch 'feature'", 'feature');

    const invalid = await check('HEAD~1..HEAD');

    expect(invalid.code).toBe(EXIT_CODE.INVALID);
    expect(invalid.output).toContain('Header must match');

    git('reset', '-q', '--hard', 'HEAD~1');
    git('merge', '-q', '--no-ff', '--no-verify', '-m', `feat: add colors (#1)\n\n${MERGE_BODY}`, 'feature');

    await expect(check('HEAD~1..HEAD')).resolves.toEqual({code: EXIT_CODE.OK, output: ''});
  });

  test('should exit 2 for an invalid range', async () => {
    const {code, output} = await check('nope..HEAD');

    expect(code).toBe(EXIT_CODE.ERROR);
    expect(output).toContain('Invalid revision range');
  });
});

describe('kysaro ci', () => {

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

  const commit = (message: string) => {
    git('commit', '-q', '--allow-empty', '--no-verify', '-m', message);
    return git('rev-parse', 'HEAD');
  };

  const ci = async (eventName: string, event: object | null) => {
    const env: Record<string, string> = {};

    if (event) {
      const eventPath = path.join(cwd, '..', `${path.basename(cwd)}-event.json`);
      fs.writeFileSync(eventPath, JSON.stringify(event));
      Object.assign(env, {GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: eventName, GITHUB_EVENT_PATH: eventPath});
    }

    const io = {cwd, env, stdin: null, stdout: createStream(), stderr: createStream()};
    const code = await run(['ci'], io);

    return {code, output: io.stderr.output};
  };

  const DESCRIPTION = 'Adds a palette with dark and light themes and a switch in the header.';

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'kysaro-ci-'));
    log = jest.spyOn(console, 'log').mockImplementation(() => {});

    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'Test');
  });

  afterEach(() => {
    log.mockRestore();
    fs.rmSync(cwd, {recursive: true, force: true});
    fs.rmSync(`${cwd}-event.json`, {force: true});
  });

  test('should check pull request title, description and commits', async () => {
    const base = commit('chore: initial commit');
    commit('feat(ui): add palette');
    const head = commit('feat(ui): add theme switch');

    const pullRequest = (title: string, body: string) => ({
      pull_request: {number: 7, title, body, base: {sha: base}, head: {sha: head}}
    });

    await expect(ci('pull_request', pullRequest('feat(ui): add themes', DESCRIPTION)))
      .resolves.toEqual({code: EXIT_CODE.OK, output: ''});

    const invalid = await ci('pull_request', pullRequest('Add themes (#7)', 'short'));

    expect(invalid.code).toBe(EXIT_CODE.INVALID);
    expect(invalid.output).toContain('Pull request #7 is invalid');
    expect(invalid.output).toContain('Body is 5 characters long, minimum is 50');
  });

  test('should check commits of a pull request', async () => {
    const base = commit('chore: initial commit');
    const head = commit('wip');

    const {code, output} = await ci('pull_request', {
      pull_request: {number: 8, title: 'feat(ui): add themes', body: DESCRIPTION, base: {sha: base}, head: {sha: head}}
    });

    expect(code).toBe(EXIT_CODE.INVALID);
    expect(output).toContain('1 of 1 commit(s) are invalid');
  });

  test('should check commits of a push to an existing branch', async () => {
    const before = commit('broken old commit');
    const after = commit('feat: add colors');

    await expect(ci('push', {ref: 'refs/heads/main', before, after}))
      .resolves.toEqual({code: EXIT_CODE.OK, output: ''});
  });

  test('should check only new commits on the first push of a branch', async () => {
    commit('broken commit already on main');
    git('update-ref', 'refs/remotes/origin/main', 'HEAD');
    git('checkout', '-q', '-b', 'feature');
    commit('feat: add colors');
    const after = commit('bad');
    git('update-ref', 'refs/remotes/origin/feature', 'HEAD');

    const {code, output} = await ci('push', {
      ref: 'refs/heads/feature',
      before: '0000000000000000000000000000000000000000',
      after
    });

    expect(code).toBe(EXIT_CODE.INVALID);
    expect(output).toContain('1 of 2 commit(s) are invalid');
  });

  test('should skip tag pushes', async () => {
    const after = commit('bad');

    await expect(ci('push', {ref: 'refs/tags/v1.0.0', before: after, after}))
      .resolves.toEqual({code: EXIT_CODE.OK, output: ''});
  });

  test('should exit 2 outside GitHub Actions', async () => {
    const {code, output} = await ci('push', null);

    expect(code).toBe(EXIT_CODE.ERROR);
    expect(output).toContain('kysaro ci runs in GitHub Actions');
  });
});
