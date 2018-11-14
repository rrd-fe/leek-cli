

// const path = require('path');
// const glob = require('glob');
// const fse = require('fs-extra');
// const chokidar = require('chokidar');
// const shelljs = require('shelljs');


const conf = require('../../config/conf');
const print = require('../../utils/print');
const bundle = require('./bundle');

const Command = require('../../base/Command');
const Option = require('../../base/Option');

function bundleAllModule(opts) {
    const options = Object.assign({}, opts);
    options.module = 'all';
    if (bundle.checkEnv() === false) {
        return;
    }
    print.out(conf.text.bundle.all.startComplie);
    // bundle dll
    bundle.bundleSource(options);
}

const bundleAll = new Command({
    name: 'all',
    description: '构建全部模块',
    command: 'all',
    action: (cmd, opts) => {
        // 启动服务 默认情况
        bundleAllModule(opts || {});
    },
});

bundleAll.addHelpSpec('构建项目全部模块');
bundleAll.addHelpExample('   leek bundle all');

bundleAll.addOption('env', new Option({
    name: 'env',
    command: '-e, --env',
    description: '设置当前运行的环境',
}));

bundleAll.addOption('noLoading', new Option({
    name: 'noLoading',
    command: '-n, --noLoading',
    description: '不显示loding',
}));


module.exports = bundleAll;
