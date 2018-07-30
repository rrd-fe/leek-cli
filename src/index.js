/**
* @Author: dushaobin <rrd>
* @Date:   2017-03-28
* @Email:  dushaobin@we.com
* @Project: wern
* @Last modified by:   rrd
* @Last modified time: 2017-03-31
*/

const init = require('./commands/init');
const whoami = require('./commands/whoami');
const server = require('./commands/server');


module.exports = {
    init,
    whoami,
    server,
};
