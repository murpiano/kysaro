const {toSentenceCase} = require('../text');

describe('toSentenceCase', () => {

  test('should uppercase the first letter only', () => {
    expect(toSentenceCase('user settings file not found')).toBe('User settings file not found');
  });

  test('should return empty string as is', () => {
    expect(toSentenceCase('')).toBe('');
  });

  test('should return non-string value as is', () => {
    expect(toSentenceCase(undefined)).toBeUndefined();
  });

  test('should not print to console', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    toSentenceCase('text');

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
