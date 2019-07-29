module.exports =  {
  parser:  '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends:  [
    'plugin:@typescript-eslint/recommended',
  ],
 parserOptions:  {
    ecmaVersion:  2018,
    sourceType:  'module',
  },
  rules:  {
    'max-len': ['error', { ignoreComments: true, code: 160 }],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      "args": "after-used"
    }]
  },
};