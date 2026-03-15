module.exports = (parsed, conf, context) => {
  const { emojiPattern, settings } = context;
  const { emoji, type, body } = parsed;
  const trimmedBody = body ? body.trim() : '';
  const isMergeType = type === 'merge';

  if (conf.bodyRequired && trimmedBody.length === 0) {
    return [false, 'Body is strictly mandatory'];
  }
  if (trimmedBody.length > 0 && trimmedBody.length < conf.bodyMinLength) {
    return [false, `Body too short (${trimmedBody.length}/${conf.bodyMinLength} chars)` ];
  }

  if (trimmedBody.length > 0) {
    const lines = trimmedBody.split('\n').map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
      if (!isMergeType) {
        const st = settings.standard_commit;
        if (line.length > st.bodyLineMaxLength) {
          return [false, `Body line too long (${line.length}/${st.bodyLineMaxLength})` ];
        }

        const dot = st.bodyLineRequireDot ? '\\.' : '';
        const lineRegex = new RegExp(`^- (${emojiPattern})\\s(.+)${dot}$`, 'u');
        const match = line.match(lineRegex);

        if (!match) {
          return [false, `Line format error. Expected: "- ${emoji} lowercase text${st.bodyLineRequireDot ? '.' : ''}"` ];
        }
        if (match[1] !== emoji) {
          return [false, `Body line emoji (${match[1]}) must match header emoji (${emoji})` ];
        }
        if (st.subjectFirstLetterLowerCase && !/^[a-z]/.test(match[2])) {
          return [false, `Body line text must start with lowercase: "${match[2]}"` ];
        }
      } else {
        if (settings.standard_commit.subjectFirstLetterLowerCase && !/^[a-z]/.test(trimmedBody)) {
          return [false, 'Description must start with a lowercase letter'];
        }
      }
    }
  }
  return [true];
};
