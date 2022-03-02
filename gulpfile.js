const { src, dest, watch, series, parallel } = require('gulp');

const pug = require('gulp-pug');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob-use-forward');
const postcss = require('gulp-postcss');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const browserSync = require("browser-sync").create();

// ファイルパス
const filepath = { src: 'src/', dist: 'htdocs/' };
const filesrc = {
    html: `${filepath.src}pug/**/*.pug`,
    css: `${filepath.src}scss/**/*.scss`,
    js: `${filepath.src}js/*.js`
};

// HTML
const html = () => {
    return src(filesrc.html)
        .pipe(pug({
            pretty: true
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(dest(`${filepath.dist}/`));
};

// Sassトランスパイル・圧縮
const css = () => {
    return src(filesrc.css)
        .pipe(sassGlob())
        .pipe(
            sass({
                outputStyle: 'compressed'
            }).on('error', sass.logError)
        )
        .pipe(
            postcss([
                require('autoprefixer')({
                    grid: 'autoplace',
                    cascade: false
                }),
                require('css-mqpacker')
            ])
        )
        .pipe(dest(`${filepath.dist}asset/css/`));
};

// JS圧縮
const js = () => {
    return src(filesrc.js)
        .pipe(
            babel({
                presets: ['@babel/preset-env']
            })
        )
        .pipe(uglify())
        .pipe(dest(`${filepath.dist}asset/js/`));
};

// ブラウザ自動リロード
const browserSyncFunc = (done) => {
    browserSync.init(browserSyncOption);
    done();
}

const browserSyncOption = {
    open: true,
    server: {
        baseDir: "htdocs/",
        index: "index.html"
    },
    notify: false,
    reloadOnRestart: true
}

const browserSyncReload = (done) => {
    browserSync.reload();
    done();
}

// 変更ファイルの監視
const watchFiles = () => {
    watch(filesrc.html, series(html, browserSyncReload))
    watch(filesrc.css, series(css, browserSyncReload))
    watch(filesrc.js, series(js, browserSyncReload))
};

// タスク登録
exports.html = html;
exports.css = css;
exports.js = js;
exports.browserSyncReload = browserSyncReload;
exports.watchFiles = watchFiles;

// タスク呼び出し
exports.default = series(parallel(html, css, js), parallel(watchFiles, browserSyncFunc));
exports.build = parallel(html, css, js);
