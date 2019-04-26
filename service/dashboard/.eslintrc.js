module.exports = {
  root: true,

  env: {
    node: true
  },

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prefer-destructuring': ['error', { object: true, array: false }],
    'max-len': ['error', { ignoreComments: true, code: 150 }],
    'no-use-before-define': 0,
    'import/no-unresolved': 0,
    'no-param-reassign': ['error', { props: false }]
  },

  parserOptions: {
    parser: 'babel-eslint'
  },

  settings: {
    'import/resolver': {
      'babel-module': {
        // root: ['./src'],
        // alias: { config: './config' }
      }
    }
  },

  extends: [
    'airbnb-base',
    'plugin:vue/essential',
    '@vue/standard'
  ]
}
