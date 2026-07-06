const fs = require('fs');
const os = require('os');
const path = require('path');


const {
  _updateReport
} = require('../result/report/update-report');

describe('_updateReport', () => {

  let tempDir: string;
  let reportPath: string;

  beforeEach(() => {
    jest.useFakeTimers();

    jest.setSystemTime(
      new Date('2026-06-08T11:00:00')
    );
  });

  afterEach(() => {
    if (tempDir) {
      fs.rmSync(tempDir, {recursive: true, force: true});
    }

    jest.useRealTimers();
  });

  test('should create report file', () => {

    tempDir =
      fs.mkdtempSync(
        path.join(os.tmpdir(), 'report-')
      );

    reportPath =
      path.join(tempDir, 'report.md');

    _updateReport({
      reportPath,
      section: 'settings',
      reportSection: 'content',
      hideIfValid: false,
      hasIssues: true,
      order: 10,
      reportTitle: 'commits'
    });

    expect(
      fs.existsSync(reportPath)
    ).toBe(true);

    expect(
      fs.readFileSync(reportPath, 'utf8')
    ).toMatchSnapshot();
  });

  test('should replace existing section', () => {

    tempDir =
      fs.mkdtempSync(
        path.join(os.tmpdir(), 'report-')
      );

    reportPath =
      path.join(tempDir, 'report.md');

    _updateReport({
      reportPath,
      section: 'settings',
      reportSection: 'old',
      hideIfValid: false,
      hasIssues: true,
      order: 10,
      reportTitle: 'commits'
    });

    _updateReport({
      reportPath,
      section: 'settings',
      reportSection: 'new',
      hideIfValid: false,
      hasIssues: true,
      order: 10,
      reportTitle: 'commits'
    });

    const content =
      fs.readFileSync(reportPath, 'utf8');

    expect(content)
      .toContain('<!-- SECTION:settings ORDER:10 -->\nnew');
  });

});
