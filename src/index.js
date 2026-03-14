const fs = require('fs');
const path = require('path');

const loadConfig = () => {
  const projectRoot = process.cwd();
  const userRulesPath = path.join(projectRoot, '.bvtrots-dx', 'rules');
  const packageRulesPath = path.join(__dirname, 'rules');

  const getFilePath = (fileName) => {
    const userFile = path.join(userRulesPath, fileName);
    return fs.existsSync(userFile) ? userFile : path.join(packageRulesPath, fileName);
  };

  try {
    const types = JSON.parse(fs.readFileSync(getFilePath('types.json'), 'utf8'));
    const scopes = JSON.parse(fs.readFileSync(getFilePath('scopes.json'), 'utf8'));
    const settings = JSON.parse(fs.readFileSync(getFilePath('settings.json'), 'utf8'));
    return { types, scopes, settings };
  } catch (err) {

    return {
      types: { feat: { emoji: "✨" } },
      scopes: { core: { description: "fallback" } },
      settings: {
        standard_commit: { headerMinLength: 20, headerMaxLength: 72, subjectFirstLetterLowerCase: true, bodyRequired: true, bodyMinLength: 20, bodyLineRequireDot: true, bodyLineMaxLength: 100 },
        pull_request: { headerMinLength: 15, headerMaxLength: 72, bodyRequired: true, bodyMinLength: 50 },
        merge_commit: { headerMinLength: 15, headerMaxLength: 80, requireHashtagWithNumber: true, bodyRequired: true, bodyMinLength: 50 }
      }
    };
  }
};

const { types: typesData, scopes: scopesData, settings } = loadConfig();

const emojiMap = Object.fromEntries(Object.entries(typesData).map(([key, val]) => [key, val.emoji]));
const authorizedScopes = Object.keys(scopesData);
const emojiPattern = Object.values(emojiMap).join('|');

module.exports = {
  parserPreset: {
    parserOpts: {
      headerPattern: new RegExp(`^(${emojiPattern})\\s(\\w+)\\s\\((.*)\\):\\s(.*)$`, 'u'),
      headerCorrespondence: ['emoji', 'type', 'scope', 'subject'],
    },
  },
  plugins: [
    {
      rules: {
        'strict-bvtrots-logic': (parsed) => {
          const { emoji, type, scope, subject, body } = parsed;
          const header = parsed.header || '';
          const trimmedBody = body ? body.trim() : '';

          const isMergeType = type === 'merge';
          const hasHashtag = /#\d+$/.test(header);

          let conf;
          if (isMergeType && hasHashtag) {
            conf = settings.merge_commit;
          } else if (isMergeType) {
            conf = settings.pull_request;
          } else {
            conf = settings.standard_commit;
          }

          if (header.length > conf.headerMaxLength) {
            return [false, `Header too long (${header.length}/${conf.headerMaxLength})` ];
          }
          if (header.length < conf.headerMinLength) {
            return [false, `Header too short (${header.length}/${conf.headerMinLength})` ];
          }

          if (isMergeType && hasHashtag && settings.merge_commit.requireHashtagWithNumber && !hasHashtag) {
            return [false, 'Merge commit must end with #PRNumber'];
          }

          const validTypes = [...Object.keys(emojiMap), 'merge'];
          if (!type || !validTypes.includes(type)) return [false, `Invalid type: ${type}`];
          if (!scope) return [false, 'Scope is mandatory'];

          const customAllowed = isMergeType ? (settings.pull_request.allowCustomScopes || false) : false;
          if (!customAllowed && !authorizedScopes.includes(scope)) {
            return [false, `Scope (${scope}) is not authorized. Check scopes.json` ];
          }

          if (!isMergeType && emojiMap[type] !== emoji) {
            return [false, `Type "${type}" must use emoji ${emojiMap[type]}`];
          }

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
        },
      },
    },
  ],
  rules: {
    'strict-bvtrots-logic': [2, 'always'],
    'body-leading-blank': [2, 'always'],
  },
};