const fs = require('fs');
const path = require('path');
const {parseArgs} = require('util');

const {lint} = require('../index');
const {COMMIT_TYPE, VALIDATE_STATUS} = require('../all/const/const');
const {ISSUE_CODE} = require('../all/const/issue');
const {formatResult} = require('./format');
const {init, InitError} = require('./init');
const {version} = require('../../package.json');

const EXIT_CODE = {
  OK: 0,
  INVALID: 1,
  ERROR: 2
};

const TYPE_OPTION = {
  commit: COMMIT_TYPE.COMMIT,
  merge: COMMIT_TYPE.MERGE,
  request: COMMIT_TYPE.REQUEST
};

const HELP = `Usage:
  kysaro <file>              Check a commit message file (commit-msg hook)
  kysaro -m <message>        Check a message
  kysaro < message.txt       Check a message from stdin
  kysaro init                Install the commit-msg hook
  kysaro init --settings     Also copy default settings to .kysaro/settings

Options:
  -m, --message <text>       Message to check
      --type <kind>          Message kind: commit, merge, request (detected by default)
      --force                init: overwrite existing hook and settings
  -h, --help                 Show help
  -v, --version              Show version

Exit codes: 0 valid or ignored, 1 invalid, 2 usage or settings error.
`;

const OPTIONS = {
  message: {type: 'string', short: 'm'},
  type: {type: 'string'},
  settings: {type: 'boolean'},
  force: {type: 'boolean'},
  help: {type: 'boolean', short: 'h'},
  version: {type: 'boolean', short: 'v'}
};

class UsageError extends Error {
}

function readStdin(stdin) {
  return new Promise((resolve, reject) => {
    let data = '';

    stdin.setEncoding('utf8');
    stdin.on('data', chunk => {
      data += chunk;
    });
    stdin.on('end', () => resolve(data));
    stdin.on('error', reject);
  });
}

async function readMessage({values, positionals}, {cwd, stdin}) {
  if (values.message !== undefined) {
    return values.message;
  }

  if (positionals.length > 1) {
    throw new UsageError('Pass one message file');
  }

  if (positionals.length === 1) {
    const file = path.resolve(cwd, positionals[0]);

    if (!fs.existsSync(file)) {
      throw new UsageError(`Message file not found: ${positionals[0]}`);
    }

    return fs.readFileSync(file, 'utf8').replace(/^﻿/u, '');
  }

  if (stdin && !stdin.isTTY) {
    return readStdin(stdin);
  }

  throw new UsageError('No message. Pass a file, -m <message> or stdin');
}

function resolveType(type) {
  if (type === undefined) {
    return null;
  }

  if (!TYPE_OPTION[type]) {
    throw new UsageError(`Unknown --type "${type}". Use: ${Object.keys(TYPE_OPTION).join(', ')}`);
  }

  return TYPE_OPTION[type];
}

async function check(args, io) {
  const message = await readMessage(args, io);
  const result = lint(message, {type: resolveType(args.values.type), cwd: io.cwd});
  const text = formatResult(result);

  if (text) {
    io.stderr.write(text);
  }

  if (result.status !== VALIDATE_STATUS.INVALID) {
    return EXIT_CODE.OK;
  }

  return result.issues.some(issue => issue.code === ISSUE_CODE.CONFIGURATION_ERROR)
    ? EXIT_CODE.ERROR
    : EXIT_CODE.INVALID;
}

function runInit(args, io) {
  init({cwd: io.cwd, settings: Boolean(args.values.settings), force: Boolean(args.values.force)})
    .forEach(line => io.stdout.write(`[kysaro] ${line}\n`));

  return EXIT_CODE.OK;
}

/**
 * Runs the CLI.
 *
 * @param {string[]} argv Arguments without `node` and script path.
 * @param {Object} [io] Streams and working directory, replaced in tests.
 * @returns {Promise<number>} Exit code.
 */
async function run(argv, io = {}) {
  const streams = {
    cwd: process.cwd(),
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
    ...io
  };

  try {
    const args = parseArgs({args: argv, options: OPTIONS, allowPositionals: true});

    if (args.values.help) {
      streams.stdout.write(HELP);
      return EXIT_CODE.OK;
    }

    if (args.values.version) {
      streams.stdout.write(`${version}\n`);
      return EXIT_CODE.OK;
    }

    if (args.positionals[0] === 'init') {
      return runInit({...args, positionals: args.positionals.slice(1)}, streams);
    }

    return await check(args, streams);
  } catch (error) {
    if (error instanceof UsageError || error instanceof InitError || error.code?.startsWith?.('ERR_PARSE_ARGS')) {
      streams.stderr.write(`[kysaro] ${error.message}\n`);
      return EXIT_CODE.ERROR;
    }

    throw error;
  }
}

module.exports = {
  run,
  EXIT_CODE
};
