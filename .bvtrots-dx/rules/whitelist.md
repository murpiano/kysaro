# 📜 Bvtrots Commit Protocol

## ⚙️ 1. Validation Rules

| Category | Rule | Standard | Pull Request | Merge |
| :--- | :--- | :---: | :---: | :---: |
| **Header** | Length (Min-Max) | 20-72 | 15-72 | 15-80 |
| | Hash #Number | ❌ | ❌ | ✅ |
| **Body** | Body Required | ✅ | ✅ | ✅ |
| | First letter lowercase | ✅ | ❌ | ❌ |
| | Min Length | 20 | 50 | 50 |
| | Max Line Length | 100 | ❌ | ❌ |

## 🏷️ 2. Allowed Types

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

## 🎯 3. Allowed Scopes

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
