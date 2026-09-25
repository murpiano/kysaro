# kysaro

[![npm](https://img.shields.io/npm/v/kysaro)](https://www.npmjs.com/package/kysaro)
[![CI](https://github.com/bvtrots/kysaro/actions/workflows/ci.yml/badge.svg)](https://github.com/bvtrots/kysaro/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Strict commit message linter. Kysaro checks every commit message before it reaches the history and blocks the commit when the message breaks the rules.

- [Conventional Commits](https://www.conventionalcommits.org/) out of the box.
- Rules live in JSON files with JSON Schemas: your IDE autocompletes every option and highlights mistakes while you edit them.
- No commitlint, no plugins: one package, one `commit-msg` hook.
- Clear output with line numbers and a suggested header.

```text
$ git commit -m "feat(UI): add dark theme."
[kysaro] ✖ Commit message is invalid

  feat(UI): add dark theme.

  ✖ Scope "UI" must be in lower case  header.scope
  ✖ Subject must start with an uppercase letter  header.subject
  ✖ Subject must not end with a period  header.subject

  Suggested header: feat(ui): Add dark theme
```

## Requirements

Node.js 20 or later and git.

## Quick start

```sh
npm install --save-dev kysaro
npx kysaro init
```

`kysaro init` installs a `commit-msg` hook. If the project uses [husky](https://typicode.github.io/husky/) (has a `.husky` directory), the hook goes to `.husky/commit-msg`, otherwise to `.git/hooks/commit-msg`. The hook runs:

```sh
npx --no -- kysaro "$1"
```

Hooks in `.git/hooks` are not shared through the repository. Use husky when the whole team needs the hook.

To customize the rules, copy the default settings into the project:

```sh
npx kysaro init --settings
```

This creates `.kysaro/settings` and adds `.kysaro/*.md` (settings reports) to `.gitignore`. Commit `.kysaro/settings` so the whole team shares the rules.

## Message format

The default preset follows Conventional Commits with a few strict additions:

```text
type(scope)!: Subject in sentence case

Optional body. Separated from the header by a blank line.
Lines are at most 72 characters.

BREAKING CHANGE: description of the change
Refs: #42
```

| Part | Default rule |
|---|---|
| header | `type(scope): subject`, at most 72 characters |
| type | one of `feat`, `fix`, `refactor`, `style`, `build`, `chore`, `docs`, `test`, `perf`, `ci`, `revert`, `merge`; lower case |
| scope | optional, any value, lower case, one scope |
| `!` | optional breaking change marker before `:` |
| subject | at least 5 characters, starts with an uppercase letter, no trailing period |
| body | optional, blank line before it, lines up to 72 characters |
| footer | optional, blank line before it, `Token: value` or `Token #value`, lines up to 72 characters |

Merge commits, `git revert` messages (`Revert "…"`) and `fixup!`, `squash!`, `amend!` commits are skipped.

## CLI

```text
kysaro <file>              Check a commit message file (commit-msg hook)
kysaro -m <message>        Check a message
kysaro < message.txt       Check a message from stdin
kysaro init                Install the commit-msg hook
kysaro init --settings     Also copy default settings to .kysaro/settings

Options:
  -m, --message <text>       Message to check
      --type <kind>          Message kind: commit, merge, request (detected by default)
      --force                init: overwrite existing hook and settings
  -h, --help                 Show help
  -v, --version              Show version
```

| Exit code | Meaning |
|---|---|
| `0` | message is valid or ignored |
| `1` | message is invalid |
| `2` | wrong arguments or broken settings |

A valid message prints nothing. Warnings are printed but do not block the commit.

## Configuration

Kysaro reads `.kysaro/settings` in the project root. A missing file falls back to the package default, so you can keep only the files you change. Resource files listed in `fromFiles` must exist next to the settings file that lists them. A broken file also falls back to the default: kysaro prints a warning and writes details to `.kysaro/main.md` or `.kysaro/commits.md`.

| File | Purpose |
|---|---|
| `.kysaro/settings/main/main.json` | pipeline stages, severity, ignored messages |
| `.kysaro/settings/commits/commit.json` | commit message rules |
| `.kysaro/settings/resources/types.json` | allowed types |
| `.kysaro/settings/resources/scopes.json` | allowed scopes |
| `.kysaro/settings/resources/tokens.json` | allowed footer tokens |

Each file links its JSON Schema through `$schema`, so VS Code, WebStorm and other editors show descriptions, allowed values and errors inline.

### Common changes

Require a scope from a fixed list, `commit.json`:

```json
"scope": {
  "required": true,
  "source": { "fromFiles": ["../resources/scopes.json"] },
  "case": "lower",
  "onMultiple": "error"
}
```

Allow several scopes, `feat(ui, api): …`:

```json
"scope": {
  "required": false,
  "source": "any",
  "case": "kebab",
  "multiple": { "maxItems": 3, "separatorSpacing": "require", "unique": true },
  "onMultiple": "error"
}
```

Require a body for features and fixes:

```json
"body": {
  "required": { "when": { "type": ["feat", "fix"] } },
  "blankLineBefore": true,
  "maxLineLength": 72
}
```

Allow only known footer tokens, `commit.json`:

```json
"token": {
  "source": { "fromFiles": ["../resources/tokens.json"] },
  "case": "match-source"
}
```

Report problems as warnings instead of errors, `main.json`:

```json
"validator": { "enabled": true, "severity": "warning" }
```

Skip more messages, `main.json`. A pattern matches the start of the header, ignoring case:

```json
"ignore": {
  "kinds": ["merge", "revert"],
  "patterns": ["fixup! ", "squash! ", "amend! ", "WIP"]
}
```

### Sources

`type.value`, `scope.source` and `footer.token.source` accept:

- `"any"` — any value;
- `{ "fromFiles": ["../resources/types.json"] }` — keys of resource files, paths relative to the settings file;
- `{ "inline": ["feat", "fix"] }` — a list in place;
- both `fromFiles` and `inline` — values from both.

An empty list allows any value. Values are found ignoring case; the `case` option decides whether the spelling is correct.

### Case

| Value | type, scope, footer token | subject, footer value |
|---|---|---|
| `lower` | whole value in lower case | first letter lower case |
| `upper` | whole value in upper case | whole value in upper case |
| `sentence` | first letter upper case, rest lower case | first letter upper case, rest as is |
| `kebab`, `camel`, `pascal`, `snake` | matches the pattern | — |
| `match-source` | spelled as in the source | — |
| `any` | not checked | not checked |

The full reference of every option, in Russian, is in [docs/SPEC.md](docs/SPEC.md).

## Rules

| Section | Issue codes |
|---|---|
| header | `HEADER_FORMAT`, `HEADER_TOO_LONG` |
| type | `TYPE_EMPTY`, `TYPE_UNKNOWN`, `TYPE_CASE` |
| scope | `SCOPE_REQUIRED`, `SCOPE_EMPTY`, `SCOPE_EMPTY_ITEM`, `SCOPE_TOO_MANY`, `SCOPE_TOO_FEW`, `SCOPE_DUPLICATE`, `SCOPE_SEPARATOR_SPACING`, `SCOPE_UNKNOWN`, `SCOPE_CASE` |
| subject | `SUBJECT_EMPTY`, `SUBJECT_TOO_SHORT`, `SUBJECT_CASE`, `SUBJECT_TRAILING_PERIOD`, `SUBJECT_WHITESPACE` |
| body | `BODY_REQUIRED`, `BODY_LEADING_BLANK`, `BODY_LINE_TOO_LONG`, `BODY_WHITESPACE`, `BODY_EMPTY_LINES` |
| footer | `FOOTER_REQUIRED`, `FOOTER_LEADING_BLANK`, `FOOTER_LINE_TOO_LONG`, `FOOTER_TOO_MANY`, `FOOTER_TOO_FEW`, `FOOTER_DUPLICATE_TOKEN`, `FOOTER_TOKEN_UNKNOWN`, `FOOTER_TOKEN_CASE`, `FOOTER_VALUE_TOO_SHORT`, `FOOTER_VALUE_CASE` |
| breaking change | `BREAKING_HEADER_REQUIRED`, `BREAKING_HEADER_FORBIDDEN`, `BREAKING_FOOTER_REQUIRED`, `BREAKING_FOOTER_FORBIDDEN`, `BREAKING_FOOTER_DESCRIPTION`, `BREAKING_MISSING` |
| message | `MESSAGE_IS_EMPTY`, `CONFIGURATION_ERROR` |

Before validation the message is cleaned the way git cleans it: comment lines, the `git commit -v` diff below the scissors line, extra blank lines and spaces around lines are removed. The message file itself is not changed.

## Continuous integration

Merges through the GitHub button do not run local hooks. To check the commits of every push and pull request, add a step to a workflow:

```yaml
- uses: actions/checkout@v7
  with:
    fetch-depth: 0
- run: npm ci
- name: Check commit messages
  env:
    BASE: ${{ github.event.pull_request.base.sha || github.event.before }}
  run: |
    for sha in $(git rev-list --no-merges "$BASE..HEAD"); do
      git log -1 --format=%B "$sha" | npx kysaro --type commit
    done
```

The step fails on the first invalid message. On the first push of a new branch `github.event.before` is all zeros, so run it for pull requests or skip that case, as the [CI of this repository](.github/workflows/ci.yml) does.

## Node.js API

```js
const {lint} = require('kysaro');

const result = lint('feat(ui): Add dark theme', {cwd: process.cwd()});

result.status;  // 'valid' | 'invalid' | 'ignored'
result.issues;  // [{code, message, severity, category, path, meta}]
```

`parseMessage(message)` returns the message AST without validation. TypeScript declarations are included.

## Roadmap

Settings for these stages exist in `main.json`, but the stages are not connected yet:

- pull request title and description rules (`request.json`) and merge commit rules (`merge.json`);
- `fixer` — apply suggested fixes to the message;
- `analyzer` — typo suggestions for types and scopes, message quality checks;
- `generator` — message generation.

## Development

```sh
npm ci                 # install dependencies and git hooks
npm test               # run tests (also runs in the pre-commit hook)
npm run test:coverage  # run tests with coverage
npm start              # run the pipeline on a sample message
```

This repository checks its own commits with kysaro. Allowed types and scopes are in `.kysaro/settings/resources`.

## License

[MIT](LICENSE)
