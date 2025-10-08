/**
 * Codemod: remove-versioned-imports.js
 * Purpose: Remove version suffixes from import paths (e.g., @lib/component@v1 → @lib/component)
 */

export default function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  root.find(j.ImportDeclaration)
    .filter(path => /@.*@[vV]?[0-9]/.test(path.value.source.value))
    .forEach(path => {
      // Remove version suffix with optional alpha/beta tag
      path.value.source.value = path.value.source.value.replace(/@[vV]?[0-9][0-9.-]*(?:-?[a-zA-Z0-9]+)?/g, '');
    });

  return root.toSource({ quote: 'single' });
}