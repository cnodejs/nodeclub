/**
 * gulp test
 */

var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test', function () {
	return gulp.src('test/**/*.test.js', {read: false})
		.pipe(mocha({
			timeout: 5000,
			reporter: 'spec',
			require: ['should']
		}))
		.once('end',function(){
			process.exit();
		})
		;
});