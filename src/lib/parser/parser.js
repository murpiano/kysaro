/**
 * @file Commit message parser.
 *
 * @description
 * Parses git commit message into structured AST.
 *
 * @architecture
 * header → paragraphs → footer detection → AST
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
 *     breaking,
 *     subject
 *   },
 *   body: {
 *     raw,
 *     lines,
 *     blankLineBefore
 *   },
 *   footer: {
 *     raw,
 *     lines,
 *     tokens[],
 *     blankLineBefore
 *   }
 * }
 *
 * `scope` is `null` when parentheses are absent and `''` when they are empty.
 * `blankLineBefore` is `null` when the section is empty.
 */

const NEWLINE = /\r?\n/u;

/**
 * Footer token line: `Token: value` or `Token #value`.
 * A token has no spaces, except `BREAKING CHANGE`.
 */
const FOOTER_TOKEN = /^(BREAKING CHANGE|[A-Za-z][\w-]*)(: | #)(.*)$/u;

const BREAKING_TOKENS = ['BREAKING CHANGE', 'BREAKING-CHANGE'];

const isBlank = (line) => line.trim() === '';

const parseHeader = (line) => {
    const header = {
        raw: line,
        type: null,
        scope: null,
        breaking: false,
        subject: null
    };

    const colonIndex = line.indexOf(':');

    if (colonIndex === -1) {
        header.subject = line.trim() || null;
        return header;
    }

    let before = line.slice(0, colonIndex).trim();
    const after = line.slice(colonIndex + 1).trim();

    header.subject = after || null;

    if (before.endsWith('!')) {
        header.breaking = true;
        before = before.slice(0, -1).trimEnd();
    }

    const open = before.indexOf('(');
    const close = before.lastIndexOf(')');

    if (open !== -1 && close > open) {
        header.type = before.slice(0, open).trim() || null;
        header.scope = before.slice(open + 1, close).trim();
    } else {
        header.type = before || null;
    }

    return header;
};

const parseFooterToken = (line) => {
    const match = FOOTER_TOKEN.exec(line);

    if (!match) {
        return null;
    }

    const [, key, separator, value] = match;

    return {
        key,
        separator,
        value: value.trim()
    };
};

const isFooterToken = (line) => parseFooterToken(line) !== null;

const parseFooter = (lines) => {
    const tokens = [];
    let current = null;

    lines.forEach(line => {
        const token = parseFooterToken(line);

        if (token) {
            current = token;
            tokens.push(current);
            return;
        }

        if (current) {
            current.value += '\n' + line;
        }
    });

    return tokens;
};

/**
 * Splits lines into paragraphs separated by blank lines.
 *
 * @param {string[]} lines
 * @returns {{start:number, end:number}[]} Inclusive line ranges.
 */
const splitParagraphs = (lines) => {
    const paragraphs = [];
    let start = null;

    lines.forEach((line, index) => {
        if (isBlank(line)) {
            if (start !== null) {
                paragraphs.push({start, end: index - 1});
                start = null;
            }
            return;
        }

        if (start === null) {
            start = index;
        }
    });

    if (start !== null) {
        paragraphs.push({start, end: lines.length - 1});
    }

    return paragraphs;
};

/**
 * Finds the first footer line in the last paragraph.
 *
 * A paragraph that starts with a token is a footer as a whole
 * (continuation lines belong to the previous token). Otherwise only
 * a trailing run of token lines is a footer, glued to the body.
 *
 * @returns {number|null}
 */
const findFooterStart = (lines, paragraph) => {
    if (!paragraph) {
        return null;
    }

    if (isFooterToken(lines[paragraph.start])) {
        return paragraph.start;
    }

    let start = null;

    for (let i = paragraph.end; i > paragraph.start; i--) {
        if (!isFooterToken(lines[i])) {
            break;
        }
        start = i;
    }

    return start;
};

const hasBlankLineBefore = (lines, index) => index > 0 && isBlank(lines[index - 1]);

const parseMessage = (rawMessage) => {
    const lines = String(rawMessage ?? '').split(NEWLINE);

    const ast = {
        header: parseHeader(lines[0] ?? ''),

        body: {
            raw: '',
            lines: [],
            blankLineBefore: null
        },

        footer: {
            raw: '',
            lines: [],
            tokens: [],
            blankLineBefore: null
        }
    };

    const paragraphs = splitParagraphs(lines);
    const content = paragraphs.filter(paragraph => paragraph.end > 0)
        .map(paragraph => ({...paragraph, start: Math.max(paragraph.start, 1)}));

    if (!content.length) {
        return {
            raw: rawMessage,
            ast
        };
    }

    const last = content[content.length - 1];
    const footerStart = findFooterStart(lines, last);
    const bodyStart = content[0].start;
    const bodyEnd = footerStart === null
        ? last.end
        : footerStart === last.start
            ? (content.length > 1 ? content[content.length - 2].end : null)
            : footerStart - 1;

    if (footerStart !== null) {
        const footerLines = lines.slice(footerStart, last.end + 1);

        ast.footer = {
            raw: footerLines.join('\n'),
            lines: footerLines,
            tokens: parseFooter(footerLines),
            blankLineBefore: hasBlankLineBefore(lines, footerStart)
        };
    }

    if (bodyEnd !== null && bodyStart <= bodyEnd && bodyStart !== footerStart) {
        const bodyLines = lines.slice(bodyStart, bodyEnd + 1);

        ast.body = {
            raw: bodyLines.join('\n'),
            lines: bodyLines,
            blankLineBefore: hasBlankLineBefore(lines, bodyStart)
        };
    }

    return {
        raw: rawMessage,
        ast
    };
};

const isBreakingToken = (key) => BREAKING_TOKENS.includes(key);

function applyParser(result) {
    return {
        ...result,
        parsed: parseMessage(result.final)
    };
}

module.exports = {
    parseMessage,
    applyParser,
    isBreakingToken,
    FOOTER_TOKEN
};
