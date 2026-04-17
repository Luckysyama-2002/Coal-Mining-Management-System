module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js', // exclude main app file
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};