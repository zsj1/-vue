const axios = require('axios');
const ora = require('ora');
const inquirer = require('inquirer');
let DownloadGitRepo = require('download-git-repo');
// 通过NodeJS的util中的promisify方法, 可以快速的将回调函数的API转换成Promise的API
const { promisify } = require('util');
const { downloadDirPath } = require('./const');

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

module.exports = async (projectName) => {
  // 1.拉取所有模板名称
  const data = await waitLoading('downloading template names', getTemplateNames)();
  const templateNames = data.map((obj) => obj.name);

  // 2.让用户选择指定的模板名称
  const { currentTemplateName } = await inquirer.prompt({
    name: 'currentTemplateName',
    type: 'list',
    choices: templateNames,
    message: '请选择要使用哪个模板来创建项目',
  });

  // 3.获取用户指定模板的所有版本号
  const data2 = await waitLoading('downloading template tags', getTemplateTags)(currentTemplateName);
  const templateTags = data2.map((obj) => obj.name);

  // 4.让用户选择使用指定模板的哪一个版本来创建项目
  const { currentTemplateTag } = await inquirer.prompt({
    name: 'currentTemplateTag',
    type: 'list',
    choices: templateTags,
    message: '请选择要使用选择模板的哪一个版本来创建项目',
  });
  /*
  1.如何从github下载模板?
  我们可以借助 download-git-repo 这个库来下载我们指定的模板
  * */

  // 5.下载用户选择的模板
  const destPath = await waitLoading('downloading template', downloadTemplate)(currentTemplateName, currentTemplateTag);
  console.log(destPath);
};
