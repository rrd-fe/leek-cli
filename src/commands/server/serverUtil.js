

const util = require('../../utils/util');

module.exports = {
    // 获取server
    getServerPackage(leekConf) {
        if (!leekConf) {
            return;
        }
        return util.getPckageInfo(leekConf.leekServerDir);
    },
    getClientPackage(leekConf) {
        if (!leekConf) {
            return;
        }
        return util.getPckageInfo(leekConf.leekClientDir);
    },
};
