
let _createMdReport;
let jsonFileLoad;
let fileValidation;
let validatorCreation;

beforeEach(async () => {
  jest.resetModules();

  jest.doMock('../result/report/json-file-load', () => ({
    _createJsonFileUploadSection: jest.fn()
  }));

  jest.doMock('../result/report/file-validation', () => ({
    _createFileValidationSection: jest.fn()
  }));

  jest.doMock('../result/report/validator-creation', () => ({
    _createValidatorCreationSection: jest.fn()
  }));

  jsonFileLoad =
    await import('../result/report/json-file-load');

  fileValidation =
    await import('../result/report/file-validation');

  validatorCreation =
    await import('../result/report/validator-creation');

  ({ _createMdReport } =
    await import('../result/report/report'));

  jest.clearAllMocks();
});

describe('_createMdReport', () => {

  test('should skip when report disabled', () => {

    _createMdReport(
      { groups:{} },
      [],
      {
        result:{
          report:{
            enabled:false
          }
        }
      }
    );

    expect(
      jsonFileLoad._createJsonFileUploadSection
    ).not.toHaveBeenCalled();
  });

  test('should create all report sections', () => {

    _createMdReport(
      {
        groups:{
          commits:{
            settings:{},
            schemas:{},
            validators:{},
            validations:{}
          }
        }
      },
      [
        {
          group:'commits',
          name:'commit'
        }
      ],
      {
        result:{
          report:{
            enabled:true,
            dir:'/reports'
          }
        }
      }
    );

    expect(
      jsonFileLoad._createJsonFileUploadSection
    ).toHaveBeenCalledTimes(2);

    expect(
      validatorCreation._createValidatorCreationSection
    ).toHaveBeenCalledTimes(1);

    expect(
      fileValidation._createFileValidationSection
    ).toHaveBeenCalledTimes(1);
  });

  test('should skip empty groups', () => {

    _createMdReport(
      {
        groups:{
          commits:{}
        }
      },
      [],
      {
        result:{
          report:{
            enabled:true,
            dir:'/reports'
          }
        }
      }
    );

    expect(
      jsonFileLoad._createJsonFileUploadSection
    ).not.toHaveBeenCalled();
  });

});
