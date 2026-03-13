#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const log = (emoji, msg) => console.log(`${emoji} ${msg}`);

try {
  console.log('\n🚀 Starting bvtrots-commitlint-config setup...\n');

  const configPath = path.join(process.cwd(), '.commitlintrc.js');
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, "module.exports = { extends: ['bvtrots-commitlint-config'] };\n");
    log(' ✅', 'Created .commitlintrc.js');
  }

  log('🐶', 'Setting up Husky...');
  execSync('npx husky init', { stdio: 'inherit' });

  const huskyHookPath = path.join(process.cwd(), '.husky', 'commit-msg');
  fs.writeFileSync(huskyHookPath, 'npx --no -- commitlint --edit "$1"\n');
  log(' ⚓', 'Configured Husky hook');

  const workflowDir = path.join(process.cwd(), '.github', 'workflows');
  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
    log('📁', 'Created .github/workflows directory');
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
  log('🤖', 'GitHub Action added');

  console.log('\n🎉 All set! Your project is now bvtrots-compliant.\n');

} catch (err) {
  console.error('\n❌ Setup failed:', err.message);
  process.exit(1);
}