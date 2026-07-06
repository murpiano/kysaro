const {COMMIT_TYPE} = require("../../all/const/const");

const IGNORE_KIND_MAP = {
    commit: COMMIT_TYPE.COMMIT,
    merge: COMMIT_TYPE.MERGE,
    request: COMMIT_TYPE.REQUEST
};

function isIgnored(result, context) {
    const ignore = context.config.main?.ignore || {};
    const commitType = context.runtime.commitType;

    const message = result.final;

    const ignoredKinds = ignore.kinds || [];

    const ignoredByKind = ignoredKinds.some(kind => {
        if (typeof kind !== 'string') {
            return false;
        }

        return (
            IGNORE_KIND_MAP[kind.toLowerCase()] ===
            commitType
        );
    });

    if (ignoredByKind) {
        return true;
    }

    const patterns = ignore.patterns || [];

    return patterns.some(pattern =>
        matchPattern(message, pattern)
    );
}

function matchPattern(message, pattern) {
    if (!pattern) {
        return false;
    }

    if (pattern instanceof RegExp) {
        return pattern.test(message);
    }

    if (typeof pattern === 'string') {
        return message
            .toLowerCase()
            .includes(pattern.toLowerCase());
    }

    return false;
}

module.exports = {
    isIgnored
};
