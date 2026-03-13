# ⚙️ bvtrots-commitlint-config

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
This configuration is opinionated and enforces a rigorous commit structure.

1. ###### Standard Commits
   Every standard commit must strictly follow these rules:
- **Header Format**:
  Emoji (whitelist table) -> Space -> Type (whitelist table) -> Colon -> Space -> Subject (see examples ⏬).
- **Case Sensitivity**: The subject must strictly start with a lowercase letter.
- **Empty Line**: A mandatory blank line must separate the header from the body.
- **Body (Strictly Mandatory)**: You must provide a description for every commit.
- **Minimum Requirement**: At least one valid description line is required.
- **Line Format**: Each line must strictly follow:
  `-` -> Space -> Emoji (whitelist table) -> Space -> Text -> `.` (see examples ⏬).
- **Content**: Text must start with a lowercase letter and end with a period (`.`).
- **Hierarchy**: Lines must follow the priority order from the whitelist table (e.g., `- ✨` before `- ♻️`).

2. ###### Merge Commits
   If a commit is a merge (created via terminal or GitHub merge button), it follows a different strict format:
- **Header Format**:
  Emoji (whitelist table) -> Space -> `merge` -> Space -> Subject -> Space -> `#Number` (see examples ⏬).
- **Keyword**: The word `merge` must be strictly lowercase.
- **PR Number**: The header must end with a hash symbol and the PR number (automatically handled by GitHub).
- **Empty Line**: A mandatory blank line must separate the header from the body.
- **Body (Strictly Mandatory)**:
  - **Minimum Length**: The body text must contain at least 50 characters.
  - **Content**: The format is free, but it must be a meaningful, human-readable description of the merged changes.

3. ###### Pull Request (PR) Requirements
   To ensure clean history, GitHub Pull Requests must be prepared as follows:
- **PR Title**: Must follow the Merge Commit header format but WITHOUT the PR number at the end (see examples ⏬). GitHub will append the `#Number` automatically upon merging.
- **PR Description**: This text will become the Body of your merge commit. It is strictly mandatory and must be at least 50 characters long.
- **Strict Enforcement**: If the PR Title or Description violates these rules, the GitHub Actions check will fail, and merging will be blocked.

4. ###### General Limits
- **Header Limit**: The header length must not exceed 72 characters.
- **Language**: All commit messages must be in English.

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
✨ feat: implement secure password hashing

- ✨ add bcryptjs for password encryption before saving.
- ✨ implement salt generation logic in the user service.
- 💊 fix edge case where empty password could be processed.
```

Stage 2: Pull Request
###### When you open the PR on GitHub. Title matches Merge format (no #), Description is > 50 chars.
```text
✨ merge secure password hashing and encryption logic

This pull request integrates bcryptjs for secure password management. 
It ensures that all user passwords are encrypted with a unique salt 
before being stored in the database, significantly improving security.
```

Stage 3: Merge Commit
###### The result in main after clicking the "Merge" button. GitHub adds the #Number.
```text
✨ merge secure password hashing and encryption logic #42

This pull request integrates bcryptjs for secure password management. 
It ensures that all user passwords are encrypted with a unique salt 
before being stored in the database, significantly improving security.
```

---


## ❌ Invalid Examples

Example 1: Uppercase in Header
```text
# Error: Subject must start with a lowercase letter ("Add" -> "add").
✨ feat: Add user login
```

Example 2: Broken Header Format
```text
# Error: Missing emoji at the beginning
feat: add user authentication

# Error: Missing space after emoji or colon
✨feat: add user authentication
✨ feat:add user authentication
```

Example 3: Missing Mandatory Body (Standard Commit)
```text
# Error: Standard commits MUST have a blank line and a body description.
✨ feat: add user login logic
```

Example 4: Invalid Body Format
```text
✨ feat: integrate maps and location services

# Error: Description line must start with a lowercase letter.
- ✨ Added Leaflet maps integration. 

# Error: Missing trailing period ".".
- 💊 fix marker positioning issue

# Error: Missing dash and emoji "- ✨".
implement popup tooltips for pins.
```

Example 5: Invalid Merge / PR Format
```text
# Error: Missing PR number with hash at the end (for Merge Commits)
✨ merge core components and shared types

# Error: Uppercase "Merge" keyword
✨ Merge core components #2

# Error: Body/Description is too short (less than 50 characters)
✨ merge core components #2

Updated the base components.

# Error: PR Title should not manually include #Number
✨ merge analytics module #45
```

---


## 📂 Project Structure
```text
bvtrots-commitlint-config/
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

1. Install 

       npm install -D @commitlint/cli bvtrots-commitlint-config

2. Quick Setup (Recommended for beginners)

    ###### Simply run this command to automatically configure Husky, hooks, and GitHub Actions:

       npx bvtrots-init

3. Manual Setup (For advanced users)

   - Add extends: ['bvtrots-commitlint-config'] to your commitlint config.
   - Manually configure your Husky hooks as needed.
   - (Optional) Copy our CI workflow from the package.


4. Verify the setup

   From now on, every time you try to create a commit, Husky will automatically trigger commitlint. If your message is invalid, the commit will be rejected, and you will see a list of errors in your terminal.

---


## ⚖️ License

MIT

---


<p align="center">
Developed with ❤️ by <strong><a href="https://github.com/bvtrots">bvtrots</a></strong>
</p> bvtrots-commitlint-config