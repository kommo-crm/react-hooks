import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  clearMocks: true,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  coverageDirectory: 'coverage',
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx)'],
  rootDir: './',
  moduleNameMapper: {
    '^@utils': '<rootDir>/src/utils',
  },
};

export default config;
