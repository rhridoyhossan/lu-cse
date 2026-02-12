export default {
  // Entry points: where your app starts
  entry: [
    'app/**/*.{js,ts,tsx}',
  ],

  // All files Knip should analyze
  project: [
    '**/*.{js,ts,tsx}',
  ],

  // Ignore generated / config stuff
  ignore: [
    '.next/**',
    'node_modules/**',
    '**/*.test.{js,ts,tsx}',
    '**/*.spec.{js,ts,tsx}',
  ],
}
