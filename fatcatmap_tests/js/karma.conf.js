var REPORT_BASE = '../../../.develop/';

module.exports = {

  port: 9876,
  colors: true,
  basePath: 'fatcatmap/assets/js',
  singleRun: true,
  runnerPort: 9100,
  autoWatch: false,
  logLevel: 'INFO',
  captureTimeout: 7500,
  reportSlowerThan: 500,

  frameworks: ['jasmine'],

  files: [
    'lib/vue/vue.js',
    'compiled/test/app.js',
    'compiled/test/test.js',
  ],

  reporters: [
    'mocha',
    'coverage',
    'junit'
  ],

  browsers: [
    'PhantomJS'
  ],

  preprocessors: {
    'compiled/test/app.js': ['coverage']
  },

  coverageReporter: {
    type: 'cobertura',
    dir: REPORT_BASE + 'coverage/js/'
  },

  junitReporter: {
    outputFile: REPORT_BASE + 'test-reports/js/junit.xml'
  }
};
