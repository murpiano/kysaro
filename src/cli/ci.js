const fs = require('fs');

const {COMMIT_TYPE} = require('../all/const/const');
const {hasCommit, newCommitsRevisions} = require('./git');
const {checkRange} = require('./range');

const PULL_REQUEST_EVENTS = ['pull_request', 'pull_request_target'];
const PUSH_EVENT = 'push';
const BRANCH_PREFIX = 'refs/heads/';

class CiError extends Error {
}

function readEvent(env) {
  if (!env.GITHUB_ACTIONS || !env.GITHUB_EVENT_PATH) {
    throw new CiError('kysaro ci runs in GitHub Actions. Elsewhere use kysaro --range <base>..<head>');
  }

  try {
    return JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, 'utf8'));
  } catch (error) {
    throw new CiError(`Cannot read the GitHub event: ${error.message}`);
  }
}

/**
 * Message of a pull request: title as header, description as body.
 */
function pullRequestMessage(pullRequest) {
  const body = String(pullRequest.body || '').replace(/\r\n/gu, '\n').trim();

  return body ? `${pullRequest.title}\n\n${body}` : String(pullRequest.title || '');
}

function pushRevisions(event, cwd) {
  if (event.deleted || !String(event.ref || '').startsWith(BRANCH_PREFIX)) {
    return null;
  }

  const head = event.after;

  if (hasCommit(event.before, cwd)) {
    return [`${event.before}..${head}`];
  }

  const branch = event.ref.slice(BRANCH_PREFIX.length);

  return newCommitsRevisions(head, cwd, `refs/remotes/origin/${branch}`);
}

/**
 * Collects what to check for the current GitHub Actions event.
 *
 * - `pull_request`: the title and description, and commits `base..head`;
 * - `push` to a branch: commits `before..after`, or for a new branch the
 *   commits that are not in other remote branches.
 *
 * @param {Object} params
 * @param {string} params.cwd
 * @param {Object} params.env Environment variables.
 * @param {function(string, string): Object} params.check `(message, kind) => KysaroResult`.
 * @returns {{pullRequest:{number:number, result:Object}|null, commits:Object[]}}
 * @throws {CiError}
 */
function runCi({cwd, env, check}) {
  const event = readEvent(env);
  const eventName = env.GITHUB_EVENT_NAME;

  if (PULL_REQUEST_EVENTS.includes(eventName)) {
    const pullRequest = event.pull_request || {};
    const commits = checkRange({revisions: [`${pullRequest.base?.sha}..${pullRequest.head?.sha}`], cwd, check});

    if (commits === null) {
      throw new CiError('Cannot list pull request commits. Use actions/checkout with fetch-depth: 0');
    }

    return {
      pullRequest: {
        number: pullRequest.number,
        result: check(pullRequestMessage(pullRequest), COMMIT_TYPE.REQUEST)
      },
      commits
    };
  }

  if (eventName === PUSH_EVENT) {
    const revisions = pushRevisions(event, cwd);
    const commits = revisions ? checkRange({revisions, cwd, check}) : [];

    if (commits === null) {
      throw new CiError('Cannot list pushed commits. Use actions/checkout with fetch-depth: 0');
    }

    return {pullRequest: null, commits};
  }

  return {pullRequest: null, commits: []};
}

module.exports = {
  runCi,
  pullRequestMessage,
  CiError
};
