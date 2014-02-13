// Karma configuration
// Generated on Mon Dec 30 2013 16:14:03 GMT+0100 (CET)

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// + For automated testing with Grunt, some settings in this config file  +
// + are overridden in Gruntfile.js. Check both locations.                +
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    //
    // Available for chai (installed with karma-chai-plugins):
    // sinon-chai, chai-as-promised, chai-jquery. Enable as needed.
    //
    // NB sinon-chai includes Sinon; chai-jquery does _not_ include jQuery
    frameworks: ['mocha', 'chai', 'sinon-chai'],


    // list of files / patterns to load in the browser
    files: [
      // Component dependencies
      'bower_components/underscore/underscore.js',
      'bower_components/backbone/backbone.js',
      'bower_components/backbone.select/dist/backbone.select.js',

      'lib-other/**/*.js',

      // Component under test
      'src/backbone.cycle.js',

      // Tests
      'spec/**/*.+(spec|test).js'
    ],


    // list of files to exclude
    exclude: [
      
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['mocha'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    //
    // ATTN Interactive debugging in PhpStorm/WebStorm doesn't work with PhantomJS. Use Firefox or Chrome instead.
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
