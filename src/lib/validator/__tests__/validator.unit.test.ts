const {validateMessage, applyValidator} = require('../validator');
const {parseMessage} = require('../../parser');
const defaultCommit = require('../../../settings/commits/commit.json');

const TYPES = ['feat', 'fix', 'docs', 'chore'];

const settings = (overrides: any = {}) => ({
  ...defaultCommit,
  ...overrides,
  header: {...defaultCommit.header, ...(overrides.header || {})},
  body: {...defaultCommit.body, ...(overrides.body || {})},
  footer: {...defaultCommit.footer, ...(overrides.footer || {})},
  breakingChange: {...defaultCommit.breakingChange, ...(overrides.breakingChange || {})}
});

const codes = (message: string, overrides: any = {}, sources: any = {types: TYPES}) =>
  validateMessage(parseMessage(message).ast, settings(overrides), sources)
    .issues.map((issue: any) => issue.code);

describe('validateMessage', () => {

  test('should accept a valid conventional commit', () => {
    expect(codes('feat(cli): Add init command\n\nBody line.\n\nRefs: #12')).toEqual([]);
  });

  test('should create issues in the validator contract', () => {
    const {issues} = validateMessage(parseMessage('bad header').ast, settings(), {types: TYPES});

    expect(issues[0]).toEqual({
      code: 'HEADER_FORMAT',
      message: 'Header must match "type(scope): subject"',
      severity: null,
      source: 'validator',
      category: 'format',
      path: ['header'],
      meta: {expected: 'type(scope): subject'}
    });
  });

  describe('header', () => {

    test.each([
      ['feat:Add colors', 'no space after colon'],
      ['feat : Add colors', 'space before colon'],
      ['feat(ui) : Add colors', 'space before colon with scope'],
      ['feat:  Add colors', 'two spaces after colon'],
      ['just text', 'no type']
    ])('should reject header format: %s (%s)', (message) => {
      expect(codes(message)).toContain('HEADER_FORMAT');
    });

    test('should suggest rebuilt header for recoverable format', () => {
      const {deterministicFixes} = validateMessage(
        parseMessage('feat :Add colors').ast, settings(), {types: TYPES}
      );

      expect(deterministicFixes).toContainEqual(expect.objectContaining({
        type: 'replace', path: ['header'], from: 'feat :Add colors', to: 'feat: Add colors'
      }));
    });

    test('should reject header longer than maxLength', () => {
      expect(codes(`feat: ${'A'.repeat(80)}`)).toContain('HEADER_TOO_LONG');
    });

    test('should accept breaking change flag in header', () => {
      expect(codes('feat(api)!: Drop v1 endpoints')).toEqual([]);
    });
  });

  describe('type', () => {

    test('should accept known type', () => {
      expect(codes('feat: Add colors')).toEqual([]);
    });

    test('should reject type in wrong case', () => {
      expect(codes('FEAT: Add colors')).toEqual(['TYPE_CASE']);
    });

    test('should reject unknown type', () => {
      expect(codes('unknown: Add colors')).toEqual(['TYPE_UNKNOWN']);
    });

    test('should accept any type when source is empty', () => {
      expect(codes('unknown: Add colors', {}, {types: null})).toEqual([]);
    });

    test('should skip unknown type with onUnknown ignore', () => {
      expect(codes('unknown: Add colors', {
        header: {type: {...defaultCommit.header.type, onUnknown: 'ignore'}}
      })).toEqual([]);
    });

    test('should require exact spelling with match-source', () => {
      expect(codes('Feat: Add colors', {
        header: {type: {...defaultCommit.header.type, case: 'match-source'}}
      })).toEqual(['TYPE_CASE']);
    });

    test('should suggest lowercase type fix', () => {
      const {deterministicFixes} = validateMessage(parseMessage('FEAT: Add colors').ast, settings(), {types: TYPES});

      expect(deterministicFixes).toEqual([expect.objectContaining({
        kind: 'deterministic', type: 'lowercase', from: 'FEAT', to: 'feat', rule: 'TYPE_CASE'
      })]);
    });
  });

  describe('scope', () => {

    const scope = (overrides: any) => ({header: {scope: {...defaultCommit.header.scope, ...overrides}}});

    test('should accept empty parentheses when required is false', () => {
      expect(codes('feat(): Add colors')).toEqual([]);
    });

    test('should accept missing scope when required is false', () => {
      expect(codes('feat: Add colors')).toEqual([]);
    });

    test('should reject empty parentheses when allowEmpty is false', () => {
      expect(codes('feat(): Add colors', scope({allowEmpty: false}))).toEqual(['SCOPE_EMPTY']);
    });

    test('should require scope', () => {
      expect(codes('feat: Add colors', scope({required: true}))).toEqual(['SCOPE_REQUIRED']);
    });

    test('should require scope by type condition', () => {
      const when = scope({required: {when: {type: ['feat']}}});

      expect(codes('feat: Add colors', when)).toEqual(['SCOPE_REQUIRED']);
      expect(codes('fix: Repair colors', when)).toEqual([]);
    });

    test('should let notType win over type', () => {
      const when = scope({required: {when: {type: ['feat'], notType: ['feat'], mode: 'or'}}});

      expect(codes('feat: Add colors', when)).toEqual([]);
    });

    test('should require scope by footer token condition', () => {
      const when = scope({required: {when: {tokens: ['BREAKING CHANGE']}}});

      expect(codes('feat: Add colors\n\nBREAKING CHANGE: api changed', when)).toEqual(['SCOPE_REQUIRED']);
      expect(codes('feat: Add colors', when)).toEqual([]);
    });

    test('should accept scope from source', () => {
      expect(codes('feat(ui): Add colors', {}, {types: TYPES, scopes: ['ui', 'api']})).toEqual([]);
    });

    test('should reject unknown scope', () => {
      expect(codes('feat(db): Add colors', {}, {types: TYPES, scopes: ['ui', 'api']})).toEqual(['SCOPE_UNKNOWN']);
    });

    test('should reject scope in wrong case', () => {
      expect(codes('feat(UI): Add colors')).toEqual(['SCOPE_CASE']);
    });

    test('should reject multiple scopes with onMultiple error', () => {
      expect(codes('feat(ui,api): Add colors', scope({onMultiple: 'error'}))).toEqual(['SCOPE_TOO_MANY']);
    });

    test('should take first scope with onMultiple first', () => {
      expect(codes('feat(ui,API): Add colors', scope({onMultiple: 'first'}))).toEqual([]);
    });

    test('should check each scope when multiple scopes are allowed', () => {
      const multiple = scope({multiple: {maxItems: 3}, onMultiple: 'error'});

      expect(codes('feat(ui, api): Add colors', multiple, {types: TYPES, scopes: ['ui', 'api']})).toEqual([]);
      expect(codes('feat(ui, db): Add colors', multiple, {types: TYPES, scopes: ['ui', 'api']})).toEqual(['SCOPE_UNKNOWN']);
    });

    test('should check separator spacing', () => {
      const require = scope({multiple: {maxItems: 3, separatorSpacing: 'require'}});
      const forbid = scope({multiple: {maxItems: 3, separatorSpacing: 'forbid'}});

      expect(codes('feat(ui,api): Add colors', require)).toEqual(['SCOPE_SEPARATOR_SPACING']);
      expect(codes('feat(ui, api): Add colors', forbid)).toEqual(['SCOPE_SEPARATOR_SPACING']);
    });

    test('should reject empty and duplicate scope items', () => {
      const multiple = scope({multiple: {maxItems: 3, unique: true}});

      expect(codes('feat(ui,,api): Add colors', multiple)).toEqual(['SCOPE_EMPTY_ITEM']);
      expect(codes('feat(ui,ui): Add colors', multiple)).toEqual(['SCOPE_DUPLICATE']);
    });

    test.each([
      ['kebab', 'user-profile', 'userProfile'],
      ['camel', 'userProfile', 'user-profile'],
      ['pascal', 'UserProfile', 'userProfile'],
      ['snake', 'user_profile', 'user-profile']
    ])('should check %s case', (caseType, valid, invalid) => {
      expect(codes(`feat(${valid}): Add colors`, scope({case: caseType}))).toEqual([]);
      expect(codes(`feat(${invalid}): Add colors`, scope({case: caseType}))).toEqual(['SCOPE_CASE']);
    });
  });

  describe('subject', () => {

    const subject = (overrides: any) => ({header: {subject: {...defaultCommit.header.subject, ...overrides}}});

    test('should reject missing subject', () => {
      expect(codes('feat:')).toEqual(expect.arrayContaining(['SUBJECT_EMPTY']));
    });

    test('should reject short subject', () => {
      expect(codes('feat: Add')).toEqual(['SUBJECT_TOO_SHORT']);
    });

    test('should require sentence case', () => {
      expect(codes('feat: add colors')).toEqual(['SUBJECT_CASE']);
    });

    test('should keep the rest of the subject as is in sentence case', () => {
      expect(codes('chore: Run tests on Node.js 24 LTS')).toEqual([]);
    });

    test('should check lower case by the first letter', () => {
      expect(codes('feat: add API colors', subject({case: 'lower'}))).toEqual([]);
      expect(codes('feat: Add colors', subject({case: 'lower'}))).toEqual(['SUBJECT_CASE']);
    });

    test('should accept non-latin subject', () => {
      expect(codes('feat: Добавить цвета')).toEqual([]);
    });

    test('should reject trailing period', () => {
      expect(codes('feat: Add colors.')).toEqual(['SUBJECT_TRAILING_PERIOD']);
    });

    test('should allow trailing period when disabled', () => {
      expect(codes('feat: Add colors.', subject({disallowTrailingPeriod: false}))).toEqual([]);
    });
  });

  describe('body', () => {

    test('should require blank line before body', () => {
      expect(codes('feat: Add colors\nBody right after header')).toEqual(['BODY_LEADING_BLANK']);
    });

    test('should reject long body lines with line numbers', () => {
      const {issues} = validateMessage(
        parseMessage(`feat: Add colors\n\nShort line\n${'x'.repeat(73)}`).ast, settings(), {types: TYPES}
      );

      expect(issues).toEqual([expect.objectContaining({
        code: 'BODY_LINE_TOO_LONG',
        meta: {line: 4, length: 73, max: 72}
      })]);
    });

    test('should require body', () => {
      expect(codes('feat: Add colors', {body: {required: true}})).toEqual(['BODY_REQUIRED']);
    });

    test('should limit consecutive empty lines', () => {
      expect(codes('feat: Add colors\n\nOne\n\n\nTwo', {body: {maxConsecutiveEmptyLines: 1}}))
        .toEqual(['BODY_EMPTY_LINES']);
    });
  });

  describe('footer', () => {

    test('should require blank line before footer', () => {
      expect(codes('feat: Add colors\n\nBody text\nCloses #42')).toEqual(['FOOTER_LEADING_BLANK']);
    });

    test('should reject long footer lines', () => {
      expect(codes(`feat: Add colors\n\nRefs: ${'x'.repeat(70)}`)).toEqual(['FOOTER_LINE_TOO_LONG']);
    });

    test('should reject unknown token', () => {
      expect(codes('feat: Add colors\n\nFoo: bar', {}, {types: TYPES, tokens: ['Refs', 'BREAKING CHANGE']}))
        .toEqual(['FOOTER_TOKEN_UNKNOWN']);
    });

    test('should accept BREAKING-CHANGE as BREAKING CHANGE', () => {
      expect(codes('feat: Add colors\n\nBREAKING-CHANGE: api', {}, {types: TYPES, tokens: ['BREAKING CHANGE']}))
        .toEqual([]);
    });

    test('should require token spelling from source', () => {
      expect(codes('feat: Add colors\n\nco-authored-by: Alex', {}, {types: TYPES, tokens: ['Co-authored-by']}))
        .toEqual(['FOOTER_TOKEN_CASE']);
    });

    test('should reject empty footer value', () => {
      expect(codes('feat: Add colors\n\nRefs: #', {footer: {value: {minLength: 2, case: 'any'}}}))
        .toEqual(['FOOTER_VALUE_TOO_SHORT']);
    });

    test('should limit token count and duplicates', () => {
      expect(codes('feat: Add colors\n\nRefs: #1\nRefs: #2', {footer: {multiple: {maxItems: 1}, uniqueTokens: true}}))
        .toEqual(['FOOTER_TOO_MANY', 'FOOTER_DUPLICATE_TOKEN']);
    });

    test('should require footer', () => {
      expect(codes('feat: Add colors', {footer: {required: true}})).toEqual(['FOOTER_REQUIRED']);
    });
  });

  describe('breaking change', () => {

    const breaking = (overrides: any) => ({breakingChange: overrides});

    test('should require "!" in header', () => {
      expect(codes('feat: Add colors', breaking({header: 'require', footer: 'allow'})))
        .toEqual(['BREAKING_HEADER_REQUIRED']);
    });

    test('should forbid "!" in header', () => {
      expect(codes('feat!: Add colors', breaking({header: 'forbid', footer: 'allow'})))
        .toEqual(['BREAKING_HEADER_FORBIDDEN']);
    });

    test('should require and forbid footer token', () => {
      expect(codes('feat: Add colors', breaking({header: 'allow', footer: 'require'})))
        .toEqual(['BREAKING_FOOTER_REQUIRED']);
      expect(codes('feat: Add colors\n\nBREAKING CHANGE: api', breaking({header: 'allow', footer: 'forbid'})))
        .toEqual(['BREAKING_FOOTER_FORBIDDEN']);
    });

    test('should require at least one marker', () => {
      const atLeastOne = breaking({header: 'allow', footer: 'allow', requireAtLeastOne: true});

      expect(codes('feat: Add colors', atLeastOne)).toEqual(['BREAKING_MISSING']);
      expect(codes('feat!: Add colors', atLeastOne)).toEqual([]);
    });
  });
});

describe('applyValidator', () => {

  const context = (validator: any) => ({
    settings: {main: {validator}, commitSettings: settings()},
    sources: {types: TYPES}
  });

  test('should set severity from settings', () => {
    const result = applyValidator(
      {parsed: parseMessage('FEAT: Add colors'), issues: [], deterministicFixes: []},
      context({enabled: true, severity: 'warning'})
    );

    expect(result.issues.map((issue: any) => issue.severity)).toEqual(['warning']);
    expect(result.deterministicFixes).toHaveLength(1);
  });

  test('should skip validation when disabled', () => {
    const input = {parsed: parseMessage('FEAT: Add colors'), issues: [], deterministicFixes: []};

    expect(applyValidator(input, context({enabled: false}))).toBe(input);
  });
});
