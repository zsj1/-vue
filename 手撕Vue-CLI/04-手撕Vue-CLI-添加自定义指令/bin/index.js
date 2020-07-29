#! /usr/bin/env node
const program = require('commander');
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
// Reflect.ownKeys(commandMap) [create, add, *]
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
        console.log(value.description);
      }
    });
});
program.on('--help', () => {
  console.log('Example:');
  Reflect.ownKeys(commandMap).forEach((key) => {
    const value = commandMap[key];
    console.log(`  ${value.example}  `);
  });
});
/*
program
  .command('create') // 指令名称
  .alias('c') // 指令简写
  .description('create a new project powered by vue-cli-service') // 指令描述
  .action(() => { // 指令具体的操作
    console.log('创建一个Vue项目');
  });
program.on('--help', () => {
  console.log('Example:');
  console.log('  nue-cli create <app-name>  ');
});
 */
// 1.使用commander添加版本号和帮助
program.version(version).parse(process.argv);
