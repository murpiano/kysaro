# kysaro

Strict protocol for commit, pull request and merge messages.

Kysaro checks messages before they reach the history. The default preset is [Conventional Commits](https://www.conventionalcommits.org/). Rules live in JSON files with JSON Schemas, so the IDE gives autocomplete and inline errors while you edit them.

> **Status: in development.** The package is not published and cannot validate commits yet. The configuration loader works; the validation pipeline is being enabled stage by stage.

## How it works

1. A git hook (husky `commit-msg`) runs kysaro on the message.
2. The loader reads user settings from `.kysaro/settings` (or the package defaults) and validates them against the JSON Schemas.
3. The message goes through the pipeline: `generator` → `normalizer` → `parser` → `ignore` → `validator` → `analyzer` → `fixer` → `output`.
4. The result is `valid`, `invalid` or `ignored`, with a list of issues and suggested fixes.

Pull request titles and descriptions are checked in CI, because merges on GitHub do not run local hooks.

## Configuration

| File | Purpose |
|---|---|
| `.kysaro/settings/main/main.json` | pipeline stages |
| `.kysaro/settings/commits/commit.json` | commit message rules |
| `.kysaro/settings/commits/merge.json` | merge commit rules |
| `.kysaro/settings/commits/request.json` | pull request rules |
| `.kysaro/settings/resources/types.json` | allowed types |
| `.kysaro/settings/resources/scopes.json` | allowed scopes |
| `.kysaro/settings/resources/tokens.json` | allowed footer tokens |

A missing or unreadable user file falls back to the package default in `src/settings`. The loader writes a status report for each settings group to `.kysaro/*.md`.

The full specification (in Russian) is in [docs/SPEC.md](docs/SPEC.md).

## Development

Requirements: Linux or WSL, Node.js 24.

```sh
npm ci                 # install dependencies and git hooks
npm test               # run tests (also runs in the pre-commit hook)
npm run test:coverage  # run tests with coverage
npm start              # run the pipeline on a sample message (scripts/playground.js)
```

This repository follows its own rules from `.kysaro/settings`:

```text
type(scope): Subject in sentence case

Optional body, lines up to 72 characters.
```

Types and scopes are listed in `.kysaro/settings/resources`.

## License

MIT
