

const {
  _normalizeRecommendations,
  _linkedIcon,
  _buildFileLink,
  _formatOriginalError,
  _createArgsBlock,
  _createInfoBlock
} = require('../result/report/utils');

describe('utils', () => {

  test('_normalizeRecommendations', () => {

    expect(
      _normalizeRecommendations('fix')
    ).toContain('fix');

  });

  test('_linkedIcon', () => {

    expect(
      _linkedIcon('✔','file.json')
    ).toBe('[✔](file.json)');

    expect(
      _linkedIcon('✔',null)
    ).toBe('✔');
  });

  test('_buildFileLink', () => {

    expect(
      _buildFileLink(
        '/reports/commit.md',
        '/reports/settings/config.json',
        'config'
      )
    ).toContain('config');

  });

  test('_formatOriginalError syntax', () => {

    expect(
      _formatOriginalError({
        name:'SyntaxError',
        message:'Unexpected token at position 4'
      })
    ).toContain('SyntaxError');
  });

  test('_createArgsBlock', () => {

    expect(
      _createArgsBlock({
        meta:{
          args:['test']
        }
      })
    ).toContain('test');
  });

  test('_createInfoBlock', () => {

    expect(
      _createInfoBlock({
        meta:{
          info:'details'
        }
      }, '')
    ).toContain('details');
  });

});
