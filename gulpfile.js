import gulp from 'gulp';
import changed from 'gulp-changed';
import minify from 'gulp-minify';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';
const sass = gulpSass(dartSass);
const publicSCSSDestination = 'public/stylesheets';
function publicSCSSFunction() {
    return gulp
        .src('public-scss/*.scss')
        .pipe(sass({ outputStyle: 'compressed', includePaths: ['node_modules'] }).on('error', sass.logError))
        .pipe(gulp.dest(publicSCSSDestination));
}
gulp.task('public-scss', publicSCSSFunction);
const publicJavascriptsDestination = 'public/javascripts';
function publicJavascriptsMinFunction() {
    return gulp
        .src('public-typescript/*.js', { allowEmpty: true })
        .pipe(changed(publicJavascriptsDestination, {
        extension: '.min.js'
    }))
        .pipe(minify({ noSource: true, ext: { min: '.min.js' } }))
        .pipe(gulp.dest(publicJavascriptsDestination));
}
gulp.task('public-javascript-min', publicJavascriptsMinFunction);
function watchFunction() {
    gulp.watch('public-scss/*.scss', publicSCSSFunction);
    gulp.watch('public-typescript/*.js', publicJavascriptsMinFunction);
}
gulp.task('watch', watchFunction);
gulp.task('default', () => {
    publicJavascriptsMinFunction();
    publicSCSSFunction();
    watchFunction();
});
