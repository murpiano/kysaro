const {createEnumStep} = require('./rules/enum');
const {createCaseStep} = require('./rules/case');
const {createLengthStep} = require('./rules/length');
const {createFormatStep} = require('./rules/format');
const {createRequiredStep} = require('./rules/required');
const {createBlankLineStep} = require('./rules/blank-line');
const {createBodyLineLengthStep} = require('./rules/body-line-length');
const {RULE_NAME} = require('./const');
const {createFooterFormatStep} = require('./rules/footer-format');
const {createFooterLineLengthStep} = require('./rules/footer-line-length');
const {
    createFooterTokenValidationStep
} = require('./rules/footer-token');
const {createFooterTokenValueValidationStep} = require("./rules/footer-token-value");

const RULES_REGISTRY = {
    [RULE_NAME.ENUM]: createEnumStep,
    [RULE_NAME.FOOTER_TOKEN]: createFooterTokenValidationStep,
    [RULE_NAME.CASE]: createCaseStep,
    [RULE_NAME.LENGTH]: createLengthStep,
    [RULE_NAME.FORMAT]: createFormatStep,
    [RULE_NAME.REQUIRED]: createRequiredStep,
    [RULE_NAME.BLANK_LINE]: createBlankLineStep,
    [RULE_NAME.BODY_LINE_LENGTH]: createBodyLineLengthStep,
    [RULE_NAME.FOOTER_LINE_LENGTH]: createFooterLineLengthStep,
    [RULE_NAME.FOOTER_FORMAT]: createFooterFormatStep,
    [RULE_NAME.FOOTER_TOKEN_VALUE]: createFooterTokenValueValidationStep
};

module.exports = {RULES_REGISTRY};
