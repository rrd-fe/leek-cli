const path = require('path');

const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const CleanWebpackPlugin = require('clean-webpack-plugin');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const ManifestPlugin = require('webpack-manifest-plugin');


// 获取基础的webpack 配置
function getBaseConfig(isProd, isWatch) {
    return {
        mode: isProd ? 'production' : 'development',
        devtool: isProd ? false : 'cheap-module-source-map',
        watch: !!isWatch,
        optimization: {
            splitChunks: {
                cacheGroups: {
                    // vendors: {
                    //     test: /[\\/]node_modules[\\/]|jquery/,
                    //     name:  '../../../../vendor/commonlib',
                    //     chunks: 'all',
                    // },
                    styles: {
                        test: '\.css|\.sass|.scss$',
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
                    sourceMap: isProd ? false : true,
                }),
                new OptimizeCSSAssetsPlugin({}),
            ],
        },
    };
}

function getOutputConf(distDir) {
    if (!distDir) {
        return null;
    }
    return {
        // path: path.resolve(__dirname, '../../dist/static/vendor/'),
        path: path.resolve(distDir),
        filename: '[name]_[chunkhash].dll.js',
        library: '[name]_[chunkhash]',
        devtoolNamespace: 'dll_bundle',
    };
}

function getResolve(resolveObj) {
    return Object.assign({}, {
        alias: {
        },
    }, resolveObj);
}

function getEntry(jsEntrys, cssEntrys) {
    let jsEntry = [];
    let cssEntry = [];

    if (Array.isArray(jsEntrys)) {
        jsEntry = jsEntrys;
    } else {
        jsEntry.push(jsEntrys);
    }

    if (Array.isArray(cssEntrys)) {
        cssEntry = cssEntrys;
    } else {
        cssEntry.push(cssEntrys);
    }

    return {
        commonDll: jsEntry,
        commonCss: cssEntry,
    };
}

function getModule(options, modules) {
    if (!options) {
        return null;
    }
    if (Array.isArray(modules) && modules.length > 0) {
        return modules;
    }
    const opts = Object.assign({}, {
        distVendor: '',
        assetDir: '',
        publicPath: '',
        sassIncludePath: [],
        isProd: false,
    }, options);

    return {
        rules: [
            {
                test: /\.(png|jpg|gif|webp)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            // context: path.resolve(__dirname, '../../dist/static/vendor'),
                            context: path.resolve(opts.distVendor),
                            name: () => {
                                // 根据不同的env 生成不同的文件
                                return '[name]-[md5:hash:base58:6].[ext]';
                            },
                            // outputPath: './assets/',
                            // publicPath: '/jms/static/vendor/assets/',

                            output: opts.assetDir,
                            publicPath: opts.publicPath,
                        },
                    },
                ],
            },
            {
                test: /\.(svg|eot|ttf|ico|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    // context: path.resolve(__dirname, '../../dist/static/vendor'),
                    context: path.resolve(opts.distVendor),
                    name: () => {
                        // 根据不同的env 生成不同的文件
                        return '[name]-[md5:hash:base58:6].[ext]';
                    },
                    // publicPath: '../../../',
                    // outputPath: './assets/',
                    // publicPath: '/jms/static/vendor/assets/',

                    output: opts.assetDir,
                    publicPath: opts.publicPath,
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
                            sourceMap: !!opts.isProd ? false : true,
                            modules: false,
                            camelCase: true,
                            minimize: !!opts.isProd ? true : false,
                            localIdentName: '[name]__[local]--[hash:base64:5]',
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: (loader) => {
                                return [
                                    // require('postcss-import')({ root: loader.resourcePath }),
                                    // require('postcss-cssnext')(),
                                    require('autoprefixer')(),
                                    // require('cssnano')()
                                ];
                            },
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
                            sourceMap: !!opts.isProd ? false : true,
                            modules: false,
                            camelCase: true,
                            minimize: !!opts.isProd ? true : false,
                            localIdentName: '[name]__[local]--[hash:base64:5]',
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            sourceMap: opts.isProd ? false : true,
                            plugins: (loader) => {
                                return [
                                    // require('postcss-import')({ root: loader.resourcePath }),
                                    // require('postcss-cssnext')(),
                                    require('autoprefixer')(),
                                    // require('cssnano')()
                                ];
                            },
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: opts.isProd ? false : true,
                            // includePaths: [
                            //     path.resolve(__dirname, '../src/'),
                            // ],
                            includePaths: opts.sassIncludePath,
                        },
                    },
                ],
            },
            {
                // 打包inline css
                test: /_\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'style-loader/url',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: opts.isProd ? false : true,
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
                            sourceMap: !!opts.isProd ? false : true,
                            modules: true,
                            camelCase: true,
                            minimize: !!opts.isProd ? true : false,
                            localIdentName: '[name]__[local]--[hash:base64:5]',
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            sourceMap: opts.isProd ? false : true,
                            plugins: (loader) => { 
                                return [
                                    // require('postcss-import')({ root: loader.resourcePath }),
                                    // require('postcss-cssnext')(),
                                    require('autoprefixer')(),
                                    // require('cssnano')()
                                ];
                            },
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: opts.isProd ? false : true,
                            // includePaths: [
                            //     path.resolve(__dirname, '../src/'),
                            // ],
                            includePaths: opts.includePaths,
                        },
                    },
                ],
            },
        ],
    };
}

function getPlugin(options, plugins) {
    if (Array.isArray(plugins) && plugins.length > 0) {
        return plugins;
    }
    if (!options) {
        return null;
    }
    const opts = Object.assign({}, {
        distVendor: '',
        distDir: '',
        manifestConfDir: '',
        publicPath: '',
        sassIncludePath: [],
    }, options);

    return [
        new CleanWebpackPlugin(opts.distVendor, {
            // root: path.resolve(__dirname, '../../'),
            root: opts.distDir,
        }),
        new webpack.DllPlugin({
            path: path.join(opts.manifestConfDir, 'manifest-[name].json'),
            name: '[name]_[chunkhash]',
            // context: __dirname,
            // context: opts.manifestConfDir,
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name]-[contenthash:6].css',
            chunkFilename: '[id]-[contenthash:6].css',
        }),
        new ManifestPlugin({
            writeToFileEmit: true,
            // publicPath: '/jms/static/vendor/',
            // fileName: 'dll-assets-manifest.json',
            publicPath: opts.publicPath,
            fileName: 'dll-assets-manifest.json',
            generate: (seed, files) => {
                return files.reduce((manifest, file) => {
                    return Object.assign({}, manifest, { [file.path]: file.name });
                }, seed);
            },
        }),
    ];
}

module.exports = {
    getDllWPConf(options) {
        if (!options) {
            return null;
        }
        const opts = Object.assign({}, {
            isProd: false,
            isWatch: false,
        }, options);

        const baseConf = getBaseConfig(opts.isProd, options.isWatch);
        baseConf.output = getOutputConf(opts.distVendor);
        baseConf.entry = getEntry(opts.jsEntrys, opts.cssEntrys);
        baseConf.resolve = getResolve(opts.resolve);

        baseConf.module = getModule({
            distVendor: opts.distVendor,
            assetsDir: opts.assetDir,
            publicPath: opts.publicPath,
            sassIncludePath: opts.sassIncludePath,
            isProd: opts.isProd,
        }, opts.module);

        baseConf.plugins = getPlugin({
            distDir: opts.distDir,
            distVendor: opts.distVendor,
            manifestConfDir: opts.manifestConfDir,
            publicPath: opts.publicPath,
        }, opts.plugins);

        return baseConf;
    },
};
