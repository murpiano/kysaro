const issueModule = require('../../issue');

const {
  _generateValidator,
  _validateSettings
} = require('../validate-settings');

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('_generateValidator', () => {

  test('should return schema corrupted issue when schema is missing', () => {

    jest.spyOn(issueModule, 'createLoaderIssue')
      .mockReturnValue({code: 'SCHEMA_CORRUPTED'});

    const result =
      _generateValidator('settings.json', null);

    expect(result.ok)
      .toBe(false);

    expect(result.issues)
      .toEqual([
        {code: 'SCHEMA_CORRUPTED'}
      ]);
  });

  test('should compile valid schema', () => {

    const schema = {
      type: 'object'
    };

    const result =
      _generateValidator(
        'settings.json',
        schema
      );

    expect(result.ok)
      .toBe(true);

    expect(typeof result.data)
      .toBe('function');

    expect(result.issues)
      .toEqual([]);
  });

  test('should return schema invalid issue when compile throws', () => {

    jest.spyOn(issueModule, 'createLoaderIssue')
      .mockReturnValue({code: 'SCHEMA_INVALID'});

    const invalidSchema = {
      type: 123
    };

    const result =
      _generateValidator(
        'settings.json',
        invalidSchema
      );

    expect(result.ok)
      .toBe(false);

    expect(result.issues)
      .toEqual([
        {code: 'SCHEMA_INVALID'}
      ]);
  });

});

describe('_validateSettings', () => {

  test('should return settings not available issue', () => {

    jest.spyOn(issueModule, 'createLoaderIssue')
      .mockReturnValue({code: 'SETTINGS_NOT_AVAILABLE'});

    const result =
      _validateSettings(
        'settings.json',
        () => true,
        null
      );

    expect(result.ok)
      .toBe(false);

    expect(result.issues)
      .toEqual([
        {code: 'SETTINGS_NOT_AVAILABLE'}
      ]);
  });

  test('should return validator not available issue', () => {

    jest.spyOn(issueModule, 'createLoaderIssue')
      .mockReturnValue({code: 'VALIDATOR_NOT_AVAILABLE'});

    const result =
      _validateSettings(
        'settings.json',
        null,
        {}
      );

    expect(result.ok)
      .toBe(false);

    expect(result.issues)
      .toEqual([
        {code: 'VALIDATOR_NOT_AVAILABLE'}
      ]);
  });

  test('should return success when validator passes', () => {

    const validator = jest.fn(() => true);

    const settings = {
      hello: 'world'
    };

    const result =
      _validateSettings(
        'settings.json',
        validator,
        settings
      );

    expect(result.ok)
      .toBe(true);

    expect(result.issues)
      .toEqual([]);

    expect(validator)
      .toHaveBeenCalledWith(settings);
  });

  test('should create validation issue for every validator error', () => {

    jest.spyOn(
      issueModule,
      'createLoaderValidationIssue'
    )
      .mockImplementation(({error}) => ({
        keyword: error.keyword
      }));

    const validator = jest.fn(() => false);

    // @ts-ignore
    validator.errors = [
      {keyword: 'required'},
      {keyword: 'type'}
    ];

    const result =
      _validateSettings(
        'settings.json',
        validator,
        {}
      );

    expect(result.ok)
      .toBe(false);

    expect(result.issues)
      .toEqual([
        {keyword: 'required'},
        {keyword: 'type'}
      ]);
  });

  test('should handle empty validator errors array', () => {

    const validator = jest.fn(() => false);

    // @ts-ignore
    validator.errors = [];

    const result =
      _validateSettings(
        'settings.json',
        validator,
        {}
      );

    expect(result.ok)
      .toBe(false);

    expect(result.issues)
      .toEqual([]);
  });

});
