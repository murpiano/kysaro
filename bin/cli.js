#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const log = (emoji, msg) => console.log(`${emoji} ${msg}`);

try {
  console.log('\n🚀  Starting bvtrots-dx setup...\n');
  const projectRoot = process.cwd();

  const bvtrotsDXDir = path.join(projectRoot, '.bvtrots-dx', 'rules');
  const sourceRulesDir = path.join(__dirname, '../src/rules');

  if (!fs.existsSync(bvtrotsDXDir)) {
    fs.mkdirSync(bvtrotsDXDir, { recursive: true });

    ['types.json', 'scopes.json', 'settings.json'].forEach(file => {
      const src = path.join(sourceRulesDir, file);
      const dest = path.join(bvtrotsDXDir, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    });
    log('🟢 ', 'Created .bvtrots-dx/rules with default templates');
  }

  const userPkgPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(userPkgPath)) {
    const userPkg = JSON.parse(fs.readFileSync(userPkgPath, 'utf8'));
    userPkg.scripts = userPkg.scripts || {};

    userPkg.scripts['sync-docs'] = 'npx bvtrots-sync';

    fs.writeFileSync(userPkgPath, JSON.stringify(userPkg, null, 2));
    log('🟢🟢 ', 'Added "sync-docs" script to package.json');
  }

  const configPath = path.join(projectRoot, '.commitlintrc.js');
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, "module.exports = {\n" +
      "  extends: ['module:bvtrots-dx']\n" +
      "};");
    log('🟢🟢🟢 ', 'Created .commitlintrc.js');
  }

  log('🟢🟢🟢🟢 ', 'Setting up Husky...');
  try {
    execSync('npx husky init', { stdio: 'inherit' });
  } catch (e) {
  }

  const huskyMsgPath = path.join(projectRoot, '.husky', 'commit-msg');
  fs.writeFileSync(huskyMsgPath, 'npx --no -- commitlint --edit "$1"\n');
  log('🟢🟢🟢🟢🟢 ', 'Configured Husky commit-msg hook');

  const huskyPrePath = path.join(projectRoot, '.husky', 'pre-commit');
  const preCommitContent = 'npm run sync-docs && git add .bvtrots-dx/whitelist.md\n';
  fs.writeFileSync(huskyPrePath, preCommitContent);
  log('🟢🟢🟢🟢🟢🟢 ', 'Configured Husky pre-commit hook');

  const workflowDir = path.join(projectRoot, '.github', 'workflows');
  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
  }

  const yamlContent = `name: Lint Commit Messages
on: [pull_request, push]

jobs:
  commitlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npx commitlint --from \${{ github.event.pull_request.base.sha || 'HEAD~1' }} --to \${{ github.event.pull_request.head.sha || 'HEAD' }} --verbose
`;
  fs.writeFileSync(path.join(workflowDir, 'commitlint.yml'), yamlContent);
  log('🟢🟢🟢🟢🟢🟢🟢 ', 'GitHub Action added');

  log('🟢🟢🟢🟢🟢🟢🟢🟢 ', 'Generating initial Whitelist...');
  execSync(`node "${path.join(__dirname, 'sync.js')}"`, { stdio: 'inherit' });

  console.log('\n ✅ All set! Your project is now bvtrots-dx-compliant.');
  console.log('👉  Rules     location: .bvtrots-dx/rules/');
  console.log('👉  Whitelist location: .bvtrots-dx/whitelist.md\n');

} catch (err) {
  console.error('\n❌ Setup failed:', err.message);
  process.exit(1);
}
