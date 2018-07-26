#!/usr/bin/env node

var Liftoff = require('liftoff');

const cwd = process.cwd();

const invoke = function (env) {
    console.log('my environment is:', env);
    console.log('my liftoff config is:', this);
}

var cli = new Liftoff({
    name: 'grn',
    processTitle: 'grape-rn-cli',
    configName: '.grn',
    extensions: {
        'rc': null
    },
    v8flags: ['--harmony'],
    completions:completions
});

function completions(){
    console.log('completions 完成');
}

cli.launch({
    cwd: cwd,
},invoke);

console.log('hello word global cli');
