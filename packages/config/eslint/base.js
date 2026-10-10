import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

/**
 * Shared ESLint flat config cho mọi package TypeScript.
 * Dùng type-aware rules (projectService) — mỗi package tự set `tsconfigRootDir`.
 */
export default defineConfig(
  { ignores: ["**/dist/**", "**/.next/**", "**/.turbo/**", "**/coverage/**"] },
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // File JS (vd. eslint.config.js) không nằm trong tsconfig → tắt type-aware rules
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  prettier,
);
