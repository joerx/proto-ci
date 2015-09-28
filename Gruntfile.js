'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    browserify: {
      app: {
        files: {
          'public/js/bundle.js': ['public/js/main.js']
        },
        options: {
          browserifyOptions: {debug: true},
          transform: ['babelify']
        }
      }
    },
    watch: {
      browserify: {
        files: ['public/js/**/*.js'],
        tasks: ['browserify']
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');

};
