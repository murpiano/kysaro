# ⚙️ bvtrots-dx - Developer Experience

---


## 📖 Overview
Personal **commitlint** configuration that enforces strict Conventional Commits compliance enhanced with **visual emojis** for better readability.

---


## 🎯 Key Features & Design Philosophy

* 🏗️ **Architectural Standard**: Strictly follows the Conventional Commits specification.
* ✨ **Visual Context**: Integrates characteristic emojis to provide instant recognition of change types.
* 📏 **Clean History**: Ensures a professional, readable, and structured timeline, ready for automated changelog generation.
* 🛡️ **Hardcore Validation**: Unlike standard configs, this one validates the emoji-type match and description formatting.

---


## 🕵️‍♂️ Strict Validation Rules
This configuration is opinionated and enforces a rigorous commit structure based on architectural discipline and atomic changes.

1. ###### Standard Commits
   Every standard commit must strictly follow these rules:
- **Header Format**:emoji_type_(scope):_subject (see examples ⏬).
  - **Emoji**: allowed to use strictly from the whitelist. 
  - **Type**: allowed to use strictly from the whitelist in lowercase.
  - **Scope (Strictly Mandatory)**: Must be wrapped in parentheses, and allowed to use strictly from the whitelist in lowercase.
  - **Subject**: The subject must strictly start with a lowercase letter.
  - **Header Limit**: Maximum 72 characters.
- **Empty Line**: A mandatory blank line must separate the header from the body.
- **Body (Strictly Mandatory)**: You must provide a description for every commit:
  - **Minimum Requirement**: At least one valid description line is required. 
  - **Atomic Rule**: Every line in the body must use the same Emoji as the header. Mixing different types (e.g., a fix inside a feat commit) is strictly forbidden.
  - **Line Format**: Each line must strictly follow:
    -_emoji_text. (see examples ⏬).
    - Text: Text must start with a lowercase letter and end with a period (.).

2. ###### Merge Commits
   If a commit is a merge (created via terminal or GitHub merge button), it follows a different strict format:
- **Header Format**: emoji_merge_(scope):_subject\_#NumberPR (see examples ⏬).
  - **Emoji**: allowed to use strictly from the whitelist.
  - **Merge Keyword (Strictly Mandatory)**: The word `merge` must be strictly lowercase.
  - **Scope (Strictly Mandatory)**: Must be wrapped in parentheses, and allowed to use strictly from the whitelist in lowercase.
  - **Subject**: The subject must strictly start with a lowercase letter.
  - **PR Number**: The header must end with a hash symbol and the PR number (automatically handled by GitHub).
  - **Header Limit**: Maximum 80 characters.
- **Empty Line**: A mandatory blank line must separate the header from the body.
- **Body (Strictly Mandatory)**:
  - **Minimum Length**: The body text must contain at least 50 characters.
  - **Content**: The format is free, but it must be a meaningful, human-readable description of the merged changes.

3. ###### Pull Request (PR) Requirements
   To ensure clean history, GitHub Pull Requests must be prepared as follows:
- **PR Title**: Must follow the Merge Commit header format but WITHOUT the PR number at the end (see examples ⏬). GitHub will append the `#Number` automatically upon merging.
- **Header Limit**: Maximum 72 characters.
- **PR Description**: This text will become the Body of your merge commit. It is strictly mandatory and must be at least 50 characters long.
- **Strict Enforcement**: If the PR Title or Description violates these rules, the GitHub Actions check will fail, and merging will be blocked.

4. ###### General Limits
- Language: All messages must be in English.
- Validation: All Types, Emojis, and Scopes are strictly validated against the whitelist in src/rules/.

---


## 📊 White list table

| Tag | Emoji | Meaning |
| :--- | :--- | :--- |
| **feat** | ✨ | New feature or functionality |
| **fix** | 💊 | Bug fixes and code repairs |
| **refactor** | ♻️ | Code restructuring without changing functionality |
| **style** | 🎨 | UI/UX, CSS, and layout improvements |
| **build** | ⚙️ | Build system configuration or dependencies |
| **chore** | 🔧 | Maintenance, config tweaks, or tool updates |
| **docs** | 📝 | Documentation and comments |

---


## ✅ Valid Examples
Stage 1: Standard Commit
###### Made in your local branch feat/auth-logic.
```text
✨ feat (auth): implement secure password hashing

- ✨ add bcryptjs for password encryption before saving.
- ✨ implement salt generation logic in the user service.
- ✨ update user model to handle encrypted strings.
```

Stage 2: Pull Request
###### When you open the PR on GitHub. Title matches Merge format (no #), Description is > 50 chars.
```text
✨ merge (auth): secure password hashing and encryption logic

This pull request integrates bcryptjs for secure password management. It ensures
that all user passwords are encrypted with a unique salt before being stored in
the database, significantly improving security.
```

Stage 3: Merge Commit
###### The result in main after clicking the "Merge" button. GitHub adds the #Number.
```text
✨ merge (auth): secure password hashing and encryption logic #42

This pull request integrates bcryptjs for secure password management. It ensures
that all user passwords are encrypted with a unique salt before being stored in
the database, significantly improving security.
```

---


## ❌ Invalid Examples

Example 1: Missing or Invalid Scope
```text
# Error: Scope "(auth)" is missing or not from the whitelist.
✨ feat: add user login

---------------------------------------------------------------------

# Error: Scope must be in parentheses and lowercase.
✨ feat [AUTH]: add user login
```

Example 2: Case & Format Errors
```text
# Error: Subject must start with a lowercase letter ("Add" -> "add").
✨ feat (auth): Add user login

---------------------------------------------------------------------

# Error: Missing space after emoji.
✨feat (auth): add user authentication

---------------------------------------------------------------------

# Error: Missing space after colon.
✨ feat (auth):add user authentication
```

Example 3: Missing Mandatory Body (Standard Commit)
```text
# Error: Body is strictly mandatory. You must add a blank line and description.
✨ feat (auth): add user login logic
```

Example 4: Invalid Body Format (Standard Commit)
```text
✨ feat (maps): integrate location services

# Error: Line must start with lowercase letter ("Add" -> "add").
- ✨ Add Leaflet maps integration. 

# Error: Missing trailing period "." at the end of the line.
- ✨ fix marker positioning issue

# Error: Atomic Rule violation. Body emoji (💊) must match header emoji (✨).
- 💊 fix marker positioning issue.

# Error: Missing dash and emoji prefix "- ✨".
implement popup tooltips for pins.
```

Example 5: Invalid Merge / PR Format
```text
# Error: Missing PR number with hash at the end (mandatory for Merge in Git history).
✨ merge (core): integrate shared types

---------------------------------------------------------------------

# Error: Body/Description is too short (must be > 50 characters).
✨ merge (core): integrate shared types #42

Done some refactoring here.

---------------------------------------------------------------------

# Error: PR Title should NOT manually include #Number (GitHub adds it automatically).
✨ merge(analytics): update module #45
```

---


## 📂 Project Structure
```text
bvtrots-dx/
├── .idea/              # IDE configuration
├── node_modules/       # Dependencies
├── .npmignore          # NPM publish filters
├── index.js            # Main configuration logic (rules)
├── package.json        # Manifest & metadata
├── package-lock.json   # Locked dependencies
└── README.md           # Documentation
```

---


## ⚙️ Installation & Usage
###### This package is recommended to be used with a Git hooks mechanism (like Husky) that automatically triggers validation scripts during Git interactions. This ensures that every commit message follows the rules before it enters your repository history.

### 1. Install 

       npm install -D @commitlint/cli bvtrots-dx

### 2. Quick Setup (Recommended)

###### Simply run this command to automatically configure everything (Husky, Hooks, GitHub Actions, and Rules):

       npx bvtrots-init


   What this command does:
   - Creates `.commitlintrc.js` in your root.
   - Sets up Husky with `commit-msg` (validation) and `pre-commit` (auto-sync) hooks in `.husky/`. 
   - Creates a `.bvtrots-dx/rules/` directory with `types.json` and `scopes.json` templates. 
   - Generates a visual `whitelist.md` for your team in `.bvtrots-dx/rules/`. 
   - Adds a GitHub Action for CI/CD commit validation.


### 3. Manual Setup (For Advanced Users)

###### If you prefer to manage your configuration manually:

  1. Configure Commitlint: Create `.commitlintrc.js` and add:

          module.exports = { extends: ['bvtrots-dx'] };


  2. Initialize Rules: Create a `.bvtrots-dx/rules/` folder in your root. You can copy `types.json` and `scopes.json` from the package's `src/rules` folder as a starting point.
   
                      
  3. Hooks: Add a `commit-msg` hook to trigger `commitlint`.
   

  4. Documentation: Run `npx bvtrots-sync` to generate the rules table.


### 4. Customizing Rules

   ###### The "Bvtrots Protocol" follows a specific hierarchy. You can change allowed types or scopes at any time:

  1. Modify `types.json`, `scopes.json` or `settings.json` inside the `.bvtrots-dx/rules/` directory. 

  2. The linter will instantly apply these changes. 

  3. On your next commit, the `whitelist.md` will be automatically updated via the `pre-commit` hook to reflect your changes.


### 5. Verify the Setup

  ###### Try to create a test commit:

    git commit -m "🚀 feat(ui): add new button"

  If your message is invalid (e.g., missing emoji, wrong scope, or no body), Husky will reject the commit and show a detailed error list in your terminal.


---


## ⚖️ License

MIT

---


<p align="center">
Developed with ❤️ by <strong><a href="https://github.com/bvtrots">bvtrots</a></strong>
</p>