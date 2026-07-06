const {buildPipeline} = require('../build-pipeline');
const {PART_NAMES, PATH_PARTS} = require('../const');
const {runPipeline} = require('../run-pipeline');
const {createFooterTokenValueValidationStep} = require("../rules/footer-token-value");

function validateFooter(rules, parsed, context) {
    const errors = [];
    const {ast} = parsed
    const {footer} = ast;

    // ----------------------------
    // 1. REQUIRED
    // ----------------------------
    const requiredSteps = buildPipeline(
        rules.required,
        PART_NAMES.FOOTER,
        [PATH_PARTS.FOOTER],
        context
    );

    const requiredErrors = runPipeline(requiredSteps, footer);
    errors.push(...requiredErrors);

    if (requiredErrors.length > 0) return errors;

//   // ----------------------------
//   // 2. BLANK LINE BEFORE
//   // ----------------------------
    const blankSteps = buildPipeline(
        rules.blankLineBefore,
        PART_NAMES.FOOTER,
        [PART_NAMES.FOOTER],
        context
    );

    errors.push(...runPipeline(blankSteps, parsed)); // тут нужен доступ к body/footer

    // ----------------------------
    // 3. FORMAT (token: value)
    // ----------------------------
    const formatSteps = buildPipeline(
        rules.format,
        PART_NAMES.FOOTER,
        [PATH_PARTS.FOOTER],
        context
    );

    errors.push(...runPipeline(formatSteps, footer));


    // ----------------------------
    // 4. MAX LINE LENGTH
    // ----------------------------
    const lengthSteps = buildPipeline(
        rules.maxLineLength,
        PART_NAMES.FOOTER,
        [PATH_PARTS.FOOTER],
        context
    );

    errors.push(...runPipeline(lengthSteps, footer.tokens));
//
//   // ----------------------------
//   // 5. EACH ITEM
//   // ----------------------------


    // TOKEN
    const tokenSteps = buildPipeline(
        rules.token,
        PART_NAMES.TOKEN,
        [PATH_PARTS.FOOTER],
        context
    );

    errors.push(...runPipeline(tokenSteps, footer.tokens));

//
//     // VALUE

    const valueRuleConfig = rules.value[0];

    const innerSteps = buildPipeline(
        valueRuleConfig.rules,
        PART_NAMES.TOKEN_VALUE,
        [PATH_PARTS.FOOTER]
    );

    const valueSteps = [
        createFooterTokenValueValidationStep(
            {
                steps: innerSteps,
                target: PART_NAMES.TOKEN_VALUE
            },
            [PATH_PARTS.FOOTER]
        )
    ];

    errors.push(...runPipeline(valueSteps, footer.tokens));

    return errors;
}


module.exports = {
    validateFooter
}
