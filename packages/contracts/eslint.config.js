import base from "@pixelmart/config/eslint/base";
import { defineConfig } from "eslint/config";

export default defineConfig(base, {
  languageOptions: {
    parserOptions: { tsconfigRootDir: import.meta.dirname },
  },
});
