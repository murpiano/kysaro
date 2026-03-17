const fs = require('fs');
const path = require('path');

module.exports = () => {
  const projectRoot = process.cwd();
  const userRulesPath = path.join(projectRoot, '.bvtrots-dx', 'rules');
  const packageRulesPath = path.join(__dirname, 'rules');

  const getFilePath = (fileName) => {
    const userFile = path.join(userRulesPath, fileName);
    return fs.existsSync(userFile) ? userFile : path.join(packageRulesPath, fileName);
  };

  const normalize = (val) => (typeof val === 'string' ? val.normalize() : val);

  try {
    const rawTypes = JSON.parse(fs.readFileSync(getFilePath('types.json'), 'utf8'));
    const rawScopes = JSON.parse(fs.readFileSync(getFilePath('scopes.json'), 'utf8'));
    const rawSettings = JSON.parse(fs.readFileSync(getFilePath('settings.json'), 'utf8'));

    const types = Object.fromEntries(
      Object.entries(rawTypes).map(([key, value]) => [
        key,
        { ...value, emoji: normalize(value.emoji) }
      ])
    );

    return { types, scopes: rawScopes, settings: rawSettings };

  } catch (err) {

    return {
      types: { feat: { emoji: "✨".normalize() } },
      scopes: { core: { description: "fallback" } },
      settings: {
        standard_commit: { headerMinLength: 20, headerMaxLength: 72, subjectFirstLetterLowerCase: true, bodyRequired: true, bodyMinLength: 20, bodyLineRequireDot: true, bodyMaxLength: 100 },
        pull_request: { headerMinLength: 15, headerMaxLength: 72, bodyRequired: true, bodyMinLength: 50 },
        merge_commit: { headerMinLength: 15, headerMaxLength: 80, requireHashtagWithNumber: true, bodyRequired: true, bodyMinLength: 50 }
      }
    };
  }
};
