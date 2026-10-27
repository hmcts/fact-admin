module.exports = {
  roots: ['<rootDir>/src/test/unit/app'],
  "testRegex": "(/src/test/.*|\\.(test|spec))\\.(ts|js)$",
   "moduleFileExtensions": [
    "ts",
    "js"
  ],
  "testEnvironment": "node",
  transform: {
    '^.+\\.[tj]s?$': ['ts-jest', { tsconfig: { allowJs: true } }],
  },
  // sanitize-html's patched parser uses ES modules; Jest 29 needs to transform them.
  transformIgnorePatterns: [
    'node_modules/(?!(?:.*/)?(?:htmlparser2|domhandler|domutils|dom-serializer|domelementtype|entities)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
