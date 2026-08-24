/**
 * @file Commit message parser.
 *
 * @description
 * Parses git commit message into structured AST.
 *
 * @architecture
 * header → body/footer split → footer parsing → AST
 *
 * @design
 * - No validation
 * - No normalization
 * - No configuration awareness
 * - Tolerant to malformed input
 * - Pure function
 *
 * @responsibility
 * Extracts structure only.
 * Does not validate or mutate input.
 *
 * @ast
 * {
 *   header: {
 *     raw,
 *     type,
 *     scope,
 *     subject
 *   },
 *   body: {
 *     raw,
 *     lines
 *   },
 *   footer: {
 *     raw,
 *     tokens[]
 *   }
 * }
 */

const NEWLINE = /\r?\n/u;

const parseHeader = (line) => {
    let type = null;
    let scope = null;
    let subject = null;

    const colonIndex = line.indexOf(':');

    if (colonIndex !== -1) {
        const before = line.slice(0, colonIndex).trim();
        const after = line.slice(colonIndex + 1).trim();

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
        subject = line.trim() || null;
    }

    return {
        raw: line,
        type,
        scope,
        subject
    };
};

const looksLikeFooterStart = (line) => {
    const trimmed = line.trim();

    if (!trimmed) {
        return false;
    }

    if (/^#\d+$/u.test(trimmed)) {
        return true;
    }

    const colonIndex = trimmed.indexOf(':');

    if (colonIndex === -1) {
        return false;
    }

    const key = trimmed.slice(0, colonIndex).trim();

    if (!key) {
        return false;
    }

    if (key.length > 30) {
        return false;
    }

    return true;
};

const parseFooter = (lines) => {
    const tokens = [];
    let current = null;

    for (const line of lines) {
        const trimmed = line.trim();

        if (looksLikeFooterStart(trimmed)) {
            if (current) {
                tokens.push(current);
            }

            const sepIndex = trimmed.indexOf(':');

            if (sepIndex !== -1) {
                const key = trimmed.slice(0, sepIndex).trim();
                const value = trimmed.slice(sepIndex + 1).trim();

                current = { key, value };
            } else {
                current = {
                    key: 'ref',
                    value: trimmed
                };
            }

            continue;
        }

        if (current) {
            current.value += '\n' + line;
        }
    }

    if (current) {
        tokens.push(current);
    }

    return {
        raw: lines.join('\n'),
        tokens
    };
};

const findFooterStart = (lines) => {
    let footerStart = null;

    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];

        if (!line.trim()) {
            continue;
        }

        if (looksLikeFooterStart(line)) {
            footerStart = i;
            continue;
        }

        break;
    }

    return footerStart;
};

const parseMessage = (rawMessage) => {
    const lines = rawMessage.split(NEWLINE);

    const ast = {
        header: parseHeader(lines[0] ?? ''),

        body: {
            raw: '',
            lines: []
        },

        footer: {
            raw: '',
            tokens: []
        }
    };

    const rest = lines.slice(1);

    if (!rest.length) {
        return {
            raw: rawMessage,
            ast
        };
    }

    const footerStart = findFooterStart(rest);

    if (footerStart !== null) {
        const footerLines = rest.slice(footerStart);
        const bodyLines = rest.slice(0, footerStart);

        ast.footer = parseFooter(footerLines);

        ast.body = {
            raw: bodyLines.join('\n'),
            lines: bodyLines
        };
    } else {
        ast.body = {
            raw: rest.join('\n'),
            lines: rest
        };
    }

    return {
        raw: rawMessage,
        ast
    };
};

function applyParser(result) {
    return {
        ...result,
        parsed: parseMessage(result.final)
    };
}

module.exports = {
    parseMessage,
    applyParser
};
