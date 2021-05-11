const gulp = require('gulp')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const exec = require('child_process').exec

gulp.task('compress', () => {
  return gulp.src('src/*.js')
    .pipe(babel({presets: ['env']}))
    .pipe(uglify({
      mangle: {
        toplevel: false,
        properties: {
          regex: /^_/,
        },
      },
      compress: true
    }))
    .pipe(gulp.dest('dist/src'))
})

gulp.task('copy_png', () => {
  return gulp.src('src/spritesheet.png')
    .pipe(gulp.dest('dist/src'))
})

gulp.task('copy_html', () => {
  return gulp.src('index.html')
    .pipe(gulp.dest('dist'))
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
