import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**"]),
  {
    // vendored output of the shadcn CLI — kept byte-identical so `shadcn add` stays clean
    files: ["components/ui/**/*.{ts,tsx}", "hooks/**/*.{ts,tsx}"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
]);
