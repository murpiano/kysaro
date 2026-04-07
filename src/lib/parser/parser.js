/**
 * @file Commit message parser.
 *
 * @description
 * Parses raw git commit message into structured AST:
 *
 * 1. Normalizes input (removes comments, trims whitespace)
 * 2. Extracts header (first line)
 * 3. Splits remaining content into body and footer
 * 4. Parses footer into tokens
 *
 * @architecture
 * normalize → header → body/footer split → footer parsing → AST
 *
 * @design
 * - No validation or business logic
 * - No dependency on configuration
 * - Tolerant to malformed input
 * - Uses simple heuristics
 *
 * @responsibility
 * Extracts structure only.
 * Does not validate or interpret input.
 *
 * @ast
 * {
 *   header: { emoji, type, scope, subject },
 *   body: { raw, lines },
 *   footer: { raw, tokens[] }
 * }
 *
 * @footerDetection
 * Footer is detected from bottom-up using heuristics:
 * - lines containing "#123"
 * - lines matching "key: value"
 *
 * Stops when a non-footer-like line is encountered.
 *
 * @errors
 * - Empty or whitespace-only message
 * - Missing header
 *
 * @sideEffects
 * None (pure function)
 */

const NEWLINE = /\r?\n/;

const isEmoji = (char) => {
  return /\p{Extended_Pictographic}/u.test(char);
};

const isEmptyMessage = (raw) => {
  return !raw || raw.trim().length === 0;
};

const normalize = (raw) => {
  return raw
  .split(NEWLINE)
   .filter(line => !line.trim().startsWith('#'))
   .join('\n')
   .trim();
};

const parseHeader = (line) => {
  let rest = line.trim();
  let emoji = null;
  let type = null;
  let scope = null;
  let subject = null;

  const firstChar = [...rest][0];

  if (firstChar && isEmoji(firstChar)) {
    emoji = firstChar;
    rest = [...rest].slice(1).join('').trim();
  }

  const colonIndex = rest.indexOf(':');

  if (colonIndex !== -1) {
    const before = rest.slice(0, colonIndex).trim();
    const after = rest.slice(colonIndex + 1).trim();

    subject = after || null;

    const open = before.indexOf('(');
    const close = before.indexOf(')');

    if (open !== -1 && close !== -1 && close > open) {
      type = before.slice(0, open).trim() || null;
      scope = before.slice(open + 1, close).trim() || null;
    } else {
      type = before || null;
    }
  } else {
    subject = rest || null;
  }

  return {
    raw: line,
    emoji,
    type,
    scope,
    subject
  };
};


const looksLikeFooterStart = (line) => {
  const trimmed = line.trim();

  if (!trimmed) return false;
  if (/#\d+/.test(trimmed)) return true;

  const colonIndex = trimmed.indexOf(':');

  if (colonIndex === -1) return false;

  const key = trimmed.slice(0, colonIndex).trim();

  if (!key) return false;

  if (key.length > 30) return false;

  return true;
};

const parseFooter = (lines) => {
  const tokens = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (looksLikeFooterStart(trimmed)) {
      if (current) tokens.push(current);

      const sepIndex = trimmed.indexOf(':');

      if (sepIndex !== -1) {
        const key = trimmed.slice(0, sepIndex).trim();
        const value = trimmed.slice(sepIndex + 1).trim();

        current = { key, value };
      } else {
        current = { key: 'ref', value: trimmed };
      }
    } else if (current) {
      current.value += '\n' + line;
    }
  }

  if (current) tokens.push(current);

  return {
    raw: lines.join('\n'),
    tokens
  };
};


module.exports = function parseCommit(rawMessage) {
  const result = {
    success: true,
    raw: rawMessage,
    ast: {
      header: null,
      body: { raw: '', lines: [] },
      footer: { raw: '', tokens: [] }
    },
    errors: [],
    warnings: []
  };

  if (isEmptyMessage(rawMessage)) {
    result.success = false;
    result.errors.push('Commit message is empty or contains only whitespace');
    return result;
  }

  const cleaned = normalize(rawMessage);
  const lines = cleaned.split('\n');

  if (!lines.length || !lines[0].trim()) {
    result.success = false;
    result.errors.push('Header is empty');
    return result;
  }

  result.ast.header = parseHeader(lines[0]);

  const rest = lines.slice(1);

  if (!rest.length) return result;

  let footerStart = null;

  for (let i = rest.length - 1; i >= 0; i--) {
    if (looksLikeFooterStart(rest[i])) {
      footerStart = i;
    } else {
      break;
    }
  }

  if (footerStart !== null) {
    const footerLines = rest.slice(footerStart);
    const bodyLines = rest.slice(0, footerStart);

    result.ast.footer = parseFooter(footerLines);
    result.ast.body = {
      raw: bodyLines.join('\n').trim(),
      lines: bodyLines
    };
  } else {
    result.ast.body = {
      raw: rest.join('\n').trim(),
      lines: rest
    };
  }

  return result;
};
