import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals"; // Run 'npm install globals' if not installed

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      // 1. Tell ESLint browser globals (window, document, etc.) exist
      globals: {
        ...globals.browser,
        ...globals.es2020
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      // 2. Let TypeScript handle undefs, disable the ESLint check
      "no-undef": "off",
      
      // 3. Make 'any' a warning rather than a build-blocking error
      "@typescript-eslint/no-explicit-any": "warn",
      
      // 4. Allow empty interfaces
      "@typescript-eslint/no-empty-object-type": "off"
    }
  }
];