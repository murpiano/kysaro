
const {
  _stripRuntimeFields
} = require('../strip-runtime-fields');

describe('_stripRuntimeFields', () => {

  test('should return primitive value as is', () => {

    expect(
      _stripRuntimeFields('hello')
    ).toBe('hello');

    expect(
      _stripRuntimeFields(123)
    ).toBe(123);

    expect(
      _stripRuntimeFields(true)
    ).toBe(true);

    expect(
      _stripRuntimeFields(null)
    ).toBe(null);
  });

  test('should remove runtime fields from root object', () => {

    const result = _stripRuntimeFields({
      $schema: 'schema.json',
      title: 'Title',
      description: 'Description',
      preset: 'recommended',
      foo: 'bar'
    });

    expect(result).toEqual({
      foo: 'bar'
    });
  });

  test('should preserve normal root fields', () => {

    const result = _stripRuntimeFields({
      foo: 'bar',
      hello: 'world'
    });

    expect(result).toEqual({
      foo: 'bar',
      hello: 'world'
    });
  });

  test('should not remove runtime fields from nested objects', () => {

    const result = _stripRuntimeFields({
      config: {
        $schema: 'nested.json',
        title: 'Nested',
        description: 'Nested description',
        preset: 'nested-preset'
      }
    });

    expect(result).toEqual({
      config: {
        $schema: 'nested.json',
        title: 'Nested',
        description: 'Nested description',
        preset: 'nested-preset'
      }
    });
  });

  test('should process nested objects recursively', () => {

    const result = _stripRuntimeFields({
      foo: {
        bar: {
          value: 123
        }
      }
    });

    expect(result).toEqual({
      foo: {
        bar: {
          value: 123
        }
      }
    });
  });

  test('should process arrays recursively', () => {

    const result = _stripRuntimeFields({
      items: [
        {
          name: 'first',
          title: 'nested-title'
        },
        {
          name: 'second',
          description: 'nested-description'
        }
      ]
    });

    expect(result).toEqual({
      items: [
        {
          name: 'first',
          title: 'nested-title'
        },
        {
          name: 'second',
          description: 'nested-description'
        }
      ]
    });
  });

  test('should remove runtime fields only from root level', () => {

    const result = _stripRuntimeFields({
      title: 'root-title',
      nested: {
        title: 'nested-title'
      }
    });

    expect(result).toEqual({
      nested: {
        title: 'nested-title'
      }
    });
  });

  test('should return empty object when root contains only runtime fields', () => {

    const result = _stripRuntimeFields({
      $schema: 'schema.json',
      title: 'Title',
      description: 'Description',
      preset: 'recommended'
    });

    expect(result).toEqual({});
  });

  test('should return empty object for empty object input', () => {

    expect(
      _stripRuntimeFields({})
    ).toEqual({});
  });

  test('should return empty array for empty array input', () => {

    expect(
      _stripRuntimeFields([])
    ).toEqual([]);
  });

});
