# Changelog

All notable changes to this project are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- The `commit-msg` hook prints two lines: the message is invalid, and the path of `.kysaro/report.md`. Every problem, the suggested message and the fix commands stay in the report. `kysaro ci` and `kysaro --range` still print every problem, because a log is all they have.
- The report points at the part of the header that has the problem with a `^^^` line under it, and ends with the kind of the message and the settings file the rules came from. The check time and the count of checked messages are gone from a report of a single message.

## [0.2.1] - 2026-09-30

### Fixed

- Default settings distributed by `kysaro init` now correctly use lowercase subject case (Conventional Commits standard).

## [0.2.0] - 2026-09-27

### Changed

- Repository history was rewritten to a single author identity, and the project moved to a repository created on the same date as its first commit. Build provenance points to this repository.

### Breaking changes

- The default preset follows Conventional Commits in the subject case: the subject starts with a lowercase letter (`feat: add dark theme`), in commits, merge commits and pull requests. Settings copied by `kysaro init` keep `"case": "sentence"`; to keep the old rule without them, set `header.subject.case` to `sentence`.

### Fixed

- `lower` and `sentence` subject case accept a first word with more capitals, like `API`, `GitHub` or `iOS`, and no longer suggest `aPI`.

## [0.2.0] - 2026-09-27

### Breaking changes

- Merge commits are checked by `merge.json` instead of being skipped. The default git message `Merge branch 'x'` is rejected. To skip merge commits as before, set `ignore.kinds` to `["merge", "revert"]` in `main.json`.
- `merge.json` and `request.json` use the `commit.json` format. Files in the old format fall back to the package defaults with a warning; run `npx kysaro init --force` to replace them.
- `kysaro init` sets up everything at once; `--settings` is no longer needed.

### Added

- `kysaro ci` checks, in GitHub Actions, the title, description and commits of every pull request and the commits of every push to any branch.
- `kysaro --range <base>..<head>` checks every commit of a range. Merge commits are checked by `merge.json`; `fixup!`, `squash!` and `amend!` commits fail.
- `.kysaro/report.md` with the problems, a suggested message and the commands to fix it after every check; the same report in the GitHub job summary.
- `kysaro init` creates `.github/workflows/kysaro.yml`.
- `header.reference` allows, requires or forbids the ` (#123)` suffix that GitHub adds on merge and squash.
- `body.minLength`; `maxLineLength: 0` turns the line length check off.
- `createLinter()` loads settings once for many checks; results report `kind` and `rules`.

## [0.1.1] - 2026-09-26

### Changed

- Build provenance points to the current repository history. The history of 0.1.0 was rewritten after its release.
- The release workflow skips versions that are already on npm and releases that already exist.
- CI skips the commit message check after a force-push.

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

[0.2.1]: https://github.com/murpiano/kysaro/releases/tag/v0.2.1
[0.2.0]: https://github.com/murpiano/kysaro/releases/tag/v0.2.0
[0.1.1]: https://github.com/murpiano/kysaro/releases/tag/v0.1.1
[0.1.0]: https://github.com/murpiano/kysaro/releases/tag/v0.1.0
