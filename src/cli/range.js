const {COMMIT_TYPE, VALIDATE_STATUS} = require('../all/const/const');
const {ISSUE_CATEGORY, ISSUE_CODE, ISSUE_MESSAGE, ISSUE_SEVERITY, ISSUE_SOURCE} = require('../all/const/issue');
const {listCommits} = require('./git');

/**
 * Temporary commits for `git rebase --autosquash`.
 */
const NOT_SQUASHED = /^(fixup|squash|amend)! /u;

function notSquashedResult(commit, kind) {
  return {
    kind,
    rules: null,
    original: commit.message,
    status: VALIDATE_STATUS.INVALID,
    ignored: false,
    final: commit.message,
    parsed: null,
    issues: [{
      code: ISSUE_CODE.COMMIT_NOT_SQUASHED,
      message: ISSUE_MESSAGE.COMMIT_NOT_SQUASHED,
      severity: ISSUE_SEVERITY.ERROR,
      source: ISSUE_SOURCE.PIPELINE,
      category: ISSUE_CATEGORY.STRUCTURE,
      path: ['header'],
      meta: {}
    }],
    deterministicFixes: [],
    suggestedFixes: [],
    appliedFixes: [],
    insights: []
  };
}

/**
 * Checks every commit of a range.
 *
 * Commits with two or more parents are checked as merge commits.
 * `fixup!`, `squash!` and `amend!` commits are errors: they must be
 * squashed before merge.
 *
 * @param {Object} params
 * @param {string[]} params.revisions Arguments for `git log`.
 * @param {string} params.cwd
 * @param {function(string, string): Object} params.check `(message, kind) => KysaroResult`.
 * @returns {{sha:string, header:string, result:Object}[]|null} `null` when the range is invalid.
 */
function checkRange({revisions, cwd, check}) {
  const commits = listCommits(revisions, cwd);

  if (commits === null) {
    return null;
  }

  return commits.map(commit => {
    const kind = commit.parents.length > 1 ? COMMIT_TYPE.MERGE : COMMIT_TYPE.COMMIT;
    const header = commit.message.split('\n')[0];
    const result = NOT_SQUASHED.test(header)
      ? notSquashedResult(commit, kind)
      : check(commit.message, kind);

    return {sha: commit.sha, header, result};
  });
}

module.exports = {
  checkRange
};
