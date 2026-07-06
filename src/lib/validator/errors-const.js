const ERROR_CODES = {
  NOT_LOWERCASE: 'NOT_LOWERCASE',
  NOT_UPPERCASE: 'NOT_UPPERCASE',
  NOT_SENTENCE_CASE: 'NOT_SENTENCE_CASE',
  NOT_AS_RULE: 'NOT_AS_RULE',
  UNKNOWN_CASE_TYPE: 'UNKNOWN_CASE_TYPE',


}

const ERROR_MESSAGES = {
  MUST_BE_LOWERCASE: 'must be lowercase',
  MUST_BE_UPPERCASE: 'must be uppercase',
  MUST_BE_SENTENCE_CASE: 'must be sentence case (first letter uppercase, rest lowercase)',
  MUST_MATCH_EXACTLY_AS_RULE_CASE: 'must match exactly as rule case',
  UNKNOWN_CASE_TYPE: 'unknown case type',

  DOES_NOT_MATCH_REQUIRED_FORMAT: 'does not match required format',
}




module.exports = {
  ERROR_CODES,
  ERROR_MESSAGES
}
