module.exports = {
  preset: 'ts-jest',
  // setupFilesAfterEnv: ['./scripts/setupJestEnv.ts'],
  globals: {
 
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/.git/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {

  },
  rootDir: __dirname,
  testMatch: ['<rootDir>/tests/**/*spec.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/']
}
