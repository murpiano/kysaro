const { ERROR_CATEGORY } = require('../errors-const');

function createBlankLineStep({ value }, path) {
  return (parsed) => {
    if (!value) return null;

    const { raw, ast } = parsed;

    /**
     *'body' | 'footer'
     */
    const section = path[0];

    const bodyRaw = ast.body.raw;
    const footerRaw = ast.footer.raw;

    const lines = raw.split('\n');

    // ----------------------------
    // 🔹 BODY
    // ----------------------------
    if (section === 'body') {

      if (!bodyRaw || bodyRaw.trim() === '') return null;

      // header всегда первая строка
      const headerEndIndex = 0;

      const lineAfterHeader = lines[headerEndIndex + 1];

      if (lineAfterHeader && lineAfterHeader.trim() !== '') {
        return {
          errors: [{
            code: 'BLANK_LINE_REQUIRED',
            message: 'blank line required before body',
            category: ERROR_CATEGORY.FORMAT,
            fixable: false,
            path
          }]
        };
      }
    }

    // ----------------------------
    // 🔹 FOOTER
    // ----------------------------
    if (section === 'footer') {

      if (!footerRaw || footerRaw.trim() === '') return null;
      // ищем начало футера
      const footerStartIndex = lines.findIndex(line => {
        const cleanLine = line.trim();
        const cleanFooter = footerRaw.trim();

        // Проверяем в обе стороны, чтобы не гадать, кто длиннее
        return cleanLine.startsWith(cleanFooter) || cleanFooter.startsWith(cleanLine);
      });


      if (footerStartIndex === -1) return null;

      const prevLine = lines[footerStartIndex - 1];

      if (prevLine && prevLine.trim() !== '') {
        return {
          errors: [{
            code: 'BLANK_LINE_REQUIRED',
            message: 'blank line required before footer',
            category: ERROR_CATEGORY.FORMAT,
            fixable: false,
            path
          }]
        };
      }
    }

    return null;
  };
}

module.exports = { createBlankLineStep };
