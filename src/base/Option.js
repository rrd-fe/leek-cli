/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-04-17
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-04-17
 */

class Option {
    constructor(opt) {
        if (!opt) {
            return;
        }
        this.action = opt.action;
        this.name = '';
        this.description = '';
        this.command = ''; // 支持的参数
        this.actions = {};

        if (opt.name) {
            this.updateName(opt.name);
        }
        if (opt.description) {
            this.updateDescription(opt.description);
        }
        if (opt.command) {
            this.updateCmd(opt.command);
        }
        if (opt.actions) {
            this.updateAction(opt.actions);
        }
    }

    updateAction(act) {
        if (!act) {
            return;
        }
        this.actions = Object.assign({}, this.actions, act);
    }

    updateName(name) {
        this.name = name;
    }

    updateDescription(description) {
        this.description = description;
    }

    updateCmd(cmd) {
        this.command = cmd;
    }
}

module.exports = Option;
