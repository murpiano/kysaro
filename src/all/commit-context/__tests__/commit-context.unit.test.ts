const {createCommitContext} = require('../commit-context');
const {resolveSourceValues} = require('../resolve-source-values');

describe('resolveSourceValues', () => {

  const resources = {
    types: {feat: {description: 'New feature'}, fix: {description: 'Bug fix'}},
    empty: {}
  };

  test('should allow any value for "any"', () => {
    expect(resolveSourceValues('any', resources)).toBeNull();
  });

  test('should read keys of resource files by base name', () => {
    expect(resolveSourceValues({fromFiles: ['../resources/types.json']}, resources)).toEqual(['feat', 'fix']);
  });

  test('should merge files and inline values', () => {
    expect(resolveSourceValues({fromFiles: ['types.json'], inline: ['wip', 'fix']}, resources))
      .toEqual(['feat', 'fix', 'wip']);
  });

  test('should allow any value when the list is empty', () => {
    expect(resolveSourceValues({fromFiles: ['empty.json']}, resources)).toBeNull();
    expect(resolveSourceValues({fromFiles: ['missing.json']}, resources)).toBeNull();
  });
});

describe('createCommitContext', () => {

  test('should resolve sources of type, scope and footer token', () => {
    const context = createCommitContext({
      main: {},
      commitSettings: {
        header: {
          type: {value: {fromFiles: ['../resources/types.json']}},
          scope: {source: {inline: ['ui']}}
        },
        footer: {token: {source: 'any'}},
        resources: {types: {feat: {}}}
      }
    }, 'standard_commit');

    expect(context.commitType).toBe('standard_commit');
    expect(context.sources).toEqual({types: ['feat'], scopes: ['ui'], tokens: null});
  });
});
