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
  ]),
  {
    rules: {
      // Disable overly strict React Compiler rules that fire on the standard
      // async data-fetching pattern (useEffect calling functions that setState).
      "react-hooks/set-state-in-effect": "off",
      // Allow async functions defined after useEffect (standard pattern).
      "react-hooks/immutability": "off",
      // Suppress exhaustive-deps warnings for data-fetching effects.
      "react-hooks/exhaustive-deps": "warn",
      // Allow React Hook Form watch() usage.
      "react-hooks/incompatible-library": "off",
    },
  },
]);

export default eslintConfig;
