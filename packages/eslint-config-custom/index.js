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
    'turbo',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    //
    '@typescript-eslint',
    'cypress',
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      //
      './packages/*/tsconfig.json',
      './packages/*/tsconfig.types.json',
      './packages/*/tsconfig.cypress.json',
      './packages/*/tsconfig.vitest.json',
      './packages/*/cypress/tsconfig.json',
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
