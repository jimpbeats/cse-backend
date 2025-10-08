# 🔧 Cleanup: Versioned Import Stripping

This utility helps clean up and prevent inline versioned import strings like:

```js
import Button from '@ui/button@v1'  // ❌ Don't do this
```

## ✅ Tools

### 🧼 1. Shell Cleanup Script

Run the shell script for a quick cleanup:

```bash
bash tools/cleanup/clean-versioned-imports.sh
```

### 🧠 2. Codemod (Recommended)

Install jscodeshift:

```bash
npm install -g jscodeshift
```

Run the codemod:

```bash
jscodeshift -t tools/cleanup/remove-versioned-imports.js src
```

### 🚫 3. Git Pre-commit Hook

Block commits that introduce versioned imports.

Install Husky if needed:

```bash
npm install husky --save-dev
npx husky install
```

Add the hook:

```bash
npx husky add .husky/pre-commit tools/cleanup/pre-commit-version-check.sh
```

Now, commits with versioned imports will be blocked.

## 📦 Supported File Types

- .ts
- .tsx
- .js
- .jsx

You can expand the scripts if you use other extensions.

## 📌 Summary

| Tool | Use Case |
|------|----------|
| clean-versioned-imports.sh | Quick regex-based cleanup |
| remove-versioned-imports.js | Safe AST-based codemod (JS/TS) |
| pre-commit-version-check.sh | Prevent versioned imports via Git |