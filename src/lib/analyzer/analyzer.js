const {analyzeCorrection} = require("./correction");
const {analyzeSemantic} = require("./semantic");

function applyAnalyzer(result, context) {
    const rules = context.config.main.analyzer;

    if (rules.enabled === false) return result;

    const isCorrectionEnabled = rules.correction.enabled;
    const isSemanticEnabled = rules.semantic.enabled;

    const suggestedFixes = isCorrectionEnabled ? analyzeCorrection(result, context) : [];
    const insights = isSemanticEnabled ? analyzeSemantic(result, context) : [];

    return ({
        ...result,
        suggestedFixes: [...result.suggestedFixes, ...suggestedFixes],
        insights: [...result.insights, ...insights]
    });
}

module.exports = {
    applyAnalyzer
}
