/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-03-31
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-03-31
 */
import pkg from '../../../package.json';
import Option from '../../base/Option';

let versionCmd = new Option({
    name: 'version',
    command: '-v, --version',
    description: '显示当前版本',
    actions: {
        "v;version": {
            action:function() {
                console.log("当前版本：", pkg.version);
            }
        }
    }
});

module.exports = versionCmd;
