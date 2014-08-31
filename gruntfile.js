//jshint maxlen:120, camelcase:false

module.exports = function(grunt) {
  'use strict';
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');


  grunt.initConfig({

    files: {
      all: [
        '!web/bundle.js',
        'web/**/*.js',
      ],
      entry: 'web/main.js',
      output: 'web/bundle.js',
    },

    browserify: {
      build: {
        options: {
          transform: [ 'es6ify' ],
          debug: true,
        },
        src: '<%= files.entry %>',
        dest: '<%= files.output %>',
      },
    },

    watch: {
      js: {
        files: '<%= files.all %>',
        tasks: [ 'browserify:build' ],
      },
    }
  });


  grunt.registerTask('default', [ 'watch' ]);
};
