function applyNormalizer(result, context) {
    const rules = context.settings.main.normalizer;

    if (rules.enabled === false || result.final === '') {
        return result;
    }

    let normalized = String(result.final);

    /*
     * ---------------------------------------------------------
     * EOL NORMALIZATION
     * ---------------------------------------------------------
     */

    if (rules.eol === 'lf') {
        normalized = normalized
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n');
    } else if (rules.eol === 'crlf') {
        normalized = normalized
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n/g, '\r\n');
    }

    const eol = rules.eol === 'crlf'
        ? '\r\n'
        : '\n';

    /*
     * ---------------------------------------------------------
     * SPLIT INTO LINES
     * ---------------------------------------------------------
     */

    let lines = normalized.split(/\r?\n/);

    /*
     * ---------------------------------------------------------
     * REMOVE COMMENTS
     * git-style comment lines
     * ---------------------------------------------------------
     */

    if (rules.removeComments) {
        lines = lines.map(line => {
            return line.trimStart().startsWith('#')
                ? ''
                : line;
        });
    }

    /*
     * ---------------------------------------------------------
     * CANONICALIZE BLANK LINES
     * whitespace-only lines become true blank lines
     * ---------------------------------------------------------
     */

    lines = lines.map(line => {
        return line.trim() === ''
            ? ''
            : line;
    });

    /*
     * ---------------------------------------------------------
     * TRIM LINES
     * ---------------------------------------------------------
     */

    if (rules.trimLines) {
        lines = lines.map(line => {
            return line.replace(
                /^[^\S\r\n]+|[^\S\r\n]+$/gu,
                ''
            );
        });
    }

    /*
     * ---------------------------------------------------------
     * BLANK LINES
     * ---------------------------------------------------------
     */

    if (rules.blankLines) {
        const {
            maxConsecutive,
            trimStart,
            trimEnd
        } = rules.blankLines;

        /*
         * remove blank lines at start
         */

        if (trimStart) {
            while (
                lines.length &&
                lines[0] === ''
                ) {
                lines.shift();
            }
        }

        /*
         * remove blank lines at end
         */

        if (trimEnd) {
            while (
                lines.length &&
                lines[lines.length - 1] === ''
                ) {
                lines.pop();
            }
        }

        /*
         * limit consecutive blank lines
         * ONLY inside content area
         */

        if (typeof maxConsecutive === 'number') {
            const firstNonBlank = lines.findIndex(
                line => line !== ''
            );

            const lastNonBlank = (() => {
                for (
                    let i = lines.length - 1;
                    i >= 0;
                    i--
                ) {
                    if (lines[i] !== '') {
                        return i;
                    }
                }

                return -1;
            })();

            if (
                firstNonBlank !== -1 &&
                lastNonBlank !== -1
            ) {
                const resultLines = [];

                /*
                 * preserve start area
                 */

                for (
                    let i = 0;
                    i < firstNonBlank;
                    i++
                ) {
                    resultLines.push(lines[i]);
                }

                /*
                 * normalize middle area
                 */

                let blankCount = 0;

                for (
                    let i = firstNonBlank;
                    i <= lastNonBlank;
                    i++
                ) {
                    const line = lines[i];

                    if (line === '') {
                        blankCount++;

                        if (
                            blankCount <= maxConsecutive
                        ) {
                            resultLines.push('');
                        }
                    } else {
                        blankCount = 0;
                        resultLines.push(line);
                    }
                }

                /*
                 * preserve end area
                 */

                for (
                    let i = lastNonBlank + 1;
                    i < lines.length;
                    i++
                ) {
                    resultLines.push(lines[i]);
                }

                lines = resultLines;
            }
        }
    }

    /*
     * ---------------------------------------------------------
     * JOIN LINES
     * ---------------------------------------------------------
     */

    normalized = lines.join(eol);

    /*
     * ---------------------------------------------------------
     * TRIM WHOLE MESSAGE
     * removes spaces/tabs ONLY at document boundaries
     * preserves line breaks
     * ---------------------------------------------------------
     */

    if (rules.trimMessage) {
        normalized = normalized
            .replace(/^[^\S\r\n]+/u, '')
            .replace(/[^\S\r\n]+$/u, '');
    }

    /*
     * ---------------------------------------------------------
     * FINAL NEWLINE
     * ---------------------------------------------------------
     */

    if (rules.ensureFinalNewline) {
        if (!normalized.endsWith(eol)) {
            normalized += eol;
        }
    }

    return {
        ...result,
        normalized,
        final: normalized
    };
}

module.exports = {
    applyNormalizer
};
