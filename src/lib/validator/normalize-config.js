const {RULE_NAME, PART_NAMES} = require('./const');

function normalizeConfig(context) {
  const {commitSettings} = context.config;
  return {
    header: {
      type: [
        {
          rule: RULE_NAME.ENUM,
          value: commitSettings.header.type.value,
          enums: context.validTypes
        },
        // {
        //   rule: RULE_NAME.CASE,
        //   value: commitSettings.header.type.case,
        //   enums: context.validTypes
        // }
      ],

      scope: [
        {
          rule: RULE_NAME.ENUM,
          value: context.VALID_SCOPES
        },
        {
          rule: RULE_NAME.CASE,
          value: commitSettings.header.scope.case,
          enums: context.VALID_SCOPES
        }
      ],

      subject: [
        {
          rule: RULE_NAME.CASE,
          value: commitSettings.header.subject.case
        },
        {
          rule: RULE_NAME.LENGTH,
          value: {min: commitSettings.header.subject.minLength}
        }
      ],

      maxLength: [
        {
          rule: RULE_NAME.LENGTH,
          value: {max: commitSettings.header.maxLength},
          target: PART_NAMES.SUBJECT
        }
      ],

      format: [
        {rule: RULE_NAME.FORMAT, value: commitSettings.header.format}
      ],
    },

    body: {
      required: [
        {rule: RULE_NAME.REQUIRED, value: commitSettings.body.required}
      ],
      blankLineBefore: [
        {rule: RULE_NAME.BLANK_LINE, value: commitSettings.body.blankLineBefore}
      ],
      maxLineLength: [
        {
          rule: RULE_NAME.BODY_LINE_LENGTH,
          value: {max: commitSettings.body.maxLineLength}
        }
      ],
      paragraphCase: [
        {
          rule: RULE_NAME.CASE,
          value: commitSettings.body.paragraphCase,
          target: PART_NAMES.BODY_PARAGRAPH // Указываем цель здесь тоже!
        }
      ]
    },

    footer: {
      required: [
        {rule: RULE_NAME.REQUIRED, value: commitSettings.footer.required}
      ],

      blankLineBefore: [
        {rule: RULE_NAME.BLANK_LINE, value: commitSettings.footer.blankLineBefore}
      ],

      format: [
        {rule: RULE_NAME.FOOTER_FORMAT, value: commitSettings.footer.format}
      ],

      maxLineLength: [
        {
          rule: RULE_NAME.FOOTER_LINE_LENGTH,
          value: {max: commitSettings.footer.maxLineLength},
        }
      ],

      token: [
        {
          rule: RULE_NAME.FOOTER_TOKEN,
          value: context.VALID_TOKENS,
          case: commitSettings.footer.token.case
        }
      ],

      value: [
        {
          rule: RULE_NAME.FOOTER_TOKEN_VALUE,
          rules: [
            {
              rule: RULE_NAME.LENGTH,
              value: { min: commitSettings.footer.value.minLength }
            },
            {
              rule: RULE_NAME.CASE,
              value: commitSettings.footer.value.case
            }
          ]
        }
      ]
    }
  };
}

module.exports = {normalizeConfig};
