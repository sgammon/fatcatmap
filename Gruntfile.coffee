
module.exports = (grunt) ->

  ## ~~ load plugins ~~ ##
  grunt.loadNpmTasks 'grunt-shell'
  grunt.loadNpmTasks 'grunt-svgmin'
  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-closure-compiler'

  ## ~~ stylesheets ~~ ##
  stylemap = {
    "style/common.css": "less/core/common.less"
    "style/site/home.css": "less/site/home.less"
    "style/themes/fcm-dark.css": "less/themes/fcm-dark.less"
    "style/themes/fcm-light.css": "less/themes/fcm-light.less"
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
          rootpath: "fatcatmap/assets"
          paths: ["less", "bootstrap"]
          sourceMap: true
          sourceMapBasepath: ".develop/maps"
          files: stylemap

      production:
        options:
          compress: true
          cleancss: true
          ieCompat: false
          optimization: 2
          rootpath: "fatcatmap/assets"
          paths: ["less", "bootstrap"]
          files: stylemap

    # - CoffeeScript - #
    coffee:

      # `common.js`
      common:
        files:
          'fatcatmap/assets/js/common.js': ['fatcatmap/assets/coffee/common/*.coffee']
        options:
          sourceMap: true
          sourceMapDir: '.develop/maps'

      # `home.js`
      home:
        files:
          'fatcatmap/assets/js/site/home.js': ['fatcatmap/assets/coffee/home/*.coffee']
        options:
          sourceMap: true
          sourceMapDir: '.develop/maps'


    # - Closure Compiler - #
    'closure-compiler':

      # `common.min.js`
      common:
        closurePath: "lib/closure"
        jsOutputFile: "fatcatmap/assets/js/common.min.js"
        js: "fatcatmap/assets/js/common.js"
        options:
          debug: false,
          language_in: 'ECMASCRIPT5_STRICT'
          compilation_level: 'SIMPLE_OPTIMIZATIONS'

      # `home.min.js`
      home:
        closurePath: "lib/closure"
        jsOutputFile: "fatcatmap/assets/js/site/home.min.js"
        js: [
          "fatcatmap/assets/js/common.js",
          "fatcatmap/assets/js/site/home.js"
        ]
        options:
          debug: false,
          language_in: 'ECMASCRIPT5_STRICT'
          compilation_level: 'SIMPLE_OPTIMIZATIONS'

    'watch':
      scripts:
        files: "fatcatmap/assets/"

    'svgmin': {}

    'shell':
      runServer:
        command: "bin/fcm run"

      buildTemplates:
        command: "bin/fcm build --templates"

      cleanTemplates:
        command: "bin/fcm clean --templates"

  ## ~~ register tasks: `default` ~~ ##
  grunt.registerTask('default', ['less:development', 'coffee:common', 'coffee:home', 'closure-compiler:common', 'closure-compiler:home']);

  ## ~~ register tasks: `watch` ~~ ##
  grunt.registerTask('watch', ['less:development', 'coffee:common', 'coffee:home', 'closure-compiler:common', 'closure-compiler:home', 'watch', 'shell:runServer']);
