const {ISSUE_CATEGORY} = require('../../../all/const/issue');
const {isBreakingToken} = require('../../parser');
const {BREAKING_MODE, PATH, VALIDATOR_ISSUE_CODE: CODE} = require('../const');
const {createCollector} = require('../helpers/issue');

const HEADER_PATH = [PATH.HEADER];
const FOOTER_PATH = [PATH.FOOTER];

/**
 * Validates breaking change markers: `!` in the header and
 * `BREAKING CHANGE` token in the footer.
 *
 * @param {Object} ast Parsed message.
 * @param {Object} [settings] `breakingChange` block of commit settings.
 * @returns {{issues:Object[], deterministicFixes:Object[]}}
 */
function validateBreakingChange(ast, settings) {
  const collect = createCollector();

  if (!settings) {
    return collect.result();
  }

  const inHeader = ast.header.breaking === true;
  const tokens = ast.footer.tokens.filter(token => isBreakingToken(token.key));
  const inFooter = tokens.length > 0;

  if (settings.header === BREAKING_MODE.REQUIRE && !inHeader) {
    collect.issue({
      code: CODE.BREAKING_HEADER_REQUIRED,
      message: 'Header must mark the breaking change with "!" before ":"',
      category: ISSUE_CATEGORY.SEMANTIC,
      path: HEADER_PATH
    });
  }

  if (settings.header === BREAKING_MODE.FORBID && inHeader) {
    collect.issue({
      code: CODE.BREAKING_HEADER_FORBIDDEN,
      message: 'Header must not use "!". Describe the breaking change in the footer',
      category: ISSUE_CATEGORY.SEMANTIC,
      path: HEADER_PATH
    });
  }

  if (settings.footer === BREAKING_MODE.REQUIRE && !inFooter) {
    collect.issue({
      code: CODE.BREAKING_FOOTER_REQUIRED,
      message: 'Footer must contain a "BREAKING CHANGE: <description>" token',
      category: ISSUE_CATEGORY.SEMANTIC,
      path: FOOTER_PATH
    });
  }

  if (settings.footer === BREAKING_MODE.FORBID && inFooter) {
    collect.issue({
      code: CODE.BREAKING_FOOTER_FORBIDDEN,
      message: 'Footer must not contain "BREAKING CHANGE". Use "!" in the header',
      category: ISSUE_CATEGORY.SEMANTIC,
      path: FOOTER_PATH
    });
  }

  if (settings.requireFooterDescription && tokens.some(token => token.value.trim() === '')) {
    collect.issue({
      code: CODE.BREAKING_FOOTER_DESCRIPTION,
      message: 'Footer "BREAKING CHANGE" token must describe the change',
      category: ISSUE_CATEGORY.SEMANTIC,
      path: FOOTER_PATH
    });
  }

  if (settings.requireAtLeastOne && !inHeader && !inFooter) {
    collect.issue({
      code: CODE.BREAKING_MISSING,
      message: 'Message must mark a breaking change with "!" in the header or "BREAKING CHANGE" in the footer',
      category: ISSUE_CATEGORY.SEMANTIC,
      path: [PATH.BREAKING_CHANGE]
    });
  }

  return collect.result();
}

module.exports = {
  validateBreakingChange
};
