const axios = require('axios');
const ora = require('ora');
const inquirer = require('inquirer');
let DownloadGitRepo = require('download-git-repo');
// 通过NodeJS的util中的promisify方法, 可以快速的将回调函数的API转换成Promise的API
const { promisify } = require('util');
const path = require('path');
let ncp = require('ncp');
const shell = require('shelljs');
const chalk = require('chalk');
const fs = require('fs');
let { render } = require('consolidate').ejs;

render = promisify(render);

const exec = promisify(shell.exec);
const Metalsmith = require('metalsmith');
const { downloadDirPath } = require('./const');

ncp = promisify(ncp);
DownloadGitRepo = promisify(DownloadGitRepo);

const getTemplateNames = async () => {
  const { data } = await axios.get('https://api.github.com/orgs/it666-com/repos');
  return data;
};
const getTemplateTags = async (currentTemplateName) => {
  const { data } = await axios.get(`https://api.github.com/repos/it666-com/${currentTemplateName}/tags`);
  return data;
};
const waitLoading = (message, fn) => async (...args) => {
  const spinner = ora(message);
  spinner.start();
  const data = await fn(...args);
  spinner.succeed(`${message} successfully`);
  return data;
};
const downloadTemplate = async (templateName, templateTag) => {
  // 组织机构的名称/模板名称#模板版本号
  // 1.拼接模板在github上的路径
  let url = `it666-com/${templateName}`;
  if (templateTag) {
    url += `#${templateTag}`;
  }
  // 2.拼接存储下载好的模板的路径
  const destPath = `${downloadDirPath}\\${templateName}`;
  // 3.下载模板
  await DownloadGitRepo(url, destPath);
  // 4.将保存模板的路径返回给调用者
  return destPath;
};
const installDependencies = async (projectName) => {
  // 1.进入创建的项目目录
  shell.cd(projectName);
  // 2.执行Npm install指令
  await exec('npm install');
};

module.exports = async (projectName) => {
  // const destPath = path.resolve(projectName);
  // console.log(chalk.green('✨  Creating project in ') + chalk.red(`${destPath}`));
  // // 1.拉取所有模板名称
  // const data = await waitLoading('downloading template names', getTemplateNames)();
  // const templateNames = data.map((obj) => obj.name);
  //
  // // 2.让用户选择指定的模板名称
  // const { currentTemplateName } = await inquirer.prompt({
  //   name: 'currentTemplateName',
  //   type: 'list',
  //   choices: templateNames,
  //   message: '请选择要使用哪个模板来创建项目',
  // });
  //
  // // 3.获取用户指定模板的所有版本号
  // const data2 = await waitLoading('downloading template tags', getTemplateTags)(currentTemplateName);
  // const templateTags = data2.map((obj) => obj.name);
  //
  // // 4.让用户选择使用指定模板的哪一个版本来创建项目
  // const { currentTemplateTag } = await inquirer.prompt({
  //   name: 'currentTemplateTag',
  //   type: 'list',
  //   choices: templateTags,
  //   message: '请选择要使用选择模板的哪一个版本来创建项目',
  // });
  //
  // // 5.下载用户选择的模板
  // console.log(chalk.green('✨  Initializing git repository...'));
  // const sourcePath = await waitLoading('downloading template', downloadTemplate)(currentTemplateName, currentTemplateTag);

  const sourcePath = 'C:\\Users\\Jonathan_Lee\\.nue-template\\vue-advanced-template';
  const destPath = path.resolve(projectName);
  const askPath = path.join(sourcePath, 'ask.js');
  if (!fs.existsSync(askPath)) {
    // 6.将用户目录中的模板拷贝到执行指令的路径中
    await waitLoading('copying template', ncp)(sourcePath, destPath);
  } else {
    await new Promise((resolve, reject) => {
      Metalsmith(__dirname)
        .source(sourcePath) // 告诉Metalsmith真正需要遍历的目录是谁
        .destination(destPath) // 告诉Metalsmith编译完的文件放到什么地方
        .use(async (files, metal, done) => {
          // 1.让用户填写配置信息
          const config = require(askPath);
          const result = await inquirer.prompt(config);
          const meta = metal.metadata();
          Object.assign(meta, result);
          done();
        })
        .use((files, metal, done) => {
          const result = metal.metadata();
          // 2.根据用户填写的配置信息编译模板
          // 2.1遍历拿到所有文件路径
          Reflect.ownKeys(files).forEach(async (filePath) => {
            // 2.2提取我们需要处理的问题
            if (filePath.includes('.js') || filePath.includes('.json')) {
              // 2.3获取当前文件的内容
              const fileContent = files[filePath].contents.toString();
              // 2.4判断当前文件的内容是否需要编译
              if (fileContent.includes('<%')) {
                const resultContent = await render(fileContent, result);
                files[filePath].contents = Buffer.from(resultContent);
              }
            }
          });
          done();
        })
        .build((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
    });
  }

  // 7.安装相关的依赖
  // console.log(chalk.green('✨  Initializing dependencies...'));
  // await waitLoading('install dependencies', installDependencies)(projectName);

  // 8.显示创建成功之后的提示信息
  console.log(chalk.green(' Successfully created project ') + chalk.red(`${projectName}.`));
  console.log(chalk.green(' Get started with the following commands:'));
  console.log(chalk.magenta(`$ cd ${projectName}`));
  console.log(chalk.magenta('$ npm run serve'));
};
