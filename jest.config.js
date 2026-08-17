module.exports = {
  testEnvironment: 'node',

  testMatch: [
    '**/*.{test,spec}.{js,ts}'
  ],

  moduleFileExtensions: [
    'js',
    'ts',
    'json'
  ],

  transform: {
    '^.+\\.ts$': 'ts-jest'
  },

  coverageDirectory: 'coverage'
};
