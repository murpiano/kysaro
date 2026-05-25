const _STATE_KEY = {
  SETTINGS: 'settings',
  SCHEMAS: 'schemas',
  VALIDATORS: 'validators',
  VALIDATIONS: 'validations',
}

const _REPORT_KEY = _STATE_KEY;

const _DISPLAY_MODE = {
  ALWAYS: 'always',
  ONLY_ISSUES: 'only_issues'
};

const _FILE_KEY_NAME = {
  NAME: 'name',
  FILE: 'file',
  SCHEMA: 'schema'
}

const _ICON = {
  OK: '✅',
  ERROR: '❌',
  WARN: '⚠️',
  EMPTY: '➖'
}

const _REPORT_REGISTRY = {
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


module.exports = {
  _STATE_KEY,
  _REPORT_KEY,
  _DISPLAY_MODE,
  _FILE_KEY_NAME,
  _ICON,
  _REPORT_REGISTRY,
}
