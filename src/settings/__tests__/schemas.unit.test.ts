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

describe('main schema', () => {

  const ajv = new Ajv2020({allErrors: true});
  const validate = ajv.compile(JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'main.schema.json'), 'utf8')));
  const defaults = JSON.parse(fs.readFileSync(path.join(SETTINGS_DIR, 'main', 'main.json'), 'utf8'));

  function settings(change: (main: any) => void) {
    const main = structuredClone(defaults);

    change(main);

    return main;
  }

  function errorPaths(main: any) {
    validate(main);

    return (validate.errors || [])
      .filter((error: any) => error.keyword === 'const')
      .map((error: any) => error.instancePath);
  }

  test('default main.json should match its schema', () => {
    expect(validate(defaults)).toBe(true);
  });

  test('should allow analyzer with validator and one mode enabled', () => {
    expect(validate(settings(main => {
      main.analyzer.enabled = true;
      main.analyzer.correction.enabled = true;
    }))).toBe(true);

    expect(validate(settings(main => {
      main.analyzer.enabled = true;
      main.analyzer.semantic.enabled = true;
    }))).toBe(true);
  });

  test('should reject analyzer when validator is disabled', () => {
    expect(errorPaths(settings(main => {
      main.validator.enabled = false;
      main.analyzer.enabled = true;
      main.analyzer.correction.enabled = true;
    }))).toEqual(['/analyzer/enabled']);
  });

  test('should reject analyzer when correction and semantic are disabled', () => {
    expect(errorPaths(settings(main => {
      main.analyzer.enabled = true;
    }))).toEqual(['/analyzer/enabled']);
  });

  test('should allow fixer with validator enabled', () => {
    expect(validate(settings(main => {
      main.fixer.enabled = true;
    }))).toBe(true);
  });

  test('should reject fixer when validator is disabled', () => {
    expect(errorPaths(settings(main => {
      main.validator.enabled = false;
      main.fixer.enabled = true;
    }))).toEqual(['/fixer/enabled']);
  });

  test('should allow disabled analyzer and fixer without validator', () => {
    expect(validate(settings(main => {
      main.validator.enabled = false;
    }))).toBe(true);
  });
});
