// ////////////////////////////////////////////////////////////////////////////
// Required
// ////////////////////////////////////////////////////////////////////////////
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var rename = require('gulp-rename');
var webpack = require('gulp-webpack');


// ////////////////////////////////////////////////////////////////////////////
// build js
// ////////////////////////////////////////////////////////////////////////////
gulp.task('buildJs', function(){
  return gulp.src('src/app.jsx')
    .pipe(plumber())
    .pipe(webpack({
      entry: './src/app.jsx',
      module: {
        loaders: [{
          test: /\.jsx?$/,
          loader: 'babel',
          query: {
            presets: ['react', 'es2015']
          }
        }]
      }

    }))
    .pipe(rename('app.js'))
    .pipe(gulp.dest('build'))
    .pipe(reload({stream: true}));
});

// ////////////////////////////////////////////////////////////////////////////
// index.jade => html
// ////////////////////////////////////////////////////////////////////////////
gulp.task('buildIndexHTML', function(){
  return gulp.src('jade/index.jade')
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./'))
    .pipe(reload({stream: true}));
});

// ////////////////////////////////////////////////////////////////////////////
// jade => html
// ////////////////////////////////////////////////////////////////////////////
gulp.task('buildHTML', function(){
  return gulp.src('jade/components/**/*.jade')
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('pages'))
    .pipe(reload({stream: true}));
});

// ////////////////////////////////////////////////////////////////////////////
// sass => css
// ////////////////////////////////////////////////////////////////////////////
gulp.task('buildCSS', function(){
  return gulp.src('./sass/main.sass')
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest('./css'))
    .pipe(reload({stream: true}));
});

// ////////////////////////////////////////////////////////////////////////////
// browser-sync
// ////////////////////////////////////////////////////////////////////////////
gulp.task('browser-sync', function(){
  browserSync({
    server:{
      baseDir: './'
    }
  });
});

// ////////////////////////////////////////////////////////////////////////////
// Watch
// ////////////////////////////////////////////////////////////////////////////
gulp.task('watch', function(){
  gulp.watch('./sass/**/*.sass', ['buildCSS']);
  gulp.watch('jade/index.jade', ['buildIndexHTML']);
  gulp.watch('jade/components/**/*.jade', ['buildHTML', ['buildIndexHTML']]);
  gulp.watch('src/**/*.jsx', ['buildJs']);
});
// ////////////////////////////////////////////////////////////////////////////
// Default
// ////////////////////////////////////////////////////////////////////////////
gulp.task('default', ['buildJs','buildIndexHTML', 'buildHTML', 'buildCSS', 'browser-sync', 'watch']);
