import {formatValidationError, generateValidator, validateConfig} from '../validate-config';
import {expect} from "vitest";

describe('validate-config.js', () => {
  describe('generateValidator (unit)', () => {
    it('returns the validator function when the schema is valid', () => {
      const mockSchema = {
        type: "object",
        properties: {
          header: {type: "string"}
        }
      }
      const key = 'test';

      const result = generateValidator(key, mockSchema);
      expect(result.ok).toBe(true);
      expect(typeof result.data).toBe('function');
    });

    it('informs about the missing schema', () => {
      const mockSchema = null;
      const key = 'test';

      const result = generateValidator(key, mockSchema)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('is corrupted or missing')
        }))
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            meta: expect.objectContaining({
              type: 'internal'
            })
          })
        ]))
    });

    it('informs about an invalid scheme', () => {
      const mockSchema = {
        type: 'unknownType'
      };

      const key = 'test';

      const result = generateValidator(key, mockSchema);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('invalid schema')
        }))
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            meta: expect.objectContaining({
              type: 'internal'
            })
          })
        ]))
    });

    it('marks schema errors as critical', () => {
      const result = generateValidator('test', null);

      expect(result.errors[0].meta.isCritical).toBe(true);
    });
  })


  describe('formatValidationError (unit)', () => {
    it('returns message about missing property error', () => {
      const mockValidatorError = {
        keyword: 'required',
        params: {missingProperty: 'header'},
      }
      const result = formatValidationError(mockValidatorError);
      expect(result).toEqual("Missing property: 'header'");
    });

    it('returns message about unknown property error', () => {
      const mockValidatorError = {
        keyword: 'additionalProperties',
        params: {additionalProperty: 'myProp' },
      }
      const result = formatValidationError(mockValidatorError);
      expect(result).toEqual("Unknown property: 'myProp'");
    });

    it('returns message about expected type error', () => {
      const mockValidatorError = {
        keyword: 'type',
        params: {type: 'object' },
      }
      const result = formatValidationError(mockValidatorError);
      expect(result).toEqual("Expected type: 'object'");
    });

    it('returns message about allowed values for enum error', () => {
      const mockValidatorError = {
        keyword: 'enum',
        params: {
          allowedValues: ['red', 'green', 'blue']
        },
      };
      const result = formatValidationError(mockValidatorError);
      expect(result).toEqual("Allowed values: ['red', 'green', 'blue']");
    });

    it('returns default error message for unknown keyword', () => {
      const mockValidatorError = {
        keyword: 'minItems',
        params: { limit: 1 },
        message: 'must NOT have fewer than 1 items'
      };

      const result = formatValidationError(mockValidatorError);
      expect(result).toEqual('must NOT have fewer than 1 items');
    });

    it('returns undefined when no message and unknown keyword', () => {
      const err = {
        keyword: 'unknown',
        params: {}
      };

      const result = formatValidationError(err);
      expect(result).toContain('Validation error');
    });

    it('handles empty enum values', () => {
      const err = {
        keyword: 'enum',
        params: { allowedValues: [] }
      };

      const result = formatValidationError(err);
      expect(result).toEqual("Allowed values: []");
    });
  });


  describe('validateConfig (unit)', () => {
    interface MockValidator {
      (data: any): boolean;
      errors?: any[];
      schema?: any;
    }

    const mockValidator: MockValidator = (data: any) => {
      if (!data || Object.keys(data).length === 0) {
        mockValidator.errors = [
          {
            keyword: 'required',
            params: { missingProperty: 'header' },
            instancePath: '/header'
          }
        ];
        return false;
      }
      mockValidator.errors = null;
      return true;
    };
    mockValidator.schema = { type: 'object', properties: {} };

    it('should remove $schema before validation', () => {
      const mockConfig = {
        $schema: './schema.json',
        header: 'required'
      };
      const key = 'test';
      const validator = mockValidator;
      validateConfig(key, validator, mockConfig);
      expect(mockConfig).toHaveProperty('$schema');
    });

    it('returns true when config is valid', () => {
      const mockConfig = {
        header: 'required',
      };
      const key = 'test';
      const validator = mockValidator;

      const result = validateConfig(key, validator, mockConfig);
      expect(result.ok).toBe(true);
    });

    it('contains an error about validator is not available', () => {
      const mockConfig = {
        header: 'required',
      };
      const key = 'test';
      const validator = null;

      const result = validateConfig(key, validator, mockConfig);
      expect(result.ok).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({message: expect.stringContaining('Internal error: validator is not available')})
      ]))
    });

    it('contains an error about failed validation', () => {
      const mockConfig = {};
      const key = 'test';
      const validator = mockValidator;

      const result = validateConfig(key, validator, mockConfig);
      expect(result.ok).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({
          meta: expect.objectContaining({type:'validation'})})
      ]))
    });

    it('handles missing validator.errors safely', () => {
      const validator: any = () => false;
      validator.errors = undefined;

      const result = validateConfig('test', validator, {});

      expect(result.ok).toBe(false);
      expect(result.errors).toEqual([]);
    });

    it('ignores errors when validator returns true', () => {
      const validator: any = () => true;
      validator.errors = [{ some: 'error' }];

      const result = validateConfig('test', validator, { a: 1 });

      expect(result.ok).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
})
