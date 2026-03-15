const loadConfig = require('./loader');
const validateLogic = require('./validator');

const { types: typesData, scopes: scopesData, settings } = loadConfig();

const emojiMap = Object.fromEntries(Object.entries(typesData).map(([key, val]) => [key, val.emoji]));
const authorizedScopes = Object.keys(scopesData);
const emojiPattern = Object.values(emojiMap).join('|');

const validationContext = { typesData, scopesData, settings, emojiMap, emojiPattern, authorizedScopes };

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
        'bvtrots-dx': (parsed) => validateLogic(parsed, validationContext),
      },
    },
  ],
  rules: {
    'bvtrots-dx': [2, 'always'],
    'body-leading-blank': [2, 'always'],
  },
};
