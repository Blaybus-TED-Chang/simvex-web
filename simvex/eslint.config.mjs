import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Three.js 재질 변이, Supabase 초기 로드 등 프로젝트 전체에서
      // 의도적으로 사용하는 패턴들 — react-hooks v7 신규 strict 규칙 비활성화
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 개발용 유틸 스크립트 (Node.js CommonJS)
    "analyze-glb.js",
  ]),
]);

export default eslintConfig;
