import {
  beforeEach,
  describe,
  expect,
  test,
  vi
} from 'vitest';

vi.mock('../report/update-report', () => ({
  _updateReport: vi.fn()
}));

const {
  _updateReport
} = require('../report/update-report');

const {
  _createFileValidationSection
} = require('../report/file-validation');

describe('_createFileValidationSection', () => {

  beforeEach(() => {
    vi.clearAllMocks();
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
