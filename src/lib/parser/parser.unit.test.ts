import {describe, expect, it} from 'vitest';
import parseCommit from './index.js';

describe('parser.js (unit)', () => {

  describe('Header Parsing', () => {
    it('should parse correct commit', () => {
      const res = parseCommit('feat(cli): add colors');
      expect(res.ast.header).toMatchObject({
        type: 'feat',
        scope: 'cli',
        subject: 'add colors'
      });
    });

    it('should extract emoji, type and scope', () => {
      const res = parseCommit('✨ feat(api): init');
      expect(res.ast.header.emoji).toBe('✨');
      expect(res.ast.header.type).toBe('feat');
      expect(res.ast.header.scope).toBe('api');
    });

    it('should handle missing scope', () => {
      const res = parseCommit('fix: rescue soul');
      expect(res.ast.header.type).toBe('fix');
      expect(res.ast.header.scope).toBeNull();
      expect(res.ast.header.subject).toBe('rescue soul');
    });
  });

  describe('Body & Footer Separation (non separate line)', () => {
    it('should separate body from footer when no separate line', () => {
      const msg = `feat: header
                  This is the body line
                  BREAKING CHANGE: something broke`;

      const res = parseCommit(msg);
      expect(res.ast.body.raw).toBe('This is the body line');
      expect(res.ast.footer.tokens[0]).toMatchObject({
        key: 'BREAKING CHANGE',
        value: 'something broke'
      });
    });

    it('should parse multiple footer tokens correctly', () => {
      const msg = `refactor: clean up
                  Co-authored-by: Alex
                  Signed-off-by: Bob`;

      const res = parseCommit(msg);
      expect(res.ast.footer.tokens).toHaveLength(2);
      expect(res.ast.footer.tokens[1].key).toBe('Signed-off-by');
    });
  });

  describe('Edge Cases & Errors', () => {
    it('should normalize and ignore comments (#)', () => {
      const msg = `feat: work
                  # This is a git comment
                  Body text`;
      const res = parseCommit(msg);
      expect(res.ast.body.raw).toBe('Body text');
    });

    it('should return error for empty message', () => {
      const res = parseCommit('   ');
      console.log(res)
      expect(res.success).toBe(false);
      expect(res.errors).toContain('Commit message is empty or contains only whitespace');
    });

    it('should handle weird colons in body that look like footers', () => {
      const msg = `feat: log
                  The error was: FileNotFound
                  But this is still body`;
      const res = parseCommit(msg);
      expect(res.ast.footer.tokens).toHaveLength(0);
    });
  });
});
