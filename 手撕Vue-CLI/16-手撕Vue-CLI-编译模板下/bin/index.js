#! /usr/bin/env node
const program = require('commander');
const path = require('path');
const { version } = require('./const');

const commandMap = {
  create: {
    alias: 'c',
    description: 'create a new project powered by vue-cli-service',
    example: 'nue-cli create <app-name>',
  },
  add: {
    alias: 'a',
    description: 'install a plugin and invoke its generator in an already created project',
    example: 'nue-cli add [options] <plugin> [pluginOptions]',
  },
  '*': {
    alias: '',
    description: '',
    example: '',
  },
};
// 2.添加自定义指令
Reflect.ownKeys(commandMap).forEach((key) => {
  const value = commandMap[key];
  program
    .command(key) // 指令名称
    .alias(value.alias) // 指令简写
    .description(value.description) // 指令描述
    .action(() => { // 指令具体的操作
      if (key === '*') {
        console.log('指令不存在');
      } else {
        // console.log(value.description);
        // console.log(process.argv.splice(3));
        require(path.resolve(__dirname, key))(...process.argv.splice(3));
      }
    });
});
// 3.添加帮助示例展示
program.on('--help', () => {
  console.log('Example:');
  Reflect.ownKeys(commandMap).forEach((key) => {
    const value = commandMap[key];
    console.log(`  ${value.example}  `);
  });
});
// 1.使用commander添加版本号和帮助
program.version(version).parse(process.argv);
