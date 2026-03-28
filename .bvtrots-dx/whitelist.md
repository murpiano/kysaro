# 📃 Whitelist bvtrots-dx 


---

## ✅ Valid Examples

### Stage 1: Standard Commit
###### Made in your local branch feat/auth-logic.
```text
✨ feat (auth): implement secure password hashing

- ✨ add bcryptjs for password encryption before saving.
- ✨ implement salt generation logic in the user service.
- ✨ update user model to handle encrypted strings.
```

### Stage 2: Pull Request
###### When you open the PR on GitHub. Title matches Merge format (no #), Description is > 50 chars.
```text
✨ merge (auth): secure password hashing and encryption logic

This pull request integrates bcryptjs for secure password management. It ensures
that all user passwords are encrypted with a unique salt before being stored in
the database, significantly improving security.
```

### Stage 3: Merge Commit
###### The result in main after clicking the "Merge" button. GitHub adds the #Number.
```text
✨ merge (auth): secure password hashing and encryption logic #42

This pull request integrates bcryptjs for secure password management. It ensures
that all user passwords are encrypted with a unique salt before being stored in
the database, significantly improving security.
```

---
## 1. Validation Rules

| Category | Rule | Standard | Pull Request | Merge |
| :--- | :--- | :---: | :---: | :---: |
| **Header** | Length (Min-Max) | 20-72 | 15-72 | 15-80 |
| | Hash #Number | ❌ | ❌ | ✅ |
| **Body** | Body Required | ✅ | ✅ | ✅ |
| | First letter lowercase | ✅ | ❌ | ❌ |
| | Min Length | 20 | 50 | 50 |
| | Max Line Length | 100 | ❌ | ❌ |

## 2. Allowed Types

| Emoji | Type | Description |
| :---: | :--- | :--- |
| ✨ | feat | New feature |
| 💊 | fix | Bug fix |
| ♻️ | refactor | Refactoring |
| 🎨 | style | Styles/UI |
| ⚙️ | build | Build/Deps |
| 🔧 | chore | Maintenance |
| 📝 | docs | Documentation |
| 👀 | test | Tests |
| ⚡ | perf | Performance |
| 🚀 | ci | CI/CD |
| ↩ | revert | Revert |

## 3. Allowed Scopes

| Scope | Description |
| :--- | :--- |
| `auth` | Authentication and authorization flows |
| `ui` | User interface components, design system, and layouts |
| `api` | Data fetching logic, API clients, and endpoints |
| `core` | Business logic, global state, and essential services |
| `config` | Project configuration files and environment variables |
| `deps` | Dependency management and package updates |
| `tests` | Unit, integration, and end-to-end testing |
| `docs` | Technical documentation, README, and JSDoc |
| `db` | Database schemas, migrations, and query logic |
| `build` | Build scripts, bundler settings, and deployment tools |
