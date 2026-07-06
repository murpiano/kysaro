const {normalizeConfig} = require('./normalize-config');

const {validateHeader} = require('./validate/header');
const {validateBody} = require('./validate/body');
const {validateFooter} = require('./validate/footer');


function validateMessage(parsed, context) {
    const ast = parsed.ast
    const issues = [];
    const deterministicFixes = [];

    const rules = normalizeConfig(context);

    const validatedSections = [
        validateHeader(ast.header, rules.header),
        // validateBody(ast.body, rules.body),
        // validateFooter(ast.footer, rules.footer)
    ]

    validatedSections.forEach(section => {
        const {
            issues: sectionIssues,
            deterministicFixes: sectionDeterministicFixes
        } = section;
        issues.push(...sectionIssues);
        deterministicFixes.push(...sectionDeterministicFixes);
    })

    return {
        issues,
        deterministicFixes
    };
}

function applyValidator(result, context) {
    const rules = context.config.main.validator;


    if (rules.enabled === false) return result;

    const validatorSeverity = rules.severity;


    const {
        issues,
        deterministicFixes
    } = validateMessage(
        result.parsed,
        context
    );


    const normalizedIssues = issues.map(issue => ({
        ...issue,
        severity: validatorSeverity
    }));

    console.log(issues)
    console.log(deterministicFixes)

    return {
        ...result,

        issues: [
            ...result.issues,
            ...normalizedIssues
        ],

        deterministicFixes: [
            ...result.deterministicFixes,
            ...deterministicFixes
        ]
    };
}

module.exports = {
    applyValidator
};
