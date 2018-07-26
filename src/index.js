/**
* @Author: dushaobin <rrd>
* @Date:   2017-03-28
* @Email:  dushaobin@we.com
* @Project: wern
* @Last modified by:   rrd
* @Last modified time: 2017-03-31
*/

const login = require('./commands/login');
const logout = require('./commands/logout');

const release = require('./commands/release');
const bundle = require('./commands/bundle');

const init = require('./commands/init');
const whoami = require('./commands/whoami');
const qrcode = require('./commands/qrcode');

const runIos = require('./commands/run-android');
const runAndroid = require('./commands/run-ios');


module.exports = {
    login,
    logout,
    release,
    bundle,
    init,
    whoami,
    qrcode,
    runIos,
    runAndroid,
};
