const {execFileSync} = require('child_process');

/**
 * Separators that `git log` writes for `%x1e` and `%x00`.
 */
const RECORD = '\x1e';
const FIELD = '\x00';

/**
 * Runs git and returns trimmed stdout, or `null` when git fails.
 *
 * `env` is passed explicitly so that tests can clear `GIT_*` variables.
 *
 * @param {string[]} args
 * @param {string} cwd
 * @returns {string|null}
 */
function git(args, cwd) {
  try {
    return execFileSync('git', args, {
      cwd,
      env: process.env,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Lists commits of a revision range, oldest first.
 *
 * @param {string[]} revisions Arguments for `git log`, e.g. `['a..b']` or `['b', '--not', 'origin/main']`.
 * @param {string} cwd
 * @returns {{sha:string, parents:string[], message:string}[]|null} `null` when the range is invalid.
 */
function listCommits(revisions, cwd) {
  const output = git(['log', '--reverse', '--format=%H%x00%P%x00%B%x1e', ...revisions, '--'], cwd);

  if (output === null) {
    return null;
  }

  return output
    .split(RECORD)
    .map(record => record.replace(/^\n/u, ''))
    .filter(Boolean)
    .map(record => {
      const [sha, parents, message] = record.split(FIELD);

      return {
        sha,
        parents: parents ? parents.split(' ') : [],
        message: message.replace(/\n+$/u, '')
      };
    });
}

/**
 * Checks that a revision names a commit in the repository.
 */
function hasCommit(revision, cwd) {
  return Boolean(revision) && git(['cat-file', '-e', `${revision}^{commit}`], cwd) !== null;
}

/**
 * Revisions of commits that exist only in `head`: not in any other
 * remote branch. Used for the first push of a branch.
 *
 * @param {string} head
 * @param {string} cwd
 * @param {string|null} [ownRef=null] Remote ref of the pushed branch, excluded from the comparison.
 * @returns {string[]}
 */
function newCommitsRevisions(head, cwd, ownRef = null) {
  const refs = (git(['for-each-ref', '--format=%(refname)', 'refs/remotes'], cwd) || '')
    .split('\n')
    .filter(ref => ref && ref !== ownRef && !ref.endsWith('/HEAD'));

  return refs.length ? [head, '--not', ...refs] : [head];
}

module.exports = {
  git,
  listCommits,
  hasCommit,
  newCommitsRevisions
};
