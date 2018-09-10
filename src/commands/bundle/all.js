

const path = require('path');
const glob = require('glob');
const fse = require('fs-extra');
const chokidar = require('chokidar');
const shelljs = require('shelljs');


const util = require('../../utils/util');
const print = require('../../utils/print');
const conf = require('../../config/conf');

const Command = require('../../base/Command');
const Option = require('../../base/Option');

function bundleAllModule() {
    // bundle dll

    // bundle common

    // bundle other module
    
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

bundleAll.addHelpSpec('构建全部模块');
bundleAll.addHelpExample('   grn bundle all');

bundleAll.addOption('env', new Option({
    name: 'env',
    command: '-e, --env',
    description: '设置当前运行的环境',
}));

module.exports = bundleAll;
