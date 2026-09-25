# Changelog

All notable changes to this project are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-09-25

First public release.

### Added

- `kysaro <file>` checks a commit message file from the `commit-msg` hook. Messages also come from `-m <message>` or stdin.
- Exit codes: `0` for valid or ignored messages, `1` for invalid messages, `2` for wrong arguments or broken settings.
- `kysaro init` installs the `commit-msg` hook into `.husky` or the git hooks directory.
- `kysaro init --settings` copies the default settings into `.kysaro/settings` with `$schema` links for IDE autocomplete.
- Rules for the header, type, scope, subject, body, footer and breaking change markers, configured in `commit.json`.
- Conventional Commits preset: types, footer tokens, 72-character lines, sentence case subject without a trailing period.
- Parser for `type(scope)!: subject`, `Token: value` and `Token #value` footers and multi-line footer values.
- Cleanup before validation: comments, the `git commit -v` diff, extra blank lines and spaces around lines.
- Merge commits, `git revert` messages and `fixup!`, `squash!`, `amend!` commits are skipped.
- Suggested header for case and punctuation issues.
- Node.js API: `lint()`, `pipeline()`, `parseMessage()` and TypeScript declarations.
- JSON Schemas for every settings file.

### Not included yet

- Pull request and merge commit rules (`request.json`, `merge.json`).
- The `fixer`, `analyzer` and `generator` stages.

[0.1.0]: https://github.com/murpiano/kysaro/releases/tag/v0.1.0
