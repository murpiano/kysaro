function applyDeterministicFixes(payload, fixes) {
    const next = { ...payload };

    for (const fix of fixes) {
        if (fix.type === 'replace') {
            next.raw = fix.to;
        }
    }

    return next;
}

module.exports = { applyDeterministicFixes };
