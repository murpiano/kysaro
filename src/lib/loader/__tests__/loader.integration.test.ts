import {beforeEach, describe, expect, it, vi} from 'vitest';
import path from 'path';
import fs from 'fs';
import os from 'os';
import {runLoader} from '../loader';


describe('loader/core.js', () => {
  let tempReportPath: string;
  const fixturesPath = path.resolve(__dirname, './fixtures');

  beforeEach(() => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bvtrots-dx-'));
    tempReportPath = path.join(tempDir, 'LoaderReport.md');

    vi.setSystemTime(new Date('2024-01-01'));
    vi.spyOn(console, 'log').mockImplementation(() => {
    });
  });

  const executeTest = (keys: string[], projectName: string) => {
    const projectPath = path.join(fixturesPath, projectName);

    const paths = {
      user: path.join(projectPath, '.bvtrots-dx', 'settings'),
      default: projectPath
    };

    return runLoader(keys, paths, tempReportPath);
  };

  describe('Configuration Pipeline (integration)', () => {

    it('should return ok:true for valid configuration', () => {
      const key = 'test';
      const result = executeTest([key], 'project-valid');

      expect(result.ok).toBe(true);
      expect(result.settings[key].data).toBeDefined();
      expect(fs.existsSync(tempReportPath)).toBe(true);
    });

    it('should return ok:false for invalid config data', () => {
      const key = 'test';
      const result = executeTest([key], 'project-invalid-config');

      expect(result.ok).toBe(false);
    });

    it('should return ok:false if schema is missing', () => {
      const key = 'test';
      const result = executeTest([key], 'project-missing-schema');

      expect(result.ok).toBe(false);
    });

    it('should return ok:true if only default config is used', () => {
      const key = 'test';
      const result = executeTest([key], 'project-empty-user');

      expect(result.ok).toBe(true);
    });

    it('should return ok:true when only warnings exist', () => {
      const key = 'test';
      const result = executeTest([key], 'project-warning-only');

      expect(result.ok).toBe(true);
    });

    it('should log warning message when warnings exist', () => {
      const key = 'test';
      executeTest([key], 'project-warning-only');


      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Warning configuration detected.')
      );
    });

    it('should log critical error message', () => {
      const key = 'test';
      executeTest([key], 'project-missing-schema');

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Critical configuration error detected.'),
      );
    });

  });

  describe('Loader report snapshots', ()=>{
    const normalizedReport = (report: string) => report
      .replace(/\/tmp\/bvtrots-dx-[^/]+/g, '/tmp/test-dir')
      .replace(/Last update:.*/g, 'Last update: FIXED_DATE');

    it('should generate correct markdown report', () => {
      const key = 'test';
      vi.setSystemTime(new Date('2024-01-01'));
      executeTest([key], 'project-valid');
      const report = fs.readFileSync(tempReportPath, 'utf8');
      const result = normalizedReport(report);
      expect(result).toMatchSnapshot();
    });

    it('should generate correct markdown report, when user settings is missing', () => {
      const key = 'test';
      vi.setSystemTime(new Date('2024-01-01'));
      executeTest([key], 'project-empty-user');
      const report = fs.readFileSync(tempReportPath, 'utf8');
      const result = normalizedReport(report);
      expect(result).toMatchSnapshot();
    });

    it('should generate correct markdown report, when project invalid config', () => {
      const key = 'test';
      vi.setSystemTime(new Date('2024-01-01'));
      executeTest([key], 'project-invalid-config');
      const report = fs.readFileSync(tempReportPath, 'utf8');
      const result = normalizedReport(report);
      expect(result).toMatchSnapshot();
    });

    it('should generate correct markdown report, when user settings and schema are missing', () => {
      const key = 'test';
      vi.setSystemTime(new Date('2024-01-01'));
      executeTest([key], 'project-invalid-config');
      const report = fs.readFileSync(tempReportPath, 'utf8');
      const result = normalizedReport(report);
      expect(result).toMatchSnapshot();
    });

    it('should generate correct markdown report with warning errors only', () => {
      const key = 'test';
      vi.setSystemTime(new Date('2024-01-01'));
      executeTest([key], 'project-warning-only');
      const report = fs.readFileSync(tempReportPath, 'utf8');
      const result = normalizedReport(report);
      expect(result).toMatchSnapshot();
    });
  })

});
