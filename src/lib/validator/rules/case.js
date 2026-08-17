const {
    ERROR_CODES,
    ERROR_MESSAGES,
    ERROR_CATEGORY
} = require('../errors-const');

const { toSentenceCase } = require('../../../all/helpers/text');
const { CASE_TYPES } = require('../const');
const { FIX_TYPES } = require('../../../all/const/issue');

const caseError = (value) => {
    const errorMap = {
        lower: {
            code: ERROR_CODES.NOT_LOWERCASE,
            message: ERROR_MESSAGES.MUST_BE_LOWERCASE,
            fixType: FIX_TYPES.LOWERCASE
        },
        upper: {
            code: ERROR_CODES.NOT_UPPERCASE,
            message: ERROR_MESSAGES.MUST_BE_UPPERCASE,
            fixType: FIX_TYPES.UPPERCASE
        },
        sentence: {
            code: ERROR_CODES.NOT_SENTENCE_CASE,
            message: ERROR_MESSAGES.MUST_BE_SENTENCE_CASE,
            fixType: FIX_TYPES.SENTENCE_CASE
        },
        'as-rule': {
            code: ERROR_CODES.NOT_AS_RULE,
            message: ERROR_MESSAGES.MUST_MATCH_EXACTLY_AS_RULE_CASE,
            fixType: FIX_TYPES.REPLACE
        }
    };

    return errorMap[value] || {
        code: ERROR_CODES.UNKNOWN_CASE_TYPE,
        message: ERROR_MESSAGES.UNKNOWN_CASE_TYPE,
        fixType: null
    };
};

function createCaseStep({ value: caseType, enums, target }, path) {
    return (input) => {
        if (typeof input !== 'string') {
            return {
                errors: [{
                    code: ERROR_CODES.INVALID_TYPE,
                    message: 'value must be string',
                    category: ERROR_CATEGORY.FORMAT,
                    fixable: false,
                    path
                }],
                stop: true
            };
        }

        if (caseType === CASE_TYPES.ANY) {
            return null;
        }

        let isValid = true;
        let expectedValue;

        if (caseType === CASE_TYPES.LOWER) {
            isValid = input === input.toLowerCase();
            expectedValue = input.toLowerCase();
        }

        else if (caseType === CASE_TYPES.UPPER) {
            isValid = input === input.toUpperCase();
            expectedValue = input.toUpperCase();
        }

        else if (caseType === CASE_TYPES.SENTENCE) {
            const normalized = toSentenceCase(input);
            isValid = input === normalized;
            expectedValue = normalized;
        }

        else if (caseType === CASE_TYPES.AS_RULE) {
            // ❗ здесь мы НЕ валидируем наличие в enums
            // предполагаем, что ENUM уже отработал
            const match = enums?.find(
                item => item.toLowerCase() === input.toLowerCase()
            );

            // если ENUM есть — match всегда будет
            // если нет — просто пропускаем (не наша зона ответственности)
            if (!match) return null;

            isValid = input === match;
            expectedValue = match;
        }

        if (isValid) return null;

        const errorInfo = caseError(caseType);

        const fix = {
            type: errorInfo.fixType,
            target
        };

        if (expectedValue && errorInfo.fixType === FIX_TYPES.REPLACE) {
            fix.payload = expectedValue;
        }

        return {
            errors: [{
                code: errorInfo.code,
                message: errorInfo.message,
                category:
                    caseType === CASE_TYPES.AS_RULE
                        ? ERROR_CATEGORY.ENTITY
                        : ERROR_CATEGORY.FORMAT,
                allowed: caseType === CASE_TYPES.AS_RULE ? enums || null : null,
                fixable: true,
                fix,
                path
            }]
        };
    };
}

module.exports = { createCaseStep };
