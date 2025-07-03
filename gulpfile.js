import gulp from "gulp"
import uglify from 'gulp-uglify'
import javascriptObfuscator from 'gulp-javascript-obfuscator'
import minifyCSS from 'gulp-minify-css'
import autoprefixer from 'gulp-autoprefixer'
import htmlmin from 'gulp-htmlmin'
import watch from 'gulp-watch'

const dist = 'app';

gulp.task('js', function () {
    return gulp.src('src/**/*.js')
        .pipe(javascriptObfuscator())
        .pipe(uglify())
        .pipe(gulp.dest(dist))
})

gulp.task('css', function () {
    return gulp.src('src/**/*.css')
        .pipe(autoprefixer())
        .pipe(minifyCSS())
        .pipe(gulp.dest(dist))
})

gulp.task('html', function () {
    return gulp.src('src/**/*.html')
        .pipe(htmlmin({
            removeComments: true, //清除HTML注释
            collapseWhitespace: true, //压缩HTML
            collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input checked />
            removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
            removeScriptTypeAttributes: false, //删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
            minifyJS: true, //压缩页面JS
            minifyCSS: true //压缩页面CSS
        }))
        .pipe(gulp.dest(dist))
})

gulp.task('images', function () {
    return gulp.src('src/**/*.png')
        .pipe(gulp.dest(dist))
})

gulp.task('watch', function () {
    w('src/**/*.html', 'html')
    w('src/**/*.js', 'js')
    w('src/**/*.css', 'css')
    w('src/**/*.png', 'images')
    w('src/**/*.json', 'config')

    function w(path, task) {
        watch(path, gulp.series([task]))
    }
})

gulp.task('config', function () {
    return gulp.src('src/**/*.json')
        .pipe(gulp.dest(dist))
})

gulp.task('default', gulp.series(['js', 'css', 'html', 'config', 'images', 'watch']))
