
module.exports = (grunt) ->

  ## ~~ load plugins ~~ ##
  grunt.loadNpmTasks 'grunt-shell'
  grunt.loadNpmTasks 'grunt-svgmin'
  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-closure-compiler'

  ## ~~ stylesheets ~~ ##
  stylemap = {
    "fatcatmap/assets/style/common.css": "fatcatmap/assets/less/core/common.less"
    "fatcatmap/assets/style/site/home.css": "fatcatmap/assets/less/site/home.less"
    "fatcatmap/assets/style/themes/fcm-dark.css": "fatcatmap/assets/less/themes/fcm-dark.less"
    "fatcatmap/assets/style/themes/fcm-light.css": "fatcatmap/assets/less/themes/fcm-light.less"
  }

  ## ~~ configure stuffs ~~ ##
  grunt.initConfig

    pkg: grunt.file.readJSON('package.json')

    # - LESS - #
    less:
      development:
        options:
          compress: false
          cleancss: false
          ieCompat: false
          optimization: 2
          paths: ["fatcatmap/assets/less", "fatcatmap/assets/bootstrap"]
          sourceMap: true
          sourceMapBasepath: ".develop/maps"
        files: stylemap

      production:
        options:
          compress: true
          cleancss: true
          ieCompat: false
          optimization: 2
          paths: ["fatcatmap/assets/less", "fatcatmap/assets/bootstrap"]
        files: stylemap

    # - CoffeeScript - #
    coffee:

      # `common.js`
      common:
        files:
          'fatcatmap/assets/js/common.js': ['fatcatmap/assets/coffee/common/*.coffee']
        options:
          sourceMap: true
          sourceMapDir: '.develop/maps/fatcatmap/assets/coffee'

      # `home.js`
      home:
        files:
          'fatcatmap/assets/js/site/home.js': ['fatcatmap/assets/coffee/home/*.coffee']
        options:
          sourceMap: true
          sourceMapDir: '.develop/maps/fatcatmap/assets/coffee/site'


    # - Closure Compiler - #
    'closure-compiler':

      # `common.min.js`
      common:
        closurePath: "lib/closure"
        jsOutputFile: "fatcatmap/assets/js/common.min.js"
        js: "fatcatmap/assets/js/common.js"
        options:
          debug: false
          summary_detail_level: 3
          use_types_for_optimization: undefined
          language_in: 'ECMASCRIPT5_STRICT'
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
          define: [
            '"DEBUG=false"'
          ]

      # DEBUG: `common.min.js`
      common_debug:
        closurePath: "lib/closure"
        jsOutputFile: "fatcatmap/assets/js/common.min.js"
        js: "fatcatmap/assets/js/common.js"
        options:
          debug: true
          summary_detail_level: 3
          language_in: 'ECMASCRIPT5_STRICT'
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
          formatting: 'PRETTY_PRINT'
          create_source_map: ".develop/maps/fatcatmap/assets/js/common.min.js.map"
          define: [
            '"DEBUG=true"'
          ]

      # `home.min.js`
      home:
        closurePath: "lib/closure"
        jsOutputFile: "fatcatmap/assets/js/site/home.min.js"
        js: [
          "fatcatmap/assets/js/common.js",
          "fatcatmap/assets/js/site/home.js"
        ]
        options:
          debug: false
          summary_detail_level: 3
          use_types_for_optimization: undefined
          language_in: 'ECMASCRIPT5'
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
          define: [
            '"DEBUG=false"'
          ]

      # DEBUG: `home.min.js`
      home_debug:
        closurePath: "lib/closure"
        jsOutputFile: "fatcatmap/assets/js/site/home.min.js"
        js: [
          "fatcatmap/assets/js/common.js",
          "fatcatmap/assets/js/site/home.js"
        ]
        options:
          debug: true
          summary_detail_level: 3
          language_in: 'ECMASCRIPT5'
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
          formatting: 'PRETTY_PRINT'
          create_source_map: ".develop/maps/fatcatmap/assets/js/site/home.min.js.map"
          define: [
            '"DEBUG=true"'
          ]

    'svgmin': {}

    'shell':
      runServer:
        command: "bin/fcm run"

      buildTemplates:
        command: "bin/fcm build --templates"

      cleanTemplates:
        command: "bin/fcm clean --templates"

  ## ~~ register tasks: `default` ~~ ##
  grunt.registerTask 'default', [
    'less:development',
    'coffee',
    'closure-compiler:common_debug',
    'closure-compiler:home_debug'
  ]

  ## ~~ register tasks: `develop` ~~ ##
  grunt.registerTask 'develop', [
    'less:development',
    'coffee',
    'closure-compiler:common_debug',
    'closure-compiler:home_debug',
    'watch',
    'shell:runServer'
  ]

  ## ~~ register tasks: `release` ~~ ##
  grunt.registerTask 'release', [
    'less:production',
    'coffee',
    'closure-compiler:common',
    'closure-compiler:home'
  ]
