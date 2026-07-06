function fixMessage(result, context) {
    return ({
        appliedFixes: [{APPLIED_FIX: 'applied-Fix'}],
        fixedMessage: 'FIXED_MESSAGE'
    })
}

function applyFixer(result, context) {
    const rules = context.config.main.fixer;

    if (rules.enabled === false) return result;

    const isApplyMode = rules.mode === 'apply';

    const {appliedFixes, fixedMessage} = fixMessage(result, context);


    return ({
        ...result,
        appliedFixes: [
            ...result.appliedFixes,
            ...(isApplyMode ? appliedFixes : [])
        ],
        final: (
            isApplyMode && fixedMessage != null
                ? fixedMessage
                : result.final
        )
    })

}

module.exports = {
    applyFixer
}
