'use strict';

/* globals module */

module.exports = function(grunt) {
  // configure project
  grunt.initConfig({
    // make node configurations available
    pkg: grunt.file.readJSON('package.json'),
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      src: ['css/*.css', 'src/css/*.css']
    },
    eslint: {
      options: {
        configFile: '.eslintrc',
        cache: true
      },
      target: ['src/**/*.js']
    },
    // Runs the npm test command which has access to the grunt path.
    githooks: {
      all: {
        options: {
          command: 'npm',
        },
        'pre-commit': 'test'
      }
    },
    htmlhint: {
      html1: {
        src: ['src/**/*.html']
      },
      html2: {
        src: ['index.html']
      }
    },
  });

  // enable plugins
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-githooks');
  grunt.loadNpmTasks('grunt-htmlhint');

  // set default tasks to run when grunt is called without parameters
  grunt.registerTask('default', ['csslint', 'htmlhint', 'eslint']);
};
