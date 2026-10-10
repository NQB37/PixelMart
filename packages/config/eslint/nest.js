import { defineConfig } from "eslint/config";
import globals from "globals";

import base from "./base.js";

/** ESLint config cho NestJS (Node runtime, decorators). */
export default defineConfig(base, {
  languageOptions: {
    globals: { ...globals.node },
  },
  rules: {
    // Nest DI cần import class làm giá trị (emitDecoratorMetadata) → không ép `import type`
    "@typescript-eslint/consistent-type-imports": "off",
  },
});
