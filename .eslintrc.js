module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    //
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
    'prettier',
    'plugin:cypress/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    //
    '@typescript-eslint',
    'cypress',
  ],
  parserOptions: {
    project: [
      //
      './tsconfig.json',
      './tsconfig.types.json',
      './tsconfig.cypress.json',
      './tsconfig.vitest.json',
      './cypress/tsconfig.json',
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/triple-slash-reference": "off",
  }
}
