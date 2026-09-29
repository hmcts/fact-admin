module.exports = {
  roots: ['<rootDir>/src/test/unit/app'],
  "testRegex": "(/src/test/.*|\\.(test|spec))\\.(ts|js)$",
  "testEnvironment": "node",
  transform: {
    '^.+\\.(ts|js)$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(sanitize-html|htmlparser2|domhandler|domutils|domelementtype|entities|dom-serializer)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
