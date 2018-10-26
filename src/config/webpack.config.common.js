
/* eslint global-require: "error" */


const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('rrd-html-webpack-include-assets-plugin');
const HtmlWebpackPlaceHolderPlugin = require('html-webpack-place-holder-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const merge = require('webpack-merge');

function getBaseConfig(options) {
    if (!options) {
        return null;
    }
    const opts = Object.assign({}, {
        isProd: false,
        moduleDir: '',
    }, options);

    return {
        mode: opts.isProd ? 'production' : 'development',
        context: opts.moduleDir,
        devtool: opts.isProd ? false : 'cheap-module-source-map', // 开发模式下
        entry: {},
        output: {},
        optimization: {
            nodeEnv: opts.isProd ? 'production' : 'development',
            // runtimeChunk: {
            //     name: 'common-runtime-manifest',
            // },
            splitChunks: {
                cacheGroups: {
                    styles: {
                        test: /\.css|\.sass|.scss$/,
                        name: 'style',
                        chunks: 'all',
                        enforce: true,
                    },
                },
            },
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: !opts.isProd, // set to true if you want JS source maps
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessorOptions: {
                        normalizeUrl: {
                            stripWWW: false,
                        },
                        autoprefixer: { disable: true },
                    },
                }),
            ],
        },
        resolve: {},
        module: {},
        plugins: [],
        resolveLoader: {
            modules: [
                path.join(__dirname, '../../node_modules'),
            ],
        },
    };
}


function getTemplate(isInlineCss, template) {
    if (typeof template === 'function') {
        return template(isInlineCss);
    }
    if (template) {
        return template;
    }
    if (isInlineCss) {
        return `
<% for (var css in assets.css) { %>
    <% if(assets.rawData[assets.css[css].substr(publicPath.length)]) {%>
    <style>
        <%= assets.rawData[assets.css[css].substr(publicPath.length)].source %>
    </style>
    <% } %>
<% } %>

<% for (var css in htmlWebpackPlugin.files.css) { %>
    <% if(htmlWebpackPlugin.files.rawData[htmlWebpackPlugin.files.css[css].substr(htmlWebpackPlugin.files.publicPath.length)]) {%>
    <style>
        <%= htmlWebpackPlugin.files.rawData[htmlWebpackPlugin.files.css[css].substr(htmlWebpackPlugin.files.publicPath.length)].source %>
    </style>
    <% } %>
<% } %>

<% for (var css in assets.css) { %>
    <% if( sourceAssets[assets.css[css].substr(publicPath.length)]) {%>
    <style>
        <%= sourceAssets[assets.css[css].substr(publicPath.length)].source() %>
    </style>
    <% } %>
<% } %>

<% for (var file in assets.js) { %>
    <script src="<%= assets.js[file] %>"></script>
<% } %>`;
    }
    return `
<% for (var css in assets.css) { %>
    <link href="<%= assets.css[css] %>" rel="stylesheet">
<% } %>

<% for (var file in assets.js) { %>
    <script src="<%= assets.js[file] %>"></script>
<% } %>`;
}

function formatPlugin(options, plugins) {
    if (Array.isArray(plugins) && plugins.length > 0) {
        return plugins;
    }
    if (!options) {
        return null;
    }
    const opts = Object.assign({}, {
        incss: false,
        distVendor: '',
        distDir: '',
        publicPath: '',
        sassIncludePath: [],
        cleanStatic: '',
        cleanView: '',
        commonJSName: '',
        commonCssName: '',
        manifestDir: '',
        isProd: false,
    }, options);

    const commonJSPath = path.join(opts.manifestDir, opts.commonJSName);
    const commonCssPath = path.join(opts.manifestDir, opts.commonCssName);

    // pageList, cleanStatic, cleanView, incss
    return [
        new CleanWebpackPlugin([
            opts.cleanStatic,
            opts.cleanView,
        ], {
            root: opts.distDir,
            beforeEmit: true,
            verbose: false,
            watch: false,
        }),
        new webpack.DllReferencePlugin({
            // context: __dirname,
            context: opts.manifestDir,
            manifest: require(commonJSPath), // eslint-disable-line global-require
        }),
        new webpack.DllReferencePlugin({
            // context: __dirname,
            context: opts.manifestDir,
            manifest: require(commonCssPath), // eslint-disable-line global-require
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: opts.isProd ? '[name]-[hash:6].css' : '[name].css',
            chunkFilename: opts.isProd ? '[id]-[hash:6].css' : '[id].css',
        }),
        new HtmlWebpackPlugin({
            filename: opts.pageDist,
            template: opts.pageSource,
            hash: false,
            minify: true,
            // xhtml: true,
            inject: false,
            notUsePlaceHolder: false,
            isInlineCss: opts.incss,
            // isPreprocess: true,
        }),
        new HtmlWebpackIncludeAssetsPlugin({
            assets: [
                {
                    path: '../../../vendor/',
                    globPath: opts.distVendor,
                    glob: '*.js',
                    type: 'js',
                },
                {
                    path: '../../../vendor/',
                    globPath: opts.distVendor,
                    glob: '*.css',
                    type: 'css',
                },
            ],
            append: false,
            includeData: '',
        }),
        new HtmlWebpackPlaceHolderPlugin({
            content: getTemplate(opts.incss, opts.template),
        }),
        new HardSourceWebpackPlugin(),
    ];
}

function getOutput(isProd, jsonpFn, pageDist, publicPath) {
    return {
        path: pageDist, // 打包后的文件存放的地方
        filename: isProd ? '[id]-[chunkhash:6].js' : '[id].js', // 打包后输出文件的文件名
        jsonpFunction: jsonpFn,
        publicPath,
    };
}


function getMergeOptions(fullCusConf) {
    return fullCusConf && fullCusConf.merge;
}

// 对指定的rule 进行合并
function rulesReplace(origin, dist) {
    const resRules = [];
    if (!origin.rules || !dist.rules) {
        return resRules;
    }
    origin.rules.forEach((v) => {
        if (!v) {
            return;
        }
        const dv = dist.rules.find((v1) => {
            if (v1 && v1.test && v && v.test) {
                if (v1.test.toString() === v.test.toString()) {
                    return true;
                }
            }
            return false;
        });
        if (dv) {
            resRules.push(Object.assign({}, v, dv));
        } else {
            resRules.push(v);
        }
    });
    const res = Object.assign({}, origin, dist);
    res.rules = resRules;
    return res;
}

function getModule(options, modules) {
    if (!options) {
        return null;
    }
    const opts = Object.assign({}, {
        assetDir: '',
        publicPath: '',
        sassIncludePath: [],
        isProd: false,
        pageDir: '',
        cssModulesTypings: false,
        fullCusConf: {},
    }, options);

    const mergeOpt = getMergeOptions(opts.fullCusConf);

    let resModule = {
        rules: [
            // All files with a '.ts' or '.tsx' extension
            // will be handled by 'awesome-typescript-loader'.
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                options: {
                    useCache: true,
                },
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                test: /\.js$/,
                loader: 'source-map-loader',
                enforce: 'pre',
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: [[require('@babel/preset-env'), { modules: false }], require('@babel/preset-react')], // eslint-disable-line global-require
                        plugins: [
                            // fixed css module bug
                            // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/27
                            // require('@babel/plugin-transform-modules-commonjs'),
                            // eslint-disable-line global-require
                            require('babel-plugin-syntax-dynamic-import'), // eslint-disable-line global-require
                            [require('@babel/plugin-proposal-decorators'), { legacy: true }], // eslint-disable-line global-require
                            [require('@babel/plugin-proposal-class-properties'), { loose: true }], // eslint-disable-line global-require
                        ],
                    },
                },
            },
            {
                test: /[^_]\.css$/,
                use: [
                    // prod ? MiniCssExtractPlugin.loader : 'style-loader',
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: !opts.isProd,
                            modules: false,
                            camelCase: true,
                            minimize: opts.isProd,
                            localIdentName: '[name]__[local]--[hash:base64:5]',
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: () => [
                                // require('postcss-import')({ root: loader.resourcePath }),
                                // require('postcss-cssnext')(),
                                require('autoprefixer')(), // eslint-disable-line global-require
                                // require('cssnano')()
                            ],
                        },
                    },
                ],
            },
            {
                test: /[^_](\.sass|\.scss)$/,
                use: [
                    // prod ? MiniCssExtractPlugin.loader : 'style-loader',
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: !opts.isProd,
                            modules: false,
                            camelCase: true,
                            minimize: opts.isProd,
                            localIdentName: '[name]__[local]--[hash:base64:5]',
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            sourceMap: !opts.isProd,
                            plugins: () => [
                                // require('postcss-import')({ root: loader.resourcePath }),
                                // require('postcss-cssnext')(),
                                require('autoprefixer')(), // eslint-disable-line global-require
                                // require('cssnano')()
                            ],
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: !opts.isProd,
                            includePaths: opts.sassIncludePath,
                        },
                    },
                ],
            },
            {
                test: /_\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'style-loader/url',
                    },
                    {
                        loader: opts.cssModulesTypings ? 'typings-for-css-modules-loader' : 'css-loader',
                        options: {
                            sourceMap: !opts.isProd,
                            modules: true,
                            camelCase: true,
                        },
                    },
                ],
            },
            {
                test: /(_\.sass)|(_\.scss)$/,
                use: [
                    // prod ? MiniCssExtractPlugin.loader : 'style-loader',
                    MiniCssExtractPlugin.loader,
                    {
                        loader: opts.cssModulesTypings ? 'typings-for-css-modules-loader' : 'css-loader',
                        options: {
                            sourceMap: !opts.isProd,
                            modules: true,
                            camelCase: true,
                            minimize: opts.isProd,
                            localIdentName: '[name]__[local]--[hash:base64:5]',
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            sourceMap: !opts.isProd,
                            plugins: () => [
                                // require('postcss-import')({ root: loader.resourcePath }),
                                // require('postcss-cssnext')(),
                                require('autoprefixer')(), // eslint-disable-line global-require
                                // require('cssnano')()
                            ],
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: !opts.isProd,
                            includePaths: opts.sassIncludePath,
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpg|gif|webp)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            // context: path.resolve(__dirname, '../../../../'),
                            context: opts.pageDir,
                            // 根据不同的env 生成不同的文件
                            name: () => (opts.isProd ? '[name]-[md5:hash:base58:6].[ext]' : '[name].[ext]'),
                            // publicPath: '../../../',
                            // outputPath: './assets/',
                            outputPath: opts.assetDir,
                            // publicPath: opts.publicPath,
                        },
                    },
                ],
            },
            {
                test: /\.(svg|eot|ttf|ico|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    // context: path.resolve(__dirname, '../../../../'), // static/
                    context: opts.pageDir,
                    name: () => (opts.isProd ? '[name]-[md5:hash:base58:6].[ext]' : '[name].[ext]'),
                    outputPath: opts.assetDir,
                },
            },
        ],
    };

    let mergeFn = null;
    if (!mergeOpt || !mergeOpt.module) {
        mergeFn = merge;
    } else {
        const { method } = mergeOpt.module;
        if (method && merge[method]) {
            mergeFn = merge[method](mergeOpt.module.options);
        } else if (method === 'rulesReplace') {
            mergeFn = rulesReplace;
        } else {
            mergeFn = merge;
        }
    }
    resModule = mergeFn(resModule, modules);
    return resModule;
}

function getResolve(options, resolve) {
    if (!options) {
        return null;
    }
    if (!options) {
        return null;
    }
    const opts = Object.assign({}, {
        srcDir: '',
        clientNodeModules: '',
    }, options);

    return Object.assign({}, {
        // 优先搜索当前src 目录，其次搜索node modules
        modules: [opts.srcDir, opts.clientNodeModules],
        alias: {},
        extensions: ['.js', '.json', '.jsx', '.ts', '.tsx', '.jpg', '.png', '.jpeg', '.webp', '.svg'],
    }, resolve);
}

module.exports = {
    getConfig(params) {
        const publicPath = params.publicPath || '';
        const jsEntry = params.jsEntry || '';
        const jsEntryName = params.jsEntryName || '';
        const cleanStatic = params.cleanStatic || '';
        const cleanView = params.cleanView || '';
        const prod = params.isProd;
        const baseConfig = getBaseConfig({
            isProd: prod,
            moduleDir: params.moduleDir,
        });

        if (jsEntryName && jsEntry) {
            baseConfig.entry[jsEntryName] = jsEntry;
        } else {
            baseConfig.entry = null;
        }

        baseConfig.output = getOutput(prod, params.jsonpFn, params.outputDist, publicPath);

        const resolveFinal = getResolve({
            srcDir: params.srcDir,
            clientNodeModules: params.clientNodeModules,
        }, params.resolve);

        if (resolveFinal) {
            baseConfig.resolve = resolveFinal;
        }

        baseConfig.module = getModule({
            distVendor: params.distVendor,
            assetDir: params.assetDir,
            publicPath: params.publicPath,
            sassIncludePath: params.sassIncludePath,
            isProd: prod,
            pageDir: params.outputDist,
            srcDir: params.srcDir,
            fullCusConf: params.fullCusConf,
            cssModulesTypings: params.cssModulesTypings,
        }, params.modules);

        baseConfig.plugins = formatPlugin({
            cleanStatic,
            cleanView,
            incss: params.incss,
            pageSource: params.pageSource,
            pageDist: params.pageDist,
            distVendor: params.distVendor,
            distDir: params.distDir,
            publicPath: params.publicPath,
            commonJSName: params.commonJSName,
            commonCssName: params.commonCssName,
            manifestDir: params.manifestDir,
            template: params.template,
            isProd: prod,
        }, params.plugins);
        baseConfig.watch = params.watch;
        return baseConfig;
    },
};
