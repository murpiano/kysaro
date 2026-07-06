function resolveFixChains(errors) {
  const map = new Map();

  for (const err of errors) {
    if (!err.fix) continue;

    const keyParts = [
      err.path.join('.'),
      err.fix.target || '',
      err.paragraphIndex ?? '',
      err.tokens ? `tokens:${err.tokens.join(',')}` : '',
      err.lines ? `lines:${err.lines.join(',')}` : ''
    ];

    const key = keyParts.join('|');

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key).push(err);
  }

  return map;
}

module.exports = { resolveFixChains };
