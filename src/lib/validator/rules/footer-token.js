const {createCaseStep} = require("./case");

function createFooterTokenValidationStep(config, path) {
    return (tokens) => {
        if (!tokens) return null;

        const caseValidate = createCaseStep(
            {
                value: config.case,
                enums: config.value,
                target: 'token.key'
            },
            path
        );

        const errorMap = new Map();

        tokens.forEach((token, i) => {
            if (!token.key) return;

            const result = caseValidate(token.key);
            if (!result?.errors) return;

            result.errors.forEach(err => {
                // 🔥 группируем ТОЛЬКО по типу ошибки
                const mapKey = JSON.stringify({
                    code: err.code,
                    message: err.message
                });

                if (!errorMap.has(mapKey)) {
                    errorMap.set(mapKey, {
                        ...err,
                        tokens: [i],
                        originalKeys: [token.key] // 👈 опционально, если хочешь хранить
                    });
                } else {
                    const existing = errorMap.get(mapKey);

                    existing.tokens.push(i);

                    // 👇 если хочешь — можно хранить разные ключи
                    if (!existing.originalKeys.includes(token.key)) {
                        existing.originalKeys.push(token.key);
                    }
                }
            });
        });

        return errorMap.size > 0
            ? { errors: Array.from(errorMap.values()) }
            : null;
    };
}

module.exports = {
    createFooterTokenValidationStep
}
