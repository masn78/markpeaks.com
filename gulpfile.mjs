import {dest, parallel, series, src} from "gulp";
import {deleteAsync} from "del";
import embedSvg from "gulp-embed-svg";
import gulpSass from "gulp-sass";
import hb from "gulp-hb";
import htmlMin from "gulp-htmlmin";
import layouts from "handlebars-layouts";
import rename from "gulp-rename";
import replace from "gulp-replace";
import revAll from "gulp-rev-all";
import revDeleteOriginal from "gulp-rev-delete-original";
import * as sass from "sass";


const hbHelpers = {
    browserTitle: title => title.includes("Mark Peaks") ? title : `${title} - Mark Peaks`,
};

layouts.register(hb.handlebars);

const prepare = () =>
    deleteAsync("build", {force: true});

const buildHtml = () =>
    src("public/**/*.hbs")
        .pipe(hb()
            .helpers(hbHelpers)
            .helpers(layouts)
            .partials("partials/**/*.hbs"))
        .pipe(embedSvg({
            root: "./media/",
            xmlMode: false
        }))
        .pipe(htmlMin({
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            decodeEntities: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            sortAttributes: true
        }))
        .pipe(rename({extname: ".html"}))
        .pipe(dest("build"));

const buildCss = () =>
    src("public/main.scss")
        .pipe(gulpSass(sass)({outputStyle: "compressed"}, {}))
        .pipe(dest("build"));

const copyAssets = () =>
    src("public/**/*.{css,html,ico,jpg,pdf,png,svg,txt,webp}", {encoding: false})
        .pipe(dest("build"));

const revAssets = () =>
    src("build/**/*.{css,html,jpg,png,svg,webp}", {encoding: false})
        .pipe(revAll.revision({
            dontGlobal: ["/apple-touch-icon.png", "/favicon.ico"],
            dontRenameFile: [".html"]
        }))
        .pipe(revDeleteOriginal())
        .pipe(dest("build"));

const makeAbsoluteUrls = () =>
    src("build/**/*.html")
        .pipe(replace(/"([^"]*)\?make-absolute"/g, "\"https://marcosanchez.es$1\""))
        .pipe(dest("build"));

export const build =
    series(
        prepare,
        parallel(
            buildHtml,
            buildCss,
            copyAssets),
        revAssets,
        makeAbsoluteUrls);