// для пресета
const OFFICIAL_COMMIT_TYPES = {
    FEAT: 'feat',
    FIX: 'fix',
    DOCS: 'docs',
    STYLE: 'style',
    REFACTOR: 'refactor',
    PERF: 'perf',
    TEST: 'test',
    BUILD: 'build',
    CI: 'ci',
    CHORE: 'chore',
    REVERT: 'revert'
};
// для пресета
const COMMUNITY_COMMIT_TYPES = {
    DEPS: 'deps',
    RELEASE: 'release',
    HOTFIX: 'hotfix',
    WIP: 'wip',
    SECURITY: 'security',
    UI: 'ui',
    API: 'api',
    DB: 'db',
    I18N: 'i18n'
};


const VALIDATE_STATUS = {
    IGNORED: 'ignored', VALID: 'valid', INVALID: 'invalid'
}

const COMMIT_TYPE = {
    COMMIT: 'standard_commit',
    REQUEST: 'pull_request',
    MERGE: 'merge_commit'
}

const FIX_KIND = {
    DETERMINISTIC: 'deterministic',
    SUGGESTED: 'suggested',
}


const DETERMINISTIC_FIX_TYPE = {
    TRIM: 'trim',
    REMOVE: 'remove',
    INSERT: 'insert',
    LOWERCASE: 'lowercase',
    UPPERCASE: 'uppercase',
    SENTENCE_CASE: 'sentenceCase',
    SLICE: 'slice',
    REPLACE: 'replace',
    WRAP: 'wrap',
};





module.exports = {
    OFFICIAL_COMMIT_TYPES,
    COMMUNITY_COMMIT_TYPES,
    VALIDATE_STATUS,
    DETERMINISTIC_FIX_TYPE,
    COMMIT_TYPE,
    FIX_KIND,
}
