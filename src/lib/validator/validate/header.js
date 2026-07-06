const {buildPipeline} = require('../build-pipeline');
const {runPipeline} = require('../run-pipeline');

const {PART_NAMES, PATH_PARTS, RULE_NAMES} = require('../const');
const {buildHeader} = require('../../builder');
const {ISSUE_CATEGORY} = require("../../../all/const/issue");

function validateHeader(ast, rules) {
    const issues = [];
    const deterministicFixes = [];
    const result = {issues, deterministicFixes, stop:false };
    const {type, scope, subject} = ast;

    function accumulateValidationStep(steps, value) {
        const stepResult = runPipeline(steps, value);

        issues.push(...stepResult?.issues);
        deterministicFixes.push(...stepResult?.deterministicFixes);

        if (stepResult?.stop === true) {
            result.stop = true;
        }
    }

    // ----------------------------
    // 1. FORMAT (через rebuild)
    // ----------------------------
    const builtHeader = buildHeader(ast);
    const formatSteps = buildPipeline(
        rules.format,
        PART_NAMES.HEADER,
        [PATH_PARTS.HEADER]
    );

    accumulateValidationStep(formatSteps, {
        raw: ast.raw,
        builtHeader
    })

    if (result.stop) {
        return result;
    }

    // ----------------------------
    // 2. TYPE
    // ----------------------------
    const typeSteps = buildPipeline(
      rules.type,
      PART_NAMES.TYPE,
      [PATH_PARTS.HEADER, PATH_PARTS.TYPE]
    );

    accumulateValidationStep(typeSteps, {type})


    // // ----------------------------
    // // 2. SCOPE
    // // ----------------------------
    // if (scope) {
    //   const scopeSteps = buildPipeline(
    //     rules.scope,
    //     PART_NAMES.SCOPE,
    //     [PATH_PARTS.HEADER, PATH_PARTS.SCOPE]
    //   );
    //
    //   errors.push(...runPipeline(scopeSteps, scope));
    // }
    //
    // // ----------------------------
    // // 3. SUBJECT
    // // ----------------------------
    // const subjectSteps = buildPipeline(
    //   rules.subject,
    //   PART_NAMES.SUBJECT,
    //   [PATH_PARTS.HEADER, PATH_PARTS.SUBJECT]
    // );
    //
    // errors.push(...runPipeline(subjectSteps, subject));
    //
    //
    //
    // // ----------------------------
    // // 5. MAX LENGTH
    // // ----------------------------
    // const headerLengthSteps = buildPipeline(
    //   rules.maxLength,
    //   PART_NAMES.HEADER,
    //   [PATH_PARTS.HEADER]
    // );
    //
    // errors.push(
    //   ...runPipeline(
    //     headerLengthSteps,
    //     builtHeader
    //   )
    // );

    return result;

    // return errors;
}

module.exports = {validateHeader};
