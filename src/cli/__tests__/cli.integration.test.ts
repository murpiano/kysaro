const fs = require('fs');
const os = require('os');
const path = require('path');
const {execFileSync} = require('child_process');
const {Readable} = require('stream');

const {run, EXIT_CODE} = require('../index');
const {HOOK_COMMAND} = require('../init');

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

function createIo(cwd: string, input: string | null = null) {
  const stdin = input === null
    ? Object.assign(Readable.from([]), {isTTY: true})
    : Readable.from([input]);

  return {cwd, stdin, stdout: createStream(), stderr: createStream()};
}

describe('kysaro CLI', () => {

  let cwd: string;
  let log: jest.SpyInstance;
  const gitEnv: Record<string, string | undefined> = {};

  // Git hooks export GIT_DIR and friends; they must not leak into temp repositories.
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

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'kysaro-cli-'));
    log = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    log.mockRestore();
    fs.rmSync(cwd, {recursive: true, force: true});
  });

  describe('check', () => {

    test('should exit 0 silently for a valid message file', async () => {
      fs.writeFileSync(path.join(cwd, 'COMMIT_EDITMSG'), 'feat(cli): Add init command\n');
      const io = createIo(cwd);

      await expect(run(['COMMIT_EDITMSG', '--type', 'commit'], io)).resolves.toBe(EXIT_CODE.OK);
      expect(io.stderr.output).toBe('');
    });

    test('should exit 1 and list issues for an invalid message', async () => {
      const io = createIo(cwd);

      await expect(run(['-m', 'feat(UI): add colors.', '--type', 'commit'], io)).resolves.toBe(EXIT_CODE.INVALID);
      expect(io.stderr.output).toContain('Commit message is invalid');
      expect(io.stderr.output).toContain('Scope "UI" must be in lower case');
      expect(io.stderr.output).toContain('Subject must not end with a period');
      expect(io.stderr.output).toContain('Suggested header: feat(ui): Add colors');
    });

    test('should read the message from stdin', async () => {
      const io = createIo(cwd, 'bad message');

      await expect(run(['--type', 'commit'], io)).resolves.toBe(EXIT_CODE.INVALID);
      expect(io.stderr.output).toContain('Header must match');
    });

    test('should ignore merge commits', async () => {
      const io = createIo(cwd);

      await expect(run(['-m', 'anything', '--type', 'merge'], io)).resolves.toBe(EXIT_CODE.OK);
      expect(io.stderr.output).toBe('');
    });

    test('should exit 2 for a missing file', async () => {
      const io = createIo(cwd);

      await expect(run(['missing.txt'], io)).resolves.toBe(EXIT_CODE.ERROR);
      expect(io.stderr.output).toContain('Message file not found: missing.txt');
    });

    test('should exit 2 without a message', async () => {
      const io = createIo(cwd);

      await expect(run([], io)).resolves.toBe(EXIT_CODE.ERROR);
      expect(io.stderr.output).toContain('No message');
    });

    test('should exit 2 for unknown options and types', async () => {
      await expect(run(['--nope'], createIo(cwd))).resolves.toBe(EXIT_CODE.ERROR);
      await expect(run(['-m', 'feat: Add x', '--type', 'pr'], createIo(cwd))).resolves.toBe(EXIT_CODE.ERROR);
    });

    test('should print help and version', async () => {
      const help = createIo(cwd);
      const version = createIo(cwd);

      await run(['--help'], help);
      await run(['-v'], version);

      expect(help.stdout.output).toContain('kysaro init');
      expect(version.stdout.output).toMatch(/^\d+\.\d+\.\d+/u);
    });
  });

  describe('init', () => {

    const git = (...args: string[]) => execFileSync('git', args, {cwd, env: process.env, stdio: 'ignore'});

    test('should fail outside a git repository', async () => {
      const io = createIo(cwd);

      await expect(run(['init'], io)).resolves.toBe(EXIT_CODE.ERROR);
      expect(io.stderr.output).toContain('Not a git repository');
    });

    test('should install the hook into .git/hooks', async () => {
      git('init', '-q');

      await expect(run(['init'], createIo(cwd))).resolves.toBe(EXIT_CODE.OK);

      const hook = path.join(cwd, '.git', 'hooks', 'commit-msg');
      expect(fs.readFileSync(hook, 'utf8')).toBe(`#!/bin/sh\n${HOOK_COMMAND}\n`);
      expect(fs.statSync(hook).mode & 0o111).not.toBe(0);
    });

    test('should install the hook into .husky when husky is used', async () => {
      git('init', '-q');
      fs.mkdirSync(path.join(cwd, '.husky'));

      await run(['init'], createIo(cwd));

      expect(fs.readFileSync(path.join(cwd, '.husky', 'commit-msg'), 'utf8')).toBe(`${HOOK_COMMAND}\n`);
    });

    test('should not overwrite a foreign hook without --force', async () => {
      git('init', '-q');
      const hook = path.join(cwd, '.git', 'hooks', 'commit-msg');
      fs.mkdirSync(path.dirname(hook), {recursive: true});
      fs.writeFileSync(hook, '#!/bin/sh\necho custom\n');

      await expect(run(['init'], createIo(cwd))).resolves.toBe(EXIT_CODE.ERROR);
      expect(fs.readFileSync(hook, 'utf8')).toContain('custom');

      await expect(run(['init', '--force'], createIo(cwd))).resolves.toBe(EXIT_CODE.OK);
      expect(fs.readFileSync(hook, 'utf8')).toContain('kysaro');
    });

    test('should copy settings that the loader accepts', async () => {
      git('init', '-q');

      await run(['init', '--settings'], createIo(cwd));

      const commit = JSON.parse(fs.readFileSync(path.join(cwd, '.kysaro', 'settings', 'commits', 'commit.json'), 'utf8'));
      expect(commit.$schema).toBe('../../../node_modules/kysaro/src/settings/schemas/commit.schema.json');
      expect(fs.existsSync(path.join(cwd, '.kysaro', 'settings', 'resources', 'types.json'))).toBe(true);
      expect(fs.readFileSync(path.join(cwd, '.gitignore'), 'utf8')).toBe('.kysaro/*.md\n');

      const io = createIo(cwd);
      await expect(run(['-m', 'feat: Add colors', '--type', 'commit'], io)).resolves.toBe(EXIT_CODE.OK);
      expect(log).not.toHaveBeenCalled();
    });
  });
});
