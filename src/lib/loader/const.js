const EXTENSION = {
  JSON   : '.json',
  SCHEMA : '.schema.json'
}

const REPORT_REGISTRY = {
  settings: {
    order: 0,
    title: '🔧 Current Settings',
  },
  schemas: {
    order: 1,
    title: '💾 Settings Schemas',
  },
  validators: {
    order: 2,
    title: '👮‍♂️ Validators',
  },
  validations: {
    order: 3,
    title: '🕵️‍♂️ Validation',
  },
};

const DISPLAY_MODE = {
  ALWAYS: 'always',
  ONLY_ISSUES: 'only_issues'
};

const REPORT_KEYS = Object.fromEntries(Object.keys(REPORT_REGISTRY).map(key => [key.toUpperCase(), key]));


const ICON = {
  OK: '✅',
  ERROR: '❌',
  WARN: '⚠️',
  EMPTY: '➖'
}


  module.exports = {REPORT_REGISTRY, REPORT_KEYS, DISPLAY_MODE, EXTENSION, ICON}
