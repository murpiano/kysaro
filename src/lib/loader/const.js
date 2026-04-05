/**
 * @file Loader system constants.
 *
 * @description
 * Centralized constants used across loader and report modules.
 *
 * Includes:
 * - report section registry (order + titles)
 * - normalized section keys
 * - display modes (render strategy)
 * - file extensions for configs and schemas
 * - UI icons used in reports
 *
 * @design
 * - Keeps rendering and pipeline behavior consistent
 * - Avoids magic strings across modules
 *
 * @usedBy
 * - loader pipeline
 * - report generators (settings / validators / validation)
 */

// Defines report sections order and display titles
// Used to control rendering order in final report
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

// Maps uppercase keys → registry keys
// Example: SETTINGS → "settings"
// Used for safer referencing across modules
const REPORT_KEYS = Object.fromEntries(Object.keys(REPORT_REGISTRY).map(key => [key.toUpperCase(), key]));

// Controls report rendering behavior:
//
// ALWAYS        → always render section
// ONLY_ISSUES   → render only if errors/warnings exist
//
// NOTE:
// Compared by value, not boolean flags, to improve readability.
const DISPLAY_MODE = {
  ALWAYS: 'always',
  ONLY_ISSUES: 'only_issues'
};

// File extensions used for loading configuration and schemas
const EXTENSION = {
  JSON   : '.json',
  SCHEMA : '.schema.json'
}

// Icons used in report UI (markdown rendering)
const ICON = {
  OK: '✅',
  ERROR: '❌',
  WARN: '⚠️',
  EMPTY: '➖'
}

module.exports = {REPORT_REGISTRY, REPORT_KEYS, DISPLAY_MODE, EXTENSION, ICON}
