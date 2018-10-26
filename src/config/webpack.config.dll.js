const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const merge = require('webpack-merge');


// 获取基础的webpack 配置
function getBaseConfig(isProd, isWatch) {
    return {
        mode: isProd ? 'production' : 'development',
        devtool: isProd ? false : 'cheap-module-source-map',
        watch: !!isWatch,
        optimization: {
            nodeEnv: isProd ? 'production' : 'development',
            // runtimeChunk: {
            //     name: 'dll-runtime-manifest',
            // },
            splitChunks: {
                cacheGroups: {
                    // vendors: {
                    //     test: /[\\/]node_modules[\\/]|jquery/,
                    //     name:  '../../../../vendor/commonlib',
                    //     chunks: 'all',
                    // },
                    // styles: {
                    //     test: /\.css|\.sass|.scss$/,
                    //     name: 'style',
                    //     chunks: 'all',
                    //     enforce: true,
                    // },
                },
            },
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: !isProd,
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
        resolveLoader: {
            modules: [
                path.join(__dirname, '../../node_modules'),
            ],
        },
    };
}

function getOutputConf(isProd, jsonpFn, distDir, publicPath) {
    if (!distDir) {
        return null;
    }
    return {
        // path: path.resolve(__dirname, '../../dist/static/vendor/'),
        path: path.resolve(distDir),
        filename: isProd ? '[name]_[chunkhash].dll.js' : '[name].dll.js',
        library: isProd ? '[name]_[chunkhash]' : '[name]',
        devtoolNamespace: 'dll_bundle',
        jsonpFunction: jsonpFn,
        publicPath,
    };
}

function getResolve(resolveObj, srcDir, clientNodeModules) {
    const resolveRes = Object.assign({}, {
        // 优先搜索当前src 目录，其次搜索node modules
        modules: [srcDir, clientNodeModules],
        alias: {},
        extensions: ['.js', '.json', '.jsx', 'ts', 'tsx', '.jpg', '.png', '.jpeg', '.webp', '.svg'],
        unsafeCache: true,
    }, resolveObj);
    if (srcDir) {
        resolveRes.modules.push(srcDir);
    }
    if (clientNodeModules) {
        resolveRes.modules.push(clientNodeModules);
    }
    return resolveRes;
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
    // if (modules && modules.rules && Array.isArray(modules.rules)) {
    //     return modules;
    // }
    const opts = Object.assign({}, {
        distVendor: '',
        assetDir: '',
        publicPath: '',
        sassIncludePath: [],
        isProd: false,
        fullCusConf: {},
        cssModulesTypeings: false,
    }, options);

    const mergeOpt = getMergeOptions(opts.fullCusConf);

    let resModule = {
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
                            name: () => (opts.isProd ? '[name]-[md5:hash:base58:6].[ext]' : '[name].[ext]'),
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
                    name: () => (opts.isProd ? '[name]-[md5:hash:base58:6].[ext]' : '[name].[ext]'),
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
                        loader: opts.cssModulesTypeings ? 'typings-for-css-modules-loader' : 'css-loader',
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
                        loader: opts.cssModulesTypeings ? 'typings-for-css-modules-loader' : 'css-loader',
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
        isProd: false,
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
            name: (opts.isProd ? '[name]_[chunkhash]' : '[name]'),
            // context: __dirname,
            context: opts.manifestConfDir,
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: opts.isProd ? '[name]-[contenthash:6].css' : '[name].css',
            chunkFilename: opts.isProd ? '[id]-[contenthash:6].css' : '[id].css',
        }),
        new ManifestPlugin({
            writeToFileEmit: true,
            publicPath: opts.publicPath,
            fileName: 'dll-assets-manifest.json',
            generate: (seed, files) => files.reduce((manifest, file) => Object.assign({},
                manifest, { [file.path]: file.name }), seed),
        }),
        new HardSourceWebpackPlugin(),
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
        baseConf.output = getOutputConf(opts.isProd, opts.jsonpFn,
            opts.distVendor, opts.publicPath);
        baseConf.entry = getEntry(opts.jsEntrys, opts.cssEntrys);
        baseConf.resolve = getResolve(opts.resolve, opts.srcDir, opts.clientNodeModules);
        baseConf.module = getModule({
            distVendor: opts.distVendor,
            assetDir: opts.assetDir,
            publicPath: opts.publicPath,
            sassIncludePath: opts.sassIncludePath,
            isProd: opts.isProd,
            fullCusConf: opts.fullCusConf,
            cssModulesTypeings: opts.cssModulesTypeings,
        }, opts.module);

        baseConf.plugins = getPlugin({
            distDir: opts.distDir,
            distVendor: opts.distVendor,
            manifestConfDir: opts.manifestConfDir,
            publicPath: opts.publicPath,
            isProd: opts.isProd,
        }, opts.plugins);
        return baseConf;
    },
};
