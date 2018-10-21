module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'json'
  ],
  moduleNameMapper: {
    '^@microfleet/((?:iap|rbac).*)$': '<rootDir>/packages/$1/src'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.test.json',
      diagnostics: false
    }
  }
};
