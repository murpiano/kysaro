const fs = require('fs');
const path = require('path');
const {COMMIT_TYPE} = require("./const/const");

const GITHUB_PULL_REQUEST_EVENT = 'pull_request';

/**
 * Finds the git directory of the project.
 *
 * Git hooks get `GIT_DIR`. Otherwise `.git` in `cwd` is used; in a
 * worktree `.git` is a file with a `gitdir:` pointer.
 *
 * @param {string} [cwd=process.cwd()]
 * @returns {string|null}
 */
function resolveGitDir(cwd = process.cwd()) {
  if (process.env.GIT_DIR) {
    return path.resolve(cwd, process.env.GIT_DIR);
  }

  const dotGit = path.join(cwd, '.git');

  try {
    const stat = fs.statSync(dotGit);

    if (stat.isDirectory()) {
      return dotGit;
    }

    const match = /^gitdir:\s*(.+)$/mu.exec(fs.readFileSync(dotGit, 'utf8'));

    return match ? path.resolve(cwd, match[1].trim()) : null;
  } catch {
    return null;
  }
}

/**
 * Detects the message kind.
 *
 * - `GITHUB_EVENT_NAME=pull_request` — pull request;
 * - `MERGE_HEAD` in the git directory — merge commit;
 * - otherwise — regular commit.
 *
 * @param {string|null} manualType Kind forced by the caller.
 * @returns {string} Value of `COMMIT_TYPE`.
 */
function resolveCommitType(manualType) {
  if (manualType != null) {
    return manualType;
  }

  if (process.env.GITHUB_EVENT_NAME === GITHUB_PULL_REQUEST_EVENT) {
    return COMMIT_TYPE.REQUEST;
  }

  const gitDir = resolveGitDir();

  if (gitDir && fs.existsSync(path.join(gitDir, 'MERGE_HEAD'))) {
    return COMMIT_TYPE.MERGE;
  }

  return COMMIT_TYPE.COMMIT;
}

module.exports = {
  resolveCommitType,
  resolveGitDir
};
