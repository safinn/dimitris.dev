import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  typescript: true,
  react: true,
  rules: {
    'no-console': 'off',
    'ts/consistent-type-definitions': ['error', 'type'],
  },
})
