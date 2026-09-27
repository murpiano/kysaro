/**
 * Generates merge.schema.json and request.schema.json from commit.schema.json.
 * All message kinds share one settings format.
 *
 * Usage: npm run build:schemas
 */

const fs = require('fs');
const path = require('path');

const SCHEMAS_DIR = path.resolve(__dirname, '../src/settings/schemas');

const DERIVED = {
  merge: {
    title: 'Kysaro merge commit rules',
    description: 'Rules for merge commits: local git merge and the merge button on GitHub.'
  },
  request: {
    title: 'Kysaro pull request rules',
    description: 'Rules for the pull request title (header) and description (body).'
  }
};

function buildSchema(name) {
  const source = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'commit.schema.json'), 'utf8'));

  return {
    ...source,
    ...DERIVED[name]
  };
}

function render(name) {
  return JSON.stringify(buildSchema(name), null, 2) + '\n';
}

function writeSchemas() {
  Object.keys(DERIVED).forEach(name => {
    fs.writeFileSync(path.join(SCHEMAS_DIR, `${name}.schema.json`), render(name));
  });
}

if (require.main === module) {
  writeSchemas();
}

module.exports = {
  render,
  DERIVED,
  SCHEMAS_DIR
};
