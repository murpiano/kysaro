
jest.mock('../result/report/update-report', () => ({
  _updateReport: jest.fn()
}));

const {
  _updateReport
} = require('../result/report/update-report');

const {
  _createValidatorCreationSection
} = require('../result/report/validator-creation');

describe('_createValidatorCreationSection', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate validator section', () => {

    _createValidatorCreationSection({
      validators:{
        commit:{
          ok:true,
          issues:[]
        }
      },
      files:[
        {
          name:'commit'
        }
      ],
      reportPath:'/tmp/report.md',
      section:'validators',
      displayMode:'always',
      reportTitle:'commits'
    });

    expect(_updateReport)
      .toHaveBeenCalledTimes(1);
  });

});
