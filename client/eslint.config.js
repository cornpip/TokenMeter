import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["dist"] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
            // 사용하지 않는 변수에 대한 규칙 설정, ts 프로젝트에서는 @typescript-eslint/no-unused-vars 만 하고 중복 피하기
            // 'no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],

            /**
             * vars: all - 모든 변수에서 사용을 감지
             * args: after-used - 사용된 매개변수만 검사
             * ignoreRestSiblings - 객체 구조 분해에서 나머지 연산자를 사용할 때 무시
             * ex) {a, ...rest} = obj // rest는 해당 경우여도 무시
             */

            "@typescript-eslint/no-unused-vars": [
                "warn",
                { vars: "all", args: "after-used", ignoreRestSiblings: true },
            ],
            "@typescript-eslint/no-explicit-any": [
                "warn",
                { vars: "all", args: "after-used", ignoreRestSiblings: true },
            ],
        },
    }
);
