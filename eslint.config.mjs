import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        files: ["src/**/*.ts"],
        plugins: {
            "@stylistic": stylistic,
        },
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "no-unused-vars": ["off"],
            "@typescript-eslint/no-unused-vars": ["off"],
            "@stylistic/quotes": ["error", "double"],
            "@stylistic/semi": ["error", "always"],
            "@stylistic/padded-blocks": ["off"],
            "@typescript-eslint/no-explicit-any": ["off"],
        },
    }
);

