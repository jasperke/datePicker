//'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		LIB_PATH: './bower_components/',
		banner: [
				 '/*',
				 '* Project: <%= pkg.name %>',
				 '* Version: <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd HH:MM") %>)',
				 '* Development By: <%= pkg.author %>',
				 '* Copyright(c): <%= grunt.template.today("yyyy") %>',
				 '*/',
				 ''
		],
		uglify: {
			options: {
				banner: '<%= banner.join("\\n") %>'
			},
			dist: {
				files: {
					'../datePicker.min.js': ['../datePicker.js']
				}
			}
		},
		copy: {
			dist: {
				files: [
					{expand:true, cwd:'<%= LIB_PATH %>jquery', src:'jquery.min.js', dest:'../'}
				]
			},
			dev: {
				files: [
					{src:'../datePicker.js', dest:'../datePicker.min.js'}
				]
				// files: [
				// 	{expand:false, cwd:'../', src:'datePicker.js', dest:''}
				// ]
			}
		},
		watch: {
			scripts: {
				files: ['../datePicker.js'],
				tasks: ['copy:dev'],
				options: {
					spawn: true,
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

//	grunt.registerTask('dev', ['copy:dev']);
	grunt.registerTask('default', ['copy:dist', 'uglify']);
};