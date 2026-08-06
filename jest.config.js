module.exports = {
  verbose: true,
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.test.ts'],
  preset: 'ts-jest',
  coverageDirectory: './coverage/',
  collectCoverage: true,
  testEnvironmentOptions: { url: 'http://localhost:3000' },
  resetMocks: true,
};
