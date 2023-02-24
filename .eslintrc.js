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
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    project: [
      //
      './tsconfig.json',
      './tsconfig.types.json',
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
