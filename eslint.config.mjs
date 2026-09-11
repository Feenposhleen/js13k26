import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

export default tseslint.config(
  // -------------------------------------------------------------
  // Global ignores: build output, machine-generated assets, etc.
  // -------------------------------------------------------------
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/core/assets/*.gen.ts',
      'src/core/assets/fontb64.ts',
      'editor/public/**',
      '*.zip',
    ],
  },

  // Base recommended rules from ESLint & TypeScript-ESLint
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // -------------------------------------------------------------
  // Primary configuration for project TypeScript and JavaScript files
  // -------------------------------------------------------------
  {
    files: ['src/**/*.{ts,js}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.worker,
        ...globals.es2021,
      },
    },
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      // =========================================================
      // 1. Keep trailing commas and indent accordingly
      // =========================================================
      '@stylistic/comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'always-multiline',
          enums: 'always-multiline',
          generics: 'always-multiline',
          tuples: 'always-multiline',
        },
      ],
      '@stylistic/indent': [
        'error',
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: 1,
          outerIIFEBody: 1,
          MemberExpression: 1,
          FunctionDeclaration: { parameters: 1, body: 1 },
          FunctionExpression: { parameters: 1, body: 1 },
          CallExpression: { arguments: 1 },
          ArrayExpression: 1,
          ObjectExpression: 1,
          ImportDeclaration: 1,
          flatTernaryExpressions: false,
          ignoreComments: false,
        },
      ],
      '@stylistic/indent-binary-ops': ['error', 2],

      // =========================================================
      // 2. Set line length to 100
      // =========================================================
      '@stylistic/max-len': [
        'error',
        {
          code: 100,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],

      // =========================================================
      // 3. Force newlines
      // =========================================================
      // Force newline at end of files
      '@stylistic/eol-last': ['error', 'always'],
      // Force newlines inside multiline object literals
      '@stylistic/object-curly-newline': [
        'error',
        {
          multiline: true,
          consistent: true,
        },
      ],
      // Force newlines inside multiline arrays
      '@stylistic/array-bracket-newline': [
        'error',
        {
          multiline: true,
        },
      ],
      // Force newlines inside multiline function arguments
      '@stylistic/function-paren-newline': ['error', 'multiline-arguments'],
      // Force newlines between class members
      '@stylistic/lines-between-class-members': [
        'error',
        'always',
        {
          exceptAfterSingleLine: true,
        },
      ],

      // =========================================================
      // js13k-specific conventions & optimizations
      // =========================================================
      // Terser property mangling relies heavily on '_' prefixes (see AGENTS.md)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      // Allow 'any' where needed for Web Worker / Window dynamic dispatch
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow 'var' when necessary for bundle compression and scope sharing
      'no-var': 'warn',
      // Prefer const when variables are never reassigned
      'prefer-const': 'warn',
    },
  },

  // -------------------------------------------------------------
  // Node.js scripts & tooling (rollup config, asset studio server)
  // -------------------------------------------------------------
  {
    files: ['rollup.config.js', 'editor/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-undef': 'error',
    },
  },
);