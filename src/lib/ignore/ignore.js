const {COMMIT_TYPE} = require("../../all/const/const");

const IGNORE_KIND = {
    MERGE: 'merge',
    REVERT: 'revert'
};

/**
 * Default headers git writes for merge and revert commits.
 */
const MERGE_HEADER = /^Merge (branch|branches|remote-tracking branch|pull request|tag|commit) /u;
const REVERT_HEADER = /^Revert "/u;

const KIND_MATCHERS = {
    [IGNORE_KIND.MERGE]: (header, commitType) => commitType === COMMIT_TYPE.MERGE || MERGE_HEADER.test(header),
    [IGNORE_KIND.REVERT]: header => REVERT_HEADER.test(header)
};

function getHeader(message) {
    return String(message || '').split(/\r?\n/u)[0];
}

/**
 * A pattern matches when the header starts with it, ignoring case.
 */
function matchPattern(header, pattern) {
    if (typeof pattern !== 'string' || pattern === '') {
        return false;
    }

    return header.toLowerCase().startsWith(pattern.toLowerCase());
}

/**
 * Checks `ignore.kinds` and `ignore.patterns` of main settings.
 *
 * @param {Object} result Pipeline result.
 * @param {Object} context Commit context.
 * @returns {boolean}
 */
function isIgnored(result, context) {
    const ignore = context.settings.main?.ignore || {};
    const header = getHeader(result.final);

    const ignoredByKind = (ignore.kinds || []).some(kind => {
        const matcher = KIND_MATCHERS[String(kind).toLowerCase()];

        return matcher ? matcher(header, context.commitType) : false;
    });

    if (ignoredByKind) {
        return true;
    }

    return (ignore.patterns || []).some(pattern => matchPattern(header, pattern));
}

module.exports = {
    isIgnored,
    IGNORE_KIND
};
