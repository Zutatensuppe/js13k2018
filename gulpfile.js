const gulp = require('gulp')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const pump = require('pump')
const exec = require('child_process').exec

gulp.task('compress', cb => {
  pump([
      gulp.src('src/*.js'),
      babel({
        presets: ['env']
      }),
      uglify({
        mangle: {
          toplevel: false,
          properties: {
            regex: /^_/,
          },
        },
        compress: true
      }),
      gulp.dest('dist/src')
    ],
    cb
  )
})

gulp.task('copy_png', cb => {
  pump(
    [
      gulp.src('src/spritesheet.png'),
      gulp.dest('dist/src'),
    ], cb
  )
})

gulp.task('copy_html', cb => {
  pump(
    [
      gulp.src('index.html'),
      gulp.dest('dist'),
    ], cb
  )
})

gulp.task('zip', cb => {
  exec('zip -r dist.zip dist', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  })
})

exports.default = gulp.series([
  'compress',
  'copy_png',
  'copy_html',
  'zip',
])
