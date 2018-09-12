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
            nodeEnv: isProd ? 'production' : 'development',
            splitChunks: {
                cacheGroups: {
                    // vendors: {
                    //     test: /[\\/]node_modules[\\/]|jquery/,
                    //     name:  '../../../../vendor/commonlib',
                    //     chunks: 'all',
                    // },
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
                    sourceMap: !isProd,
                }),
                new OptimizeCSSAssetsPlugin({}),
            ],
        },
    };
}

function getOutputConf(distDir, publicPath) {
    if (!distDir) {
        return null;
    }
    return {
        // path: path.resolve(__dirname, '../../dist/static/vendor/'),
        path: path.resolve(distDir),
        filename: '[name]_[chunkhash].dll.js',
        library: '[name]_[chunkhash]',
        devtoolNamespace: 'dll_bundle',
        publicPath,
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
    if (modules && modules.rules && Array.isArray(modules.rules)) {
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
                            context: opts.distVendor,
                            // 根据不同的env 生成不同的文件
                            name: () => '[name]-[md5:hash:base58:6].[ext]',
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
                    // context: path.resolve(__dirname, '../../dist/static/vendor'),
                    context: opts.distVendor,
                    // 根据不同的env 生成不同的文件
                    name: () => '[name]-[md5:hash:base58:6].[ext]',
                    // outputPath: path.resolve(opts.assetDir),
                    outputPath: opts.assetDir,
                    // publicPath: opts.publicPath,
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
            verbose: false,
            watch: true,
        }),
        new webpack.DllPlugin({
            path: path.join(opts.manifestConfDir, 'manifest-[name].json'),
            name: '[name]_[chunkhash]',
            // context: __dirname,
            context: opts.manifestConfDir,
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name]-[contenthash:6].css',
            chunkFilename: '[id]-[contenthash:6].css',
        }),
        new ManifestPlugin({
            writeToFileEmit: true,
            publicPath: opts.publicPath,
            fileName: 'dll-assets-manifest.json',
            generate: (seed, files) => files.reduce((manifest, file) => Object.assign({},
                manifest, { [file.path]: file.name }), seed),
        }),
    ];
}

module.exports = {
    getConfig(options) {
        if (!options) {
            return null;
        }
        const opts = Object.assign({}, {
            isProd: false,
            isWatch: false,
        }, options);
        const baseConf = getBaseConfig(opts.isProd, options.isWatch);
        baseConf.output = getOutputConf(opts.distVendor, opts.publicPath);
        baseConf.entry = getEntry(opts.jsEntrys, opts.cssEntrys);
        baseConf.resolve = getResolve(opts.resolve);
        baseConf.module = getModule({
            distVendor: opts.distVendor,
            assetDir: opts.assetDir,
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
