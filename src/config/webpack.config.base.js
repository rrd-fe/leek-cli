
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlaceHolderPlugin = require('html-webpack-place-holder-plugin');

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
        watchOptions: {
            aggregateTimeout: 300,
            ignored: /node_modules/,
        },
        entry: {},
        output: {},
        optimization: {
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
                    sourceMap: !opts.prod,
                }),
                new OptimizeCSSAssetsPlugin({}),
            ],
        },
        resolve: {},
        module: {},
        plugins: [],
    };
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
        extensions: ['.js', '.json', '.jsx', '.jpg', '.png', '.jpeg', '.webp', '.svg'],
        unsafeCache: true,
    }, resolve);
}


function getModule(options, modules) {
    if (!options) {
        return null;
    }
    if (modules && modules.rules && Array.isArray(modules.rules)) {
        return modules;
    }
    const opts = Object.assign({}, {
        assetDir: '',
        publicPath: '',
        sassIncludePath: [],
        isProd: false,
        pageDir: '',
    }, options);

    return {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: [['@babel/preset-env', { modules: false }], '@babel/preset-react'],
                        plugins: [
                            'syntax-dynamic-import',
                            ['@babel/plugin-proposal-decorators', { legacy: true }],
                            ['@babel/plugin-proposal-class-properties', { loose: true }],
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
                            ]
                            ,
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
                                require('autoprefixer')(), // eslint-disable-line global-require
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
                        loader: 'css-loader',
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
                        loader: 'css-loader',
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
                            name: () => '[name]-[md5:hash:base58:6].[ext]',
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
                    name: () => '[name]-[md5:hash:base58:6].[ext]',
                    outputPath: opts.assetDir,
                },
            },
        ],
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
{% block block_head_css %}
    <% for (var css in assets.css) { %>
        <style>
            <%- sourceAssets[assets.css[css].substr(publicPath.length)].source() %>
        </style>
    <% } %>
{% endblock %}
            
{% block block_body_js %}
    <% for (var file in assets.js) { %>
    <script src="<%= assets.js[file] %>"></script>
    <% } %>
{% endblock %}`;
    }
    return `
{% block block_head_css %}
    <% for (var css in assets.css) { %>
    <link href="<%= assets.css[css] %>" rel="stylesheet">
    <% } %>
{% endblock %}
            
{% block block_body_js %}
    <% for (var file in assets.js) { %>
    <script src="<%= assets.js[file] %>"></script>
    <% } %>
{% endblock %}`;
}

function formatPlugin(options, plugins) {
    if (Array.isArray(plugins) && plugins.length > 0) {
        return plugins;
    }
    if (!options) {
        return null;
    }
    const opts = Object.assign({}, {
        incss: '',
        distVendor: '',
        distDir: '',
        publicPath: '',
        sassIncludePath: [],
        cleanStatic: '',
        cleanView: '',
        commonJSName: '',
        commonCssName: '',
        manifestDir: '',
        template: '',
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
            watch: true,
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
            filename: '[name]-[hash:6].css',
            chunkFilename: '[id]-[hash:6].css',
        }),
        new HtmlWebpackPlugin({
            filename: opts.pageDist,
            template: opts.pageSource,
            hash: false,
            minify: true,
            inject: false,
            isInlineCss: opts.incss,
        }),
        new HtmlWebpackPlaceHolderPlugin({
            content: getTemplate(opts.incss, opts.template),
        }),
    ];
}

function getOutput(pageDist, publicPath) {
    return {
        path: pageDist, // 打包后的文件存放的地方
        filename: '[id]-[chunkhash:6].js', // 打包后输出文件的文件名
        publicPath,
    };
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

        baseConfig.output = getOutput(params.outputDist, publicPath);

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
            commonCssName: params.commonJSName,
            manifestDir: params.manifestDir,
            template: params.template,
        }, params.plugins);
        baseConfig.watch = params.watch;
        return baseConfig;
    },
};
