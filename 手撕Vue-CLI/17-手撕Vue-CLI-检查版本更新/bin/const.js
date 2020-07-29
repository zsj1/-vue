const { version } = require('../package');
// console.log(process.env); // 获取环境变量
// console.log(process.platform);
const currentPlatformKey = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';  // 获取当前平台
const downloadDirPath = `${process.env[currentPlatformKey]}\\.nue-template`;  // 获取当前用户目录，临时存放下载下来的template，因为之后还要安装依赖，操作完成后再拷贝安装目录中
// console.log(downloadDirPath);
module.exports = {
  version,
  downloadDirPath,
};
