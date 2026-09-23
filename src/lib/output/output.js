const {VALIDATE_STATUS} = require("../../all/const/const");
const {ISSUE_SEVERITY} = require("../../all/const/issue");

const INVALID_MODE = {
    RETURN: 'return',
    THROW: 'throw'
}


class KysaroException extends Error {
    constructor(result, message, code) {
        super(message);
        this.result = result;
        this.code = code;
        this.name = "KysaroException";
    }
}

function resolveStatus(result) {
    if (result.ignored === true) {
        return VALIDATE_STATUS.IGNORED;
    }

    const hasErrors = result.issues.some(
        issue => issue.severity === ISSUE_SEVERITY.ERROR
    );

    return hasErrors
        ? VALIDATE_STATUS.INVALID
        : VALIDATE_STATUS.VALID;
}

function output(rules, result) {
    const status = resolveStatus(result);

    result = {
        ...result,
        status
    };

    const isThrow = rules?.invalid === INVALID_MODE.THROW;

    if (!isThrow) return result;

    if (status !== VALIDATE_STATUS.INVALID) return result;

    const firstError = result.issues.find(issue => issue.severity === ISSUE_SEVERITY.ERROR);

    if (!firstError) return result;

    throw new KysaroException(
        result,
        firstError.message,
        firstError.code
    );
}

module.exports = {
    output,
    KysaroException,
    INVALID_MODE
}
