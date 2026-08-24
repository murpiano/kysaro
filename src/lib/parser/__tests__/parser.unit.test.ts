const {
  parseMessage,
  applyParser
} = require('../parser');

describe('parseMessage', () => {

  describe('header', () => {

    test('should parse type, scope and subject', () => {
      const {ast} = parseMessage('feat(cli): add colors');

      expect(ast.header).toEqual({
        raw: 'feat(cli): add colors',
        type: 'feat',
        scope: 'cli',
        subject: 'add colors'
      });
    });

    test('should set scope to null when scope is missing', () => {
      const {ast} = parseMessage('fix: rescue soul');

      expect(ast.header.type).toBe('fix');
      expect(ast.header.scope).toBeNull();
      expect(ast.header.subject).toBe('rescue soul');
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

    test.todo('should extract breaking change flag "!" from header');
  });

  describe('body and footer', () => {

    test('should return empty body and footer for header only', () => {
      const {ast} = parseMessage('fix: a');

      expect(ast.body).toEqual({raw: '', lines: []});
      expect(ast.footer).toEqual({raw: '', tokens: []});
    });

    test('should separate body from footer', () => {
      const {ast} = parseMessage(
        'feat: header\n\nThis is the body line\n\nBREAKING CHANGE: something broke'
      );

      expect(ast.body.lines).toContain('This is the body line');
      expect(ast.footer.tokens).toEqual([
        {key: 'BREAKING CHANGE', value: 'something broke'}
      ]);
    });

    test('should parse multiple footer tokens', () => {
      const {ast} = parseMessage(
        'refactor: clean up\n\nCo-authored-by: Alex\nSigned-off-by: Bob'
      );

      expect(ast.footer.tokens).toEqual([
        {key: 'Co-authored-by', value: 'Alex'},
        {key: 'Signed-off-by', value: 'Bob'}
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

    test.todo('should parse footer token in "token #value" format');
    test.todo('should parse multi-line footer values');
    test.todo('should not include separator blank lines in body');
  });
});

describe('applyParser', () => {

  test('should add parsed message to result', () => {
    const result = applyParser({final: 'fix: a', issues: []});

    expect(result.issues).toEqual([]);
    expect(result.parsed.ast.header.type).toBe('fix');
  });
});
