const { FIX_TYPES } = require('../../all/const/issue');
const { toSentenceCase } = require('../../utils/utils');
const { PART_NAMES } = require('../validator/const');
const { getBodyParagraphs } = require("../validator/validate/body");

// --------------------------------
// helpers
// --------------------------------

function wrapLine(text, max) {
  if (!text || text.length <= max) return [text];

  const words = text.trim().split(/\s+/);
  const lines = [];
  let current = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if ((current + ' ' + word).length <= max) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }

  lines.push(current);
  return lines;
}

const getByPath = (obj, path) =>
    path.reduce((acc, key) => acc?.[key], obj);

const setByPath = (obj, path, value) => {
  const lastKey = path[path.length - 1];
  const parent = path.slice(0, -1).reduce((acc, key) => acc[key], obj);
  parent[lastKey] = value;
};

function applyStringFix(currentValue, fix) {
  let newValue = currentValue;

  switch (fix.type) {
    case FIX_TYPES.LOWERCASE:
      newValue = currentValue.toLowerCase();
      break;
    case FIX_TYPES.UPPERCASE:
      newValue = currentValue.toUpperCase();
      break;
    case FIX_TYPES.SENTENCE_CASE:
      newValue = toSentenceCase(currentValue);
      break;
    case FIX_TYPES.TRIM:
      newValue = currentValue.trim();
      break;
    case FIX_TYPES.REPLACE:
      if (fix.payload) newValue = fix.payload;
      break;
    case FIX_TYPES.SLICE:
      if (typeof fix.payload === 'number') {
        newValue = currentValue.slice(0, fix.payload);
      }
      break;
    default:
      return { changed: false };
  }

  return { changed: newValue !== currentValue, newValue };
}

function processTokens(tokens, indexes, fix, isValueFix = false) {
  let changed = false;

  indexes.forEach(i => {
    const token = tokens[i];
    if (!token) return;

    const currentValue = isValueFix ? token.value : token.key;
    const { changed: wasChanged, newValue } = applyStringFix(currentValue, fix);

    if (wasChanged) {
      if (isValueFix) {
        token.value = newValue;
      } else {
        token.key = newValue;
      }
      changed = true;
    }
  });

  return changed;
}

// --------------------------------
// main
// --------------------------------

const applyFix = (ast, error) => {
  const { path, fix } = error;

  // ========================================
  // HEADER: maxLength → режем SUBJECT
  // ========================================
  if (fix.type === FIX_TYPES.SLICE && fix.target === PART_NAMES.SUBJECT) {
    const { type, scope, subject } = ast.header;
    const base = scope ? `${type}(${scope}): ` : `${type}: `;
    const allowed = fix.payload - base.length;

    if (allowed <= 0) return false;

    const newSubject = subject.slice(0, allowed);
    if (newSubject === subject) return false;

    ast.header.subject = newSubject;
    return true;
  }

  // ========================================
  // BODY: WRAP
  // ========================================
  if (fix.type === FIX_TYPES.WRAP && fix.target === 'body') {
    const { max } = fix.payload;
    const newLines = ast.body.lines.flatMap(line => wrapLine(line, max));

    if (JSON.stringify(newLines) === JSON.stringify(ast.body.lines)) {
      return false;
    }

    ast.body.lines = newLines;
    return true;
  }

  // ========================================
  // BODY: PARAGRAPH FIX (НОВАЯ ЛОГИКА)
  // ========================================
  if (
      fix.target === PART_NAMES.BODY_PARAGRAPH &&
      path[0] === 'body' &&
      Array.isArray(error.paragraphs)
  ) {
    if (!Array.isArray(ast.body?.lines)) return false;

    const paragraphs = getBodyParagraphs(ast.body);

    let changed = false;

    error.paragraphs.forEach(index => {
      if (index < 0 || index >= paragraphs.length) return;

      const targetParagraph = paragraphs[index];
      const { raw, lines } = targetParagraph;

      const { changed: wasChanged, newValue } = applyStringFix(raw, fix);
      if (!wasChanged) return;

      const startIndex = ast.body.lines.indexOf(lines[0]);
      if (startIndex === -1) return;

      const newLines = newValue.split('\n');

      ast.body.lines.splice(startIndex, lines.length, ...newLines);

      changed = true;
    });

    return changed;
  }

  // ========================================
  // FOOTER: WRAP
  // ========================================
  if (fix.type === FIX_TYPES.WRAP && path[0] === 'footer') {
    const { max } = fix.payload;
    let changed = false;

    ast.footer.tokens = ast.footer.tokens.map(token => {
      const prefix = `${token.key}: `;
      const allowed = max - prefix.length;

      const wrapped = wrapLine(token.value, allowed);

      if (wrapped.length === 1) return token;

      changed = true;

      return {
        ...token,
        value: wrapped.join('\n')
      };
    });

    return changed;
  }

  // ========================================
  // FOOTER TOKEN FIX
  // ========================================
  const isTokenFix =
      path[0] === 'footer' &&
      Array.isArray(ast.footer?.tokens) &&
      error.tokens &&
      [PART_NAMES.TOKEN, PART_NAMES.TOKEN_VALUE].includes(fix.target);

  if (isTokenFix) {
    const isValueFix = fix.target === PART_NAMES.TOKEN_VALUE;
    return processTokens(
        ast.footer.tokens,
        error.tokens,
        fix,
        isValueFix
    );
  }

  // ========================================
  // GENERIC FIX
  // ========================================
  const currentValue = getByPath(ast, path);

  if (typeof currentValue !== 'string') return false;

  const { changed, newValue } = applyStringFix(currentValue, fix);

  if (!changed) return false;

  setByPath(ast, path, newValue);
  return true;
};

module.exports = { applyFix };
