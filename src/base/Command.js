/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-04-17
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-04-17
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }] */

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
            this.addDescription(cmd.description);
        }
        if (cmd.action) {
            this.addAction(cmd.action);
        }
        if (cmd.command) {
            this.addCmd(cmd.command);
        }
    }

    initHelpOpt() {
        const helpOpt = new Option({
            name: 'help',
            command: '-h, --help',
            description: '帮助说明',
            action: this.printHelp,
        });

        this._mixOptions({
            help: helpOpt,
        });

        this.addOptionAction('h', (cmd, args) => {
            this.printHelp(cmd, args);
        });

        this.addOptionAction('help', (cmd, args) => {
            this.printHelp(cmd, args);
        });
    }

    _mixCmds(cmds) {
        if (!cmds) {
            return;
        }
        Object.keys(cmds).forEach((v) => {
            if (!this.commands[v] && cmds[v] instanceof Command) {
                this.commands[v] = cmds[v];
            }
        });
    }

    _mixOptions(opts) {
        if (!opts) {
            return;
        }
        Object.keys(opts).forEach((v) => {
            if (!this.options[v] && opts[v] instanceof Option) {
                this.options[v] = opts[v];
            }
        });
    }

    moveHelpOptToLast() {
        const prevHelp = this.options.help;
        delete this.options.help;
        this.options.help = prevHelp;
    }

    printHelp(cmd, args) {
        this._printStartHelp(cmd, args._.join(' '));
    }

    _printStartHelp(cmd, ccmd) {
        if (ccmd) {
            util.printCmdTitle(ccmd);
        }
        if (this.helpSpec) {
            print.out(`说明: ${this.helpSpec}`);
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
        if (opt.action) {
            this.addOptionAction(name, (cmd, args) => {
                opt.action(cmd, args);
            });
        }
        if (opt.actions) {
            Object.keys(opt.actions).forEach((v) => {
                if (!v) {
                    return;
                }
                v.split(';').forEach((sv) => {
                    if (sv) {
                        this.addOptionAction(sv, (...args) => {
                            if (opt.actions[v] && opt.actions[v].action) {
                                opt.actions[v].action(...args);
                            }
                        });
                    }
                });
            });
        }
        this.moveHelpOptToLast();
    }

    addOptions(opts) {
        if (!opts) {
            return;
        }
        const that = this;
        Object.keys(opts).forEach((v) => {
            if (opts[v] instanceof Option) {
                that.addOption(v, opts[v]);
            } else {
                this.addOption(v, new Option(opts[v]));
            }
        });
        this.moveHelpOptToLast();
    }

    addSumCmds(cmds) {
        if (!cmds) {
            return;
        }
        Object.keys(cmds).forEach((v) => {
            this.addSubCmd(cmds[v]);
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
            if (!v) {
                return;
            }
            v.split(';').forEach((ov) => {
                if (ov) {
                    this.$options[ov] = actions[v];
                }
            });
        });
    }
}

module.exports = Command;
