/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-04-17
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-04-17
 */

import Option from './Option';
import print from '../utils/print';
import util from '../utils/util';


class Command {
    constructor(cmd, cmds, options) {
        this.commands = {};
        this.options = {};
        this.$options = {};
        this.initHelpOpt();
        // 添加默认action
        this.addAction((cmdA, args) => {
            this.printHelp(cmdA, args);
        });

        if (cmd) {
            this.initCmd(cmd);
        }

        if (cmds) {
            this._mixCmds(cmds);
        }

        if (options) {
            this._mixOptions(cmds);
        }
    }

    initCmd(cmd) {
        if (!cmd) {
            return;
        }
        if (cmd.name) {
            this.addName(cmd.name);
        }
        if (cmd.description) {
            this.addDescription(cmd.description)
        }
        if (cmd.action) {
            this.addAction(cmd.action);
        }
        if (cmd.command) {
            this.addCmd(cmd.command);
        }
    }

    initHelpOpt() {
        let that = this;
        let helpOpt = new Option({
            name: 'help',
            command: '-h, --help',
            description: '帮助说明',
            action: this.printHelp
        });

        this._mixOptions({
            help: helpOpt
        });

        this.addOptionAction('h', (cmd, args) => {
            that.printHelp(cmd, args);
        });

        this.addOptionAction('help', (cmd, args) => {
            that.printHelp(cmd, args);
        });
    }

    _mixCmds(cmds) {
        if (!cmds) {
            return;
        }
        Object.keys(cmds).forEach((v, i) => {
            if (!this.commands[v] && cmds[v] instanceof Command) {
                this.commands[v] = cmds[v];
            }
        });
    }

    _mixOptions(opts) {
        if (!opts) {
            return;
        }
        Object.keys(opts).forEach((v, i) => {
            if (!this.options[v] && opts[v] instanceof Option) {
                this.options[v] = opts[v];
            }
        });
    }

    moveHelpOptToLast() {
        let prevHelp = this.options['help'];
        delete this.options['help'];
        this.options['help'] = prevHelp;
    }

    printHelp(cmd, args) {
        this._printStartHelp(cmd, args._.join(' '));
    }

    _printStartHelp(cmd, ccmd) {
        if (ccmd) {
            util.printCmdTitle(ccmd);
        }
        if (this.helpSpec) {
            print.out('说明: ' + this.helpSpec);
        }
        util.printCmdHelp(cmd);
        if (this.helpExample) {
            print.out('例子:');
            print.out(this.helpExample);
        }
    }

    addHelpSpec(spec) {
        this.helpSpec = spec;
    }

    addHelpExample(example) {
        this.helpExample = example;
    }

    getSubCmds() {
        return this.commands;
    }

    getOptions() {
        return this.options;
    }

    addSubCmd(cmd) {
        if (!cmd) {
            return;
        }
        if (cmd.name in this.commands) {
            return;
        }
        this.commands[cmd.name] = cmd;
    }

    addOption(name, opt) {
        this._mixOptions({
            [name]: opt,
        });
        this.moveHelpOptToLast();
    }

    addOptions(opts) {
        if (!opts) {
            return;
        }
        let that = this;
        Object.keys(opts).forEach((v, i) => {
            if (opts[v] instanceof Option) {
                that.addOption(v, opts[v]);
            } else {
                this.addOption(v, new Option(opts[v]));
            }
            let actions = opts[v].actions;
            if (actions) {
                Object.keys(actions).forEach((va, k) => {
                    that.addOptionAction(va, actions[va].action);
                });
            }
        });
        this.moveHelpOptToLast();
    }

    addSumCmds(cmds) {
        if (!cmds) {
            return;
        }
        let that = this;
        Object.keys(cmds).forEach((v, i) => {
            that.addSubCmd(cmds[v]);
        });
    }

    addAction(act) {
        this.action = act;
    }

    addCmd(cmd) {
        this.command = cmd;
    }

    addName(name) {
        this.name = name;
    }

    addDescription(description) {
        this.description = description;
    }

    addOptionAction(name, act) {
        if (!name || !act) {
            return;
        }
        if (!this.$options[name]) {
            this.$options[name] = {
                action: act,
            };
        }
    }

    updateOptionAction(actions) {
        if (!actions) {
            return;
        }
        Object.keys(actions).forEach((v) => {
            this.$options[v] = actions[v];
        });
    }
}

module.exports = Command;
