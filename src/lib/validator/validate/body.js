const { buildPipeline } = require('../build-pipeline');
const { PART_NAMES, PATH_PARTS } = require('../const');
const { runPipeline } = require('../run-pipeline');

// --------------------------------
// 🔹 utils: paragraphs
// --------------------------------
function getBodyParagraphs(bodyAst) {
  if (!bodyAst || !Array.isArray(bodyAst.lines)) {
    return [];
  }

  const paragraphs = [];
  let currentParagraphLines = [];

  bodyAst.lines.forEach(line => {
    if (line.trim() === '') {
      if (currentParagraphLines.length > 0) {
        const raw = currentParagraphLines.join('\n');
        paragraphs.push({ raw, lines: currentParagraphLines });
        currentParagraphLines = [];
      }
    } else {
      currentParagraphLines.push(line);
    }
  });

  if (currentParagraphLines.length > 0) {
    const raw = currentParagraphLines.join('\n');
    paragraphs.push({ raw, lines: currentParagraphLines });
  }

  return paragraphs;
}

// --------------------------------
// 🔹 main validator
// --------------------------------
function validateBody(rules, parsed, context) {
  const errors = [];
  const { ast } = parsed;
  const { body } = ast;

  // ----------------------------
  // REQUIRED
  // ----------------------------
  const requiredSteps = buildPipeline(
      rules.required,
      PART_NAMES.BODY,
      [PATH_PARTS.BODY],
      context
  );
  errors.push(...runPipeline(requiredSteps, body));

  // ----------------------------
  // BLANK LINE BEFORE BODY
  // ----------------------------
  const blankSteps = buildPipeline(
      rules.blankLineBefore,
      PART_NAMES.BODY,
      [PATH_PARTS.BODY],
      context
  );
  errors.push(...runPipeline(blankSteps, parsed));

  // ----------------------------
  // LINE LENGTH
  // ----------------------------
  const lengthSteps = buildPipeline(
      rules.maxLineLength,
      PART_NAMES.BODY_LINE,
      [PATH_PARTS.BODY],
      context
  );

  // ----------------------------
  // PARAGRAPHS
  // ----------------------------
  const paragraphs = getBodyParagraphs(body);

  if (paragraphs.length > 0) {
    const caseSteps = buildPipeline(
        rules.paragraphCase,
        PART_NAMES.BODY_PARAGRAPH,
        [PATH_PARTS.BODY],
        context
    );

    // 🔥 агрегатор как у lines
    const paragraphErrorsMap = new Map();

    if (caseSteps.length > 0) {
      paragraphs.forEach((paragraphObj, index) => {
        const result = runPipeline(caseSteps, paragraphObj.raw);

        if (!result || result.length === 0) return;

        result.forEach(err => {
          const key = err.code;

          if (!paragraphErrorsMap.has(key)) {
            paragraphErrorsMap.set(key, {
              ...err,
              paragraphs: [],
              path: [PATH_PARTS.BODY],
              fix: {
                ...err.fix,
                target: PART_NAMES.BODY_PARAGRAPH
              }
            });
          }

          paragraphErrorsMap.get(key).paragraphs.push(index);
        });
      });

      errors.push(...Array.from(paragraphErrorsMap.values()));
    }

    // ----------------------------
    // LINE LENGTH (по lines)
    // ----------------------------
    errors.push(...runPipeline(lengthSteps, body.lines));

  } else if (body.lines) {
    errors.push(...runPipeline(lengthSteps, body.lines));
  }

  return errors;
}

module.exports = {
  validateBody,
  getBodyParagraphs
};
