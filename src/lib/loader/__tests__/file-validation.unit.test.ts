
jest.mock('../result/report/update-report', () => ({
  _updateReport: jest.fn()
}));

const {
  _updateReport
} = require('../result/report/update-report');

const {
  _createFileValidationSection
} = require('../result/report/file-validation');

describe('_createFileValidationSection', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call update report', () => {

    _createFileValidationSection({
      validations:{
        commit:{
          ok:true,
          issues:[]
        }
      },
      allSettings:{},
      files:[
        {
          name:'commit'
        }
      ],
      reportPath:'/tmp/report.md',
      section:'validations',
      displayMode:'always',
      reportTitle:'commits'
    });

    expect(_updateReport)
      .toHaveBeenCalledTimes(1);

    expect(
      _updateReport.mock.calls[0][0]
        .reportSection
    ).toContain('commit');
  });

});
