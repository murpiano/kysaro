const CASE_TYPES = {
  LOWER: 'lower',
  UPPER: 'upper',
  SENTENCE: 'sentence',
  AS_RULE: 'as-rule',
  ANY: 'any',
}

const PART_NAMES = {
  HEADER: 'header',
  BODY:'body',
  BODY_LINE: 'body-line',
  BODY_PARAGRAPH: 'body-paragraph',
  FOOTER:'footer',
  TYPE:'type',
  SCOPE: 'scope',
  SUBJECT:'subject',
  RAW:'raw',
  TOKEN:'token',
  TOKEN_VALUE:'token-value',
}

const PATH_PARTS = PART_NAMES;

const RULE_NAME = {
  ENUM: 'enum',
  CASE: 'case',
  FOOTER_TOKEN: 'footer-token',
  LENGTH: 'length',
  FORMAT: 'format',
  FOOTER_FORMAT: 'footer-format',
  REQUIRED: 'required',
  BLANK_LINE: 'blank-line',
  BODY_LINE_LENGTH: 'body-line-length',
  FOOTER_LINE_LENGTH: 'footer-line-length',
  FOOTER_TOKEN_VALUE: 'footer-token-value'
}

module.exports = {
  CASE_TYPES,
  PART_NAMES,
  RULE_NAME,
  PATH_PARTS
}
