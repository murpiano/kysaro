module.exports = {
  parserPreset: {
    parserOpts: {
      headerPattern: /^(✨|💊|♻️|🎨|⚙️|🔧|📝)\s(\w+)(?::\s)?\s*(.*)$/u,
      headerCorrespondence: ['emoji', 'type', 'subject'],
    },
  },
  plugins: [
    {
      rules: {
        'strict-bvtrots-logic': (parsed) => {
          const { emoji, type, subject, body } = parsed;
          const emojiMap = {
            feat: '✨',
            fix: '💊',
            refactor: '♻️',
            style: '🎨',
            build: '⚙️',
            chore: '🔧',
            docs: '📝',
          };

          const validTypes = [...Object.keys(emojiMap), 'merge'];

          if (!type || !validTypes.includes(type)) {
            return [false, `Type must be one of: ${validTypes.join(', ')}` ];
          }
          if (type !== type.toLowerCase()) {
            return [false, `Type "${type}" must be strictly lowercase` ];
          }

          if (type !== 'merge' && emojiMap[type] !== emoji) {
            return [false, `Type "${type}" must use emoji ${emojiMap[type]}`];
          }

          if (!body || body.trim().length === 0) {
            return [false, 'Body is strictly mandatory for all commits'];
          }
          const trimmedBody = body.trim();

          if (type === 'merge') {
            if (trimmedBody.length < 50) {
              return [false, `Merge body must be at least 50 chars (current: ${trimmedBody.length})` ];
            }
            return [true];
          }

          if (!subject || subject.trim().length === 0) {
            return [false, 'Subject is mandatory'];
          }

          if (!/^[a-z]/.test(subject)) {
            return [false, `Subject must start with a lowercase letter`];
          }

          const emojiOrder = Object.values(emojiMap);
          const lines = trimmedBody.split('\n').map(l => l.trim()).filter(l => l !== '');

          let lastPriority = -1;
          for (const line of lines) {
            const lineMatch = line.match(/^- (✨|💊|♻️|🎨|⚙️|🔧|📝)\s(.+)\.$/u);

            if (!lineMatch) {
              return [false, `Line format error: "- [emoji] [text]." (Check emoji, space, and trailing dot) in: "${line}"` ];
            }

            const [_, lineEmoji, lineContent] = lineMatch;

            if (!/^[a-z]/.test(lineContent)) {
              return [false, `Body text must start with lowercase: "${lineContent}"`];
            }

            const currentPriority = emojiOrder.indexOf(lineEmoji);
            if (currentPriority === -1) {
              return [false, `Emoji "${lineEmoji}" is not allowed in body (use whitelist)`];
            }

            if (currentPriority < lastPriority) {
              return [false, `Hierarchy violation: ${lineEmoji} cannot follow ${emojiOrder[lastPriority]}`];
            }
            lastPriority = currentPriority;
          }

          return [true];
        },
      },
    },
  ],
  rules: {
    'strict-bvtrots-logic': [2, 'always'],
    'header-max-length': [2, 'always', 72],
    'body-leading-blank': [2, 'always'],
    'subject-case': [0],
    'type-case': [0],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
  },
};