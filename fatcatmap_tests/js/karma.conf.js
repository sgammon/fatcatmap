var JS_BASE = '../../fatcatmap/assets/js/',
  REPORT_BASE = '../../.develop/';

module.exports = {

  port: 9876,
  colors: true,
  basePath: 'fatcatmap_tests/js/',
  singleRun: true,
  runnerPort: 9100,
  autoWatch: false,
  logLevel: 'INFO',
  captureTimeout: 7500,
  reportSlowerThan: 500,

  frameworks: ['jasmine'],

  _releaseFiles: [
    JS_BASE + 'lib/closure/base.js',
    JS_BASE + 'compiled/*.min.js',
    'simulate/mocks.js',
    'spec/unit/*.js'
  ],

  _debugFiles: [
    JS_BASE + 'lib/closure/base.js',
    JS_BASE + 'compiled/*.debug.js',
    'simulate/mocks.js',
    'spec/unit/*.js'
  ],

  files: [],

  reporters: [
    'progress',
    'coverage',
    'junit'
  ],

  browsers: [
    'PhantomJS'
  ],

  preprocessors: {
    '../../fatcatmap/assets/js/compiled/*.debug.js': ['coverage']
  },

  coverageReporter: {
    type: 'cobertura',
    dir: REPORT_BASE + 'coverage/js/'
  },

  junitReporter: {
    outputFile: REPORT_BASE + 'test-reports/js/junit.xml'
  }
};
