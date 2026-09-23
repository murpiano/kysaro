const {applyNormalizer} = require('../normalizer');
const defaultMain = require('../../../settings/main/main.json');

const normalize = (message: string, overrides: any = {}) => applyNormalizer(
  {final: message, normalized: message},
  {settings: {main: {normalizer: {...defaultMain.normalizer, ...overrides}}}}
).final;

describe('applyNormalizer', () => {

  test('should remove git comment lines', () => {
    expect(normalize('feat: Add colors\n# Please enter the commit message\n#\n'))
      .toBe('feat: Add colors\n');
  });

  test('should cut everything below the scissors line', () => {
    const message = [
      'feat: Add colors',
      '',
      'Body',
      '# ------------------------ >8 ------------------------',
      '# Do not modify or remove the line above.',
      'diff --git a/file.js b/file.js',
      '+const tooLongLineThatWouldFailValidation = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";'
    ].join('\n');

    expect(normalize(message)).toBe('feat: Add colors\n\nBody\n');
  });

  test('should keep footer references that are not comments', () => {
    expect(normalize('fix: Repair colors\n\nCloses #42')).toBe('fix: Repair colors\n\nCloses #42\n');
  });

  test('should convert CRLF and collapse blank lines', () => {
    expect(normalize('feat: Add colors\r\n\r\n\r\n\r\nBody  \r\n\r\n'))
      .toBe('feat: Add colors\n\nBody\n');
  });

  test('should keep comments when removeComments is disabled', () => {
    expect(normalize('feat: Add colors\n\n#hashtag body', {removeComments: false}))
      .toBe('feat: Add colors\n\n#hashtag body\n');
  });

  test('should return result as is when disabled', () => {
    expect(normalize('  feat: Add colors  ', {enabled: false})).toBe('  feat: Add colors  ');
  });
});
