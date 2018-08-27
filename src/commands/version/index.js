/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-03-31
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-03-31
 */

const Option = require('../../base/Option');
const print = require('../../utils/print');
const util = require('../../utils/util');
const pkg = require('../../../package.json');
const conf = require('../../config/conf');

const versionOpt = new Option({
    name: 'version',
    command: '-v, --version',
    description: '显示当前版本',
    actions: {
        'v;version': {
            action: () => {
                print.out(`${conf.cons.projectShowName.toLocaleLowerCase()}   版本：`, pkg.version);
                print.out('node       版本：', process.versions.node);
                print.out('npm        版本：', util.getNpmVersion().stdout.replace(/\n/, ''));
                print.out('yarn       版本：', util.getYarnVersion().stdout.replace(/\n/, ''));
            },
        },
    },
});

module.exports = versionOpt;
