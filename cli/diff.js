const {buildHeader} = require('../src/lib/builder');

function buildSmartDiff(appliedFixes, originalAst, newAst) {
  const changes = [];

  for (const fix of appliedFixes) {
    const path = fix.path;

    const beforeRaw = getByPath(originalAst, path);
    const afterRaw = getByPath(newAst, path);

    let before = beforeRaw;
    let after = afterRaw;

    if (path.length === 1 && path[0] === 'header') {

      before = buildHeader(beforeRaw);
      after = buildHeader(afterRaw);
    }

    if (path.length === 1 && (path[0] === 'body' || path[0] === 'footer')) {

      const isBody = path[0] === 'body';

      const collectStats = (raw) => {
        if (isBody) {
          const lines = raw.lines || [];

          let max = 0;
          lines.forEach(l => { if (l.length > max) max = l.length });

          return {
            lines: lines.length,
            max
          };
        }

        // 🔥 FOOTER
        const tokens = raw.tokens || [];

        const lines = tokens.flatMap(t =>
                                       (`${t.key}: ${t.value}`).split('\n')
        );

        let max = 0;
        lines.forEach(l => { if (l.length > max) max = l.length });

        return {
          tokens: tokens.length,
          lines: lines.length,
          max
        };
      };

      const b = collectStats(beforeRaw);
      const a = collectStats(afterRaw);

      if (isBody) {
        before = `lines: ${b.lines}, maxLineLength: ${b.max}`;
        after  = `lines: ${a.lines}, maxLineLength: ${a.max}`;
      } else {
        before = `tokens: ${b.tokens}, lines: ${b.lines}, maxLineLength: ${b.max}`;
        after  = `tokens: ${a.tokens}, lines: ${a.lines}, maxLineLength: ${a.max}`;
      }
    }


    if (before === after) continue;

    // Применяем "умное" сокращение для длинных строк
    const displayBefore = typeof before === 'string' && before.length > 80
      ? smartSlice(before, 35)
      : before;

    // console.log('before', before)
    // console.log('after', after)

    changes.push({
                   field: path.join('.'),
                   before: displayBefore,
                   after: after
                 });
  }

  return changes;
}


function smartSlice(str, range) {
  // Ищем последний пробел в начале диапазона
  let startIdx = str.lastIndexOf(' ', range);
  if (startIdx === -1) startIdx = range; // Если пробелов нет, режем как есть

  // Ищем первый пробел с конца диапазона
  let endIdx = str.indexOf(' ', str.length - range);
  if (endIdx === -1) endIdx = str.length - range;

  return `${str.slice(0, startIdx)} [...] ${str.slice(endIdx).trim()}`;
}

function getByPath(obj, path) {
  return path.reduce((acc, key) => acc?.[key], obj);
}

module.exports = { buildSmartDiff };
