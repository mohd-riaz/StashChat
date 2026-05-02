import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Scaffolded third-party component source — not our code to lint
    "src/components/ui/**",
    "src/components/ai-elements/**",
  ]),
  {
    rules: {
      'react/no-danger': 'error',
    },
  },
]);

export default eslintConfig;
