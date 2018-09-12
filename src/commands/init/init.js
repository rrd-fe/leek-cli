

const inquirer = require('inquirer');
const fse = require('fs-extra');
const path = require('path');

// 初始化项目，选择项目的默认配置

// module.exports = {
//     prefix: '',
//     publicPath: '',
//     dist: '',
//     clientAlias: '',
//     isInlineCss: false,
//     leekManifsetDir: './.leek-manifest/',
//     projectType: 'react', // react、 vue、 jquery (第一版仅支持 react)
//     plugin: {
//         babel: {
//             enable: true,
//             options: {}
//         }
//     },
//     dll: {
//         entry: {
//             commonDll: vendors,
//             commonCss: [''],
//         },
//         module: [
//             'jquery',
//             'react',
//             'react-dom',
//         ],
//     },
//     common: {
//         resolveDir: [],
//         extensions: [],
//     },
//     page: {
//         resolveDir: [],
//         extensions: [],
//     },
//     ssr: {
//         ssrDir: '',
//     },
//     includeNodeModules: ['react', '@we-fe/component1'],
//     exclude:['moduleName/pageName'],
//     beforeLoadPage: () => {},
//     afterLoadPage: () => {},
//     beforeBuild: () => {},
//     afterBuild: () => {},
// }


function askQuestion(v) {
    const astOpt = Object.assign({}, v);
    return inquirer.prompt(astOpt).then(res => res);
}

const questionList = [
    {
        name: 'projectType',
        message: '项目类型 (当前版本仅支持react)',
        type: 'list',
        default: 0,
        choices: ['react', 'vue', 'raw'],
    },
    {
        name: 'prefix',
        message: '项目访问前缀:',
        default: '',
    },
    {
        name: 'publicPath',
        message: '项目的publicPath:',
        default: '/',
    },
    {
        name: 'dist',
        message: '项目打包输出地址:',
        default: '../../dist',
    },
    {
        name: 'clientAlias',
        message: '项目客户端目录:',
        default: 'client',
    },
    {
        name: 'isInlineCss',
        message: '是否把css打包为内联',
        type: 'list',
        default: 1,
        choices: ['true', 'false'],
    },
    {
        name: 'leekConfig',
        message: 'leek项目配置目录',
        default: './.leekConfig/',
    },
    {
        name: 'leekWebpackConfigDir',
        message: 'leek自定义配置webpack目录',
        default: '{{leekConfig}}/webpack/',
    },
    {
        name: 'leekManifsetDir',
        message: 'leek打包生成的manifest存放的目录',
        default: '{{leekConfig}}/manifest/',
    },
];

function eachQuestion(questions, callback) {
    let prom = Promise.resolve();
    questions.forEach((v) => {
        prom = prom.then((res) => {
            if (callback) {
                callback(res);
            }
            return askQuestion(v);
        });
    });
    return prom;
}

function initDir(distPath) {
    if (fse.existsSync(distPath)) {
        fse.emptyDirSync(distPath);
    } else {
        fse.mkdirpSync(distPath);
    }
}

// 当前运行的目录
function isInitToServer(gloConfig) {
    // 读取当前运行的所有目录，如果包含clientAlias 则运行在server 中 否则运行在 client中 目前仅支持 这两种情况
    // 对于client 如果包含 client 目录的情况，不符合当前的规定，运行则出现异常

    // 检查当前运行环境，是在client 还是 在server
    const dirs = fse.readdirSync(path.resolve(process.cwd()));
    let isServer = false;
    dirs.forEach((v) => {
        if (v) {
            const vdirs = v.split(path.sep);
            if (vdirs[vdirs.length - 1].indexOf(gloConfig.clientAlias) >= 0) {
                isServer = true;
            }
        }
    });
    return isServer;
}

module.exports = {
    isInitToServer,
    initDir,
    eachQuestion,
    questionList,
};
