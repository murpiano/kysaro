function createFooterTokenValueValidationStep(config, path) {
    return (tokens) => {
        if (!tokens) return null;

        const errorMap = new Map();

        tokens.forEach((token, index) => {
            const value = token.value;

            config.steps.forEach(step => {
                const result = step(value);

                if (!result?.errors) return;

                result.errors.forEach(err => {

                    const key = JSON.stringify({
                        code: err.code,
                        path,
                        message: err.message
                    });

                    if (!errorMap.has(key)) {
                        errorMap.set(key, {
                            ...err,
                            path,
                            tokens: [index]
                        });
                    } else {
                        const existing = errorMap.get(key);
                        existing.tokens.push(index);
                    }

                });
            });
        });

        if (errorMap.size === 0) return null;

        return { errors: Array.from(errorMap.values()) };
    };
}

module.exports = {
    createFooterTokenValueValidationStep
};
