function resolveConflicts(fixes) {
    const hasWrap = fixes.some(
        f => f.fix.type === 'wrap' && f.path[0] === 'body'
    );

    if (!hasWrap) return fixes;

    return fixes.filter(f => {
        if (f.path[0] !== 'body') return true;

        // ❗ убираем ВСЕ paragraph fixes если есть wrap
        if (f.fix.target === 'body-paragraph') return false;

        return true;
    });
}

module.exports = { resolveConflicts };
