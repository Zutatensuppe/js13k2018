let gulp = require('gulp')
let babel = require('gulp-babel')
let uglify = require('gulp-uglify')
let pump = require('pump')

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

gulp.task('default', [
  'compress',
  'copy_png',
  'copy_html',
])