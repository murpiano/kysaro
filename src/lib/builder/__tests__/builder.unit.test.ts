const {buildHeader, buildMessage} = require('../builder');
const {parseMessage} = require('../../parser');

describe('buildHeader', () => {

  test('should build header with scope and breaking flag', () => {
    expect(buildHeader({type: 'feat', scope: 'api', breaking: true, subject: 'Drop v1'}))
      .toBe('feat(api)!: Drop v1');
  });

  test('should build header without scope', () => {
    expect(buildHeader({type: 'fix', scope: null, breaking: false, subject: 'Fix it'}))
      .toBe('fix: Fix it');
  });

  test('should keep empty parentheses for empty scope', () => {
    expect(buildHeader({type: 'fix', scope: '', breaking: false, subject: 'Fix it'}))
      .toBe('fix(): Fix it');
  });
});

describe('buildMessage', () => {

  test('should rebuild parsed message', () => {
    const message = 'feat(cli)!: Add init\n\nBody line\n\nBREAKING CHANGE: hooks moved\nCloses #42';

    expect(buildMessage(parseMessage(message).ast)).toBe(message);
  });
});
