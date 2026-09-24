const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

const defaultSettings = require('../settings');
const {DIRECTORY} = require('../config');

const HOOK_COMMAND = 'npx --no -- kysaro "$1"';
const HOOK_MARKER = 'kysaro';
const REPORTS_IGNORE = '.kysaro/*.md';

/**
 * Path from `.kysaro/settings/<group>/<file>.json` to the package schemas.
 */
const SCHEMAS_PATH = '../../../node_modules/kysaro/src/settings/schemas';

const SETTINGS_GROUPS = ['main', 'commits', 'resources'];

class InitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InitError';
  }
}

function git(args, cwd) {
  try {
    return execFileSync('git', args, {
      cwd,
      env: process.env,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return null;
  }
}

function writeHookFile(hookPath, content, force) {
  if (fs.existsSync(hookPath)) {
    const current = fs.readFileSync(hookPath, 'utf8');

    if (current.includes(HOOK_MARKER)) {
      return `commit-msg hook already runs kysaro: ${hookPath}`;
    }

    if (!force) {
      throw new InitError(
        `${hookPath} already exists. Add "${HOOK_COMMAND}" to it or run "kysaro init --force"`
      );
    }
  }

  fs.mkdirSync(path.dirname(hookPath), {recursive: true});
  fs.writeFileSync(hookPath, content, {mode: 0o755});
  fs.chmodSync(hookPath, 0o755);

  return `Installed commit-msg hook: ${hookPath}`;
}

/**
 * Installs the commit-msg hook: into `.husky` when husky is set up,
 * otherwise into the git hooks directory.
 */
function installHook(root, force) {
  const huskyDir = path.join(root, '.husky');

  if (fs.existsSync(huskyDir)) {
    return writeHookFile(path.join(huskyDir, 'commit-msg'), `${HOOK_COMMAND}\n`, force);
  }

  const hooksPath = git(['rev-parse', '--git-path', 'hooks'], root);
  const hooksDir = path.resolve(root, hooksPath || path.join('.git', 'hooks'));

  return writeHookFile(path.join(hooksDir, 'commit-msg'), `#!/bin/sh\n${HOOK_COMMAND}\n`, force);
}

function copySettingsFile(source, target, force) {
  if (fs.existsSync(target) && !force) {
    return false;
  }

  const data = JSON.parse(fs.readFileSync(source, 'utf8'));
  const schemaName = path.basename(data.$schema || '');

  if (schemaName) {
    data.$schema = `${SCHEMAS_PATH}/${schemaName}`;
  }

  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, JSON.stringify(data, null, 2) + '\n');

  return true;
}

/**
 * Copies default settings into `.kysaro/settings` and ignores reports in git.
 */
function copySettings(root, force) {
  const targetDir = path.join(root, ...DIRECTORY.USER_SETTINGS);
  const messages = [];

  SETTINGS_GROUPS.forEach(group => {
    const sourceGroup = path.join(defaultSettings.dir, group);

    fs.readdirSync(sourceGroup)
      .filter(file => file.endsWith('.json'))
      .forEach(file => {
        const target = path.join(targetDir, group, file);
        const copied = copySettingsFile(path.join(sourceGroup, file), target, force);

        messages.push(copied
          ? `Created ${path.relative(root, target)}`
          : `Kept existing ${path.relative(root, target)}`);
      });
  });

  const gitignore = path.join(root, '.gitignore');
  const current = fs.existsSync(gitignore) ? fs.readFileSync(gitignore, 'utf8') : '';

  if (!current.split(/\r?\n/u).includes(REPORTS_IGNORE)) {
    const separator = current && !current.endsWith('\n') ? '\n' : '';
    fs.writeFileSync(gitignore, `${current}${separator}${REPORTS_IGNORE}\n`);
    messages.push(`Added ${REPORTS_IGNORE} to .gitignore`);
  }

  return messages;
}

/**
 * `kysaro init`: installs the hook and optionally copies settings.
 *
 * @param {Object} params
 * @param {string} params.cwd
 * @param {boolean} [params.settings=false] Copy default settings.
 * @param {boolean} [params.force=false] Overwrite existing files.
 * @returns {string[]} Messages for the user.
 * @throws {InitError}
 */
function init({cwd, settings = false, force = false}) {
  const root = git(['rev-parse', '--show-toplevel'], cwd);

  if (!root) {
    throw new InitError('Not a git repository. Run "git init" first');
  }

  const messages = [installHook(root, force)];

  if (settings) {
    messages.push(...copySettings(root, force));
  }

  return messages;
}

module.exports = {
  init,
  InitError,
  HOOK_COMMAND
};
