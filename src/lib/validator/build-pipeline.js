const {RULES_REGISTRY}         = require('./rules-registry');

function buildPipeline(rules, field, path) {
  return rules.filter(Boolean).map(ruleConfig => {
    const baseConfig = {
      ...ruleConfig,
      target: ruleConfig.target || field
    };
    return RULES_REGISTRY[ruleConfig.rule](baseConfig, path);
  });
}

module.exports = {buildPipeline};
