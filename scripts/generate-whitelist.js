const fs = require('fs');
const path = require('path');


const validExamples = `
---

## ✅ Valid Examples

### Stage 1: Standard Commit
###### Made in your local branch feat/auth-logic.
\`\`\`text
✨ feat (auth): implement secure password hashing

- ✨ add bcryptjs for password encryption before saving.
- ✨ implement salt generation logic in the user service.
- ✨ update user model to handle encrypted strings.
\`\`\`

### Stage 2: Pull Request
###### When you open the PR on GitHub. Title matches Merge format (no #), Description is > 50 chars.
\`\`\`text
✨ merge (auth): secure password hashing and encryption logic

This pull request integrates bcryptjs for secure password management. It ensures
that all user passwords are encrypted with a unique salt before being stored in
the database, significantly improving security.
\`\`\`

### Stage 3: Merge Commit
###### The result in main after clicking the "Merge" button. GitHub adds the #Number.
\`\`\`text
✨ merge (auth): secure password hashing and encryption logic #42

This pull request integrates bcryptjs for secure password management. It ensures
that all user passwords are encrypted with a unique salt before being stored in
the database, significantly improving security.
\`\`\`

---
`;

const projectRoot = process.cwd();
const rulesDir = path.join(projectRoot, '.bvtrots-dx', 'rules');
const loadJSON = (file) => JSON.parse(fs.readFileSync(path.join(rulesDir, file), 'utf8'));

try {
  const types = loadJSON('types.json');
  const scopes = loadJSON('scopes.json');
  const settings = loadJSON('settings.json');

  let content = '# 📃 Whitelist bvtrots-dx \n\n';

  content += `${validExamples}`;
  content += '## 1. Validation Rules\n\n';
  content += '| Category | Rule | Standard | Pull Request | Merge |\n';
  content += '| :--- | :--- | :---: | :---: | :---: |\n';

  const st = settings.standard_commit;
  const pr = settings.pull_request;
  const mg = settings.merge_commit;

  content += `| **Header** | Length (Min-Max) | ${st.headerMinLength}-${st.headerMaxLength} | ${pr.headerMinLength}-${pr.headerMaxLength} | ${mg.headerMinLength}-${mg.headerMaxLength} |\n`;
  content += `| | Hash #Number | ❌ | ❌ | ${mg.requireHashtagWithNumber ? '✅' : '❌'} |\n`;
  content += `| **Body** | Body Required | ${st.bodyRequired ? '✅' : '❌'} | ${pr.bodyRequired ? '✅' : '❌'} | ${mg.bodyRequired ? '✅' : '❌'} |\n`;
  content += `| | First letter lowercase | ${st.subjectFirstLetterLowerCase ? '✅' : '❌'} | ${pr.subjectFirstLetterLowerCase ? '✅' : '❌'} | ${mg.subjectFirstLetterLowerCase ? '✅' : '❌'} |\n`;
  content += `| | Min Length | ${st.bodyMinLength} | ${pr.bodyMinLength} | ${mg.bodyMinLength} |\n`;
  content += `| | Max Line Length | ${st.bodyMaxLength} | ❌ | ❌ |\n\n`;

  content += '## 2. Allowed Types\n\n';
  content += '| Emoji | Type | Description |\n';
  content += '| :---: | :--- | :--- |\n';
  Object.entries(types).forEach(([key, val]) => {
    content += `| ${val.emoji} | ${key} | ${val.description} |\n`;
  });
  content += '\n';

  content += '## 3. Allowed Scopes\n\n';
  content += '| Scope | Description |\n';
  content += '| :--- | :--- |\n';
  Object.entries(scopes).forEach(([key, val]) => {
    content += `| \`${key}\` | ${val.description} |\n`;
  });


  fs.writeFileSync(path.join(`${rulesDir}/../`, 'whitelist.md'), content);
  console.log('🟢🟢🟢🟢🟢🟢🟢🟢🟢  whitelist.md updated strictly by JSON files.');
} catch (err) {
  console.error('❌ Error:', err.message);
}
