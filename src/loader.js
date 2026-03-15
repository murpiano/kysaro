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

  try {
    return {
      types: JSON.parse(fs.readFileSync(getFilePath('types.json'), 'utf8')),
      scopes: JSON.parse(fs.readFileSync(getFilePath('scopes.json'), 'utf8')),
      settings: JSON.parse(fs.readFileSync(getFilePath('settings.json'), 'utf8'))
    };
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
