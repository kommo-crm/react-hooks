import globals from 'globals';
import pluginJs from '@eslint/js';
import tsEslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-plugin-prettier/recommended';
import jsdoc from 'eslint-plugin-jsdoc';

export default [
  {
    ignores: ['storybook-static', 'node_modules', 'dist', 'coverage'],
    languageOptions: { globals: globals.browser },
  },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  eslintConfigPrettier,
  jsdoc.configs['flat/recommended'],
  {
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          contexts: ['TSPropertySignature', 'TSIndexSignature', 'TSEnumMember'],
          require: {
            FunctionDeclaration: false,
          },
        },
      ],
    },
  },
];
