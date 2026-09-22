const {
  parseMessage,
  applyParser,
  isBreakingToken
} = require('../parser');

describe('parseMessage', () => {

  describe('header', () => {

    test('should parse type, scope and subject', () => {
      const {ast} = parseMessage('feat(cli): add colors');

      expect(ast.header).toEqual({
        raw: 'feat(cli): add colors',
        type: 'feat',
        scope: 'cli',
        breaking: false,
        subject: 'add colors'
      });
    });

    test('should set scope to null when scope is missing', () => {
      const {ast} = parseMessage('fix: rescue soul');

      expect(ast.header.type).toBe('fix');
      expect(ast.header.scope).toBeNull();
      expect(ast.header.subject).toBe('rescue soul');
    });

    test('should set scope to empty string when parentheses are empty', () => {
      const {ast} = parseMessage('fix(): rescue soul');

      expect(ast.header.type).toBe('fix');
      expect(ast.header.scope).toBe('');
    });

    test('should keep multiple scopes as one raw value', () => {
      const {ast} = parseMessage('fix(ui, api): rescue soul');

      expect(ast.header.scope).toBe('ui, api');
    });

    test('should treat header without colon as subject only', () => {
      const {ast} = parseMessage('just text');

      expect(ast.header.type).toBeNull();
      expect(ast.header.scope).toBeNull();
      expect(ast.header.subject).toBe('just text');
    });

    test('should not extract emoji from header', () => {
      const {ast} = parseMessage('✨ feat(api): init');

      expect(ast.header).not.toHaveProperty('emoji');
      expect(ast.header.type).toBe('✨ feat');
    });

    test('should extract breaking change flag "!" from header', () => {
      const {ast} = parseMessage('feat(api)!: drop v1 endpoints');

      expect(ast.header).toEqual(expect.objectContaining({
        type: 'feat',
        scope: 'api',
        breaking: true,
        subject: 'drop v1 endpoints'
      }));
    });

    test('should extract breaking change flag without scope', () => {
      const {ast} = parseMessage('feat!: drop node 18');

      expect(ast.header.type).toBe('feat');
      expect(ast.header.scope).toBeNull();
      expect(ast.header.breaking).toBe(true);
    });
  });

  describe('body and footer', () => {

    test('should return empty body and footer for header only', () => {
      const {ast} = parseMessage('fix: a');

      expect(ast.body).toEqual({raw: '', lines: [], start: null, blankLineBefore: null});
      expect(ast.footer).toEqual({raw: '', lines: [], tokens: [], start: null, blankLineBefore: null});
    });

    test('should ignore trailing newline', () => {
      const {ast} = parseMessage('fix: a\n');

      expect(ast.body.lines).toEqual([]);
      expect(ast.footer.tokens).toEqual([]);
    });

    test('should separate body from footer', () => {
      const {ast} = parseMessage(
        'feat: header\n\nThis is the body line\n\nBREAKING CHANGE: something broke'
      );

      expect(ast.body.lines).toEqual(['This is the body line']);
      expect(ast.footer.tokens).toEqual([
        {key: 'BREAKING CHANGE', separator: ': ', value: 'something broke'}
      ]);
    });

    test('should parse multiple footer tokens', () => {
      const {ast} = parseMessage(
        'refactor: clean up\n\nCo-authored-by: Alex\nSigned-off-by: Bob'
      );

      expect(ast.body.lines).toEqual([]);
      expect(ast.footer.tokens).toEqual([
        {key: 'Co-authored-by', separator: ': ', value: 'Alex'},
        {key: 'Signed-off-by', separator: ': ', value: 'Bob'}
      ]);
    });

    test('should keep colon lines in body when last line is not a footer', () => {
      const {ast} = parseMessage(
        'feat: log\n\nThe error was: FileNotFound\nBut this is still body'
      );

      expect(ast.footer.tokens).toHaveLength(0);
      expect(ast.body.lines).toContain('The error was: FileNotFound');
    });

    test('should keep raw message', () => {
      const message = 'feat: x\n\nbody';

      expect(parseMessage(message).raw).toBe(message);
    });

    test('should parse footer token in "token #value" format', () => {
      const {ast} = parseMessage('fix: x\n\nBody text\n\nCloses #42\nRefs: #7');

      expect(ast.body.lines).toEqual(['Body text']);
      expect(ast.footer.tokens).toEqual([
        {key: 'Closes', separator: ' #', value: '42'},
        {key: 'Refs', separator: ': ', value: '#7'}
      ]);
    });

    test('should parse multi-line footer values', () => {
      const {ast} = parseMessage(
        'feat!: x\n\nBREAKING CHANGE: config moved\nto .kysaro/settings\nRefs: #1'
      );

      expect(ast.footer.tokens).toEqual([
        {key: 'BREAKING CHANGE', separator: ': ', value: 'config moved\nto .kysaro/settings'},
        {key: 'Refs', separator: ': ', value: '#1'}
      ]);
    });

    test('should not include separator blank lines in body', () => {
      const {ast} = parseMessage('feat: x\n\nFirst paragraph\n\nSecond paragraph\n\nRefs: #1\n');

      expect(ast.body.lines).toEqual(['First paragraph', '', 'Second paragraph']);
      expect(ast.body.raw).toBe('First paragraph\n\nSecond paragraph');
      expect(ast.footer.lines).toEqual(['Refs: #1']);
    });

    test('should mark blank lines before body and footer', () => {
      const {ast} = parseMessage('feat: x\n\nBody\n\nRefs: #1');

      expect(ast.body.blankLineBefore).toBe(true);
      expect(ast.footer.blankLineBefore).toBe(true);
    });

    test('should record section start lines', () => {
      const {ast} = parseMessage('feat: x\n\nBody\n\nRefs: #1');

      expect(ast.body.start).toBe(2);
      expect(ast.footer.start).toBe(4);
    });

    test('should detect body glued to header', () => {
      const {ast} = parseMessage('feat: x\nBody right after header');

      expect(ast.body.lines).toEqual(['Body right after header']);
      expect(ast.body.blankLineBefore).toBe(false);
    });

    test('should detect footer glued to body', () => {
      const {ast} = parseMessage('feat: x\n\nBody text\nCloses #42');

      expect(ast.body.lines).toEqual(['Body text']);
      expect(ast.footer.tokens).toEqual([{key: 'Closes', separator: ' #', value: '42'}]);
      expect(ast.footer.blankLineBefore).toBe(false);
    });

    test('should not treat token-like words with spaces as footer', () => {
      const {ast} = parseMessage('feat: x\n\nSee the docs: they explain it');

      expect(ast.footer.tokens).toEqual([]);
      expect(ast.body.lines).toEqual(['See the docs: they explain it']);
    });
  });
});

describe('isBreakingToken', () => {

  test('should accept both breaking change spellings', () => {
    expect(isBreakingToken('BREAKING CHANGE')).toBe(true);
    expect(isBreakingToken('BREAKING-CHANGE')).toBe(true);
    expect(isBreakingToken('Breaking change')).toBe(false);
  });
});

describe('applyParser', () => {

  test('should add parsed message to result', () => {
    const result = applyParser({final: 'fix: a', issues: []});

    expect(result.issues).toEqual([]);
    expect(result.parsed.ast.header.type).toBe('fix');
  });
});
