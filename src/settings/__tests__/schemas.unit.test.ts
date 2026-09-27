const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');

const {render, DERIVED, SCHEMAS_DIR} = require('../../../scripts/build-schemas');

const SETTINGS_DIR = path.resolve(__dirname, '..');

describe('message schemas', () => {

  test.each(Object.keys(DERIVED))('%s.schema.json should be generated from commit.schema.json', (name) => {
    expect(fs.readFileSync(path.join(SCHEMAS_DIR, `${name}.schema.json`), 'utf8')).toBe(render(name));
  });

  test.each(['commit', 'merge', 'request'])('default %s.json should match its schema', (name) => {
    const ajv = new Ajv2020({allErrors: true});
    const schema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, `${name}.schema.json`), 'utf8'));
    const settings = JSON.parse(fs.readFileSync(path.join(SETTINGS_DIR, 'commits', `${name}.json`), 'utf8'));
    const validate = ajv.compile(schema);

    expect(validate(settings)).toBe(true);
    expect(validate.errors).toBeNull();
  });
});
