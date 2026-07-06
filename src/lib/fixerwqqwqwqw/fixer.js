// src/lib/fixer.js

const { resolveFixChains } = require('./resolve-fix-chains');
const { sortFixes } = require('./sort-fixes');
const { applyFix } = require('./apply-fix');
const { ITERATION_SAFE_LIMIT } = require('./const');
const {resolveConflicts} = require("./resolve-conflicts");

// --------------------------------
// ключ ошибки (для сопоставления)
// --------------------------------
function getErrorKey(err) {
  return JSON.stringify({
    path: err.path,
    code: err.code,
    target: err.fix?.target || null,
    tokens: err.tokens || null,
    lines: err.lines || null,
    paragraphs: err.paragraphs || null,
  });
}

const isSameFix = (a, b) => {
  return (
      JSON.stringify(a.path) === JSON.stringify(b.path) &&
      a.fix?.type === b.fix?.type &&
      a.fix?.target === b.fix?.target &&
      JSON.stringify(a.tokens || []) === JSON.stringify(b.tokens || []) &&
      JSON.stringify(a.lines || []) === JSON.stringify(b.lines || []) &&
      JSON.stringify(a.paragraphs || []) === JSON.stringify(b.paragraphs || [])
  );
};

const fixMessage = (parsed, context, validate) => {
  // Клонируем AST, чтобы не мутировать оригинал
  const current = structuredClone(parsed);
  const allAppliedFixes = [];

  // --------------------------------
  // Сохраняем порядок initial ошибок
  // --------------------------------
  const initialErrors = validate(current, context).errors;
  const errorOrderMap = new Map();

  initialErrors.forEach((err, index) => {
    const key = getErrorKey(err);
    if (!errorOrderMap.has(key)) {
      errorOrderMap.set(key, index);
    }
  });

  // --------------------------------
  // Основной цикл фиксов
  // --------------------------------
  for (let i = 0; i < ITERATION_SAFE_LIMIT; i++) {
    // Получаем список ошибок ДО применения фиксов в этой итерации
    const errorsBeforeFix = validate(current, context).errors;
    const fixableErrors = errorsBeforeFix.filter(e => e.fixable && e.fix);


    if (fixableErrors.length === 0) {
      break;
    }

    const chains = resolveFixChains(fixableErrors);
    let allFixes = Array.from(chains.values()).flat();

    allFixes = resolveConflicts(allFixes);

    // Разделяем WRAP и другие фиксы для правильного порядка применения
    const wrapFixes = allFixes
        .filter(f => f.fix.type === 'wrap')
        .sort((a, b) => {
          const aIndex = a.path[a.path.length - 1];
          const bIndex = b.path[b.path.length - 1];
          return bIndex - aIndex; // Обратный порядок для WRAP
        });

    const otherFixes = allFixes.filter(f => f.fix.type !== 'wrap');
    const orderedOthers = sortFixes(otherFixes);

    let changed = false;

    // Применяем "другие" фиксы (case, slice, replace и т.д.)
    for (const error of orderedOthers) {
      if (applyFix(current.ast, error)) {
        changed = true;
      }
    }

    // Применяем фиксы WRAP (перенос строк)
    for (const error of wrapFixes) {
      if (applyFix(current.ast, error)) {
        changed = true;
      }
    }


    // --------------------------------
    // НОВАЯ ЛОГИКА: Логирование после применения фиксов
    // --------------------------------
    if (changed) {
      // Получаем список ошибок ПОСЛЕ того, как мы применили фиксы.
      // В этом списке останутся только те, что не удалось исправить.
      const errorsAfterFix = validate(current, context).errors;


      const appliedThisIteration = [...orderedOthers, ...wrapFixes];
      // Проходим по списку ошибок, которые мы *пытались* исправить в этой итерации.
      // Если ошибка из списка "ДО" исчезла в списке "ПОСЛЕ", значит она исправлена.
      appliedThisIteration.forEach(fixedError => {
        // Проверяем, осталась ли эта ошибка в новом списке.
        const isStillPresent = errorsAfterFix.some(remainingError =>
            isSameFix(remainingError, fixedError)
        );

        // Если ошибки больше нет в списке, значит она успешно исправлена.
        if (!isStillPresent) {
          // Проверяем, не логировали ли мы её ранее (защита от дублей)
          const existsInLog = allAppliedFixes.some(f => isSameFix(f, fixedError));
          if (!existsInLog) {
            allAppliedFixes.push({
              ...fixedError,
              __order: errorOrderMap.get(getErrorKey(fixedError)) ?? 999
            });
          }
        }
      });
    }

    // Если в этой итерации ничего не изменилось, выходим из цикла
    if (!changed) break;
  }

  // Сортируем все применённые фиксы по их первоначальному порядку в ошибках
  allAppliedFixes.sort((a, b) => a.__order - b.__order);

  // Финальная валидация после всех итераций
  const finalErrors = validate(current, context).errors;

  return {
    ast: current.ast,
    appliedFixes: allAppliedFixes,
    errors: finalErrors
  };
};

module.exports = {
  fixMessage
};
