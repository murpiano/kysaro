
jest.mock('../result/report/update-report', () => ({
  _updateReport: jest.fn()
}));

const {
  _updateReport
} = require('../result/report/update-report');

const {
  _createJsonFileLoadSection
} = require('../result/report/json-file-load');

describe('_createJsonFileLoadSection', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate report section', () => {

    _createJsonFileLoadSection({
      allSettings:{
        commit:{
          ok:true,
          issues:[]
        }
      },
      files:[
        {
          name:'commit',
          file:{}
        }
      ],
      targetType:'file',
      reportPath:'/tmp/report.md',
      section:'settings',
      displayMode:'always',
      reportTitle:'commits'
    });

    expect(_updateReport)
      .toHaveBeenCalledTimes(1);
  });

});
