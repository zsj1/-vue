const { version } = require('../package');
// console.log(process.env);
// console.log(process.platform);
const currentPlatformKey = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
const downloadDirPath = `${process.env[currentPlatformKey]}\\.nue-template`;
// console.log(downloadDirPath);
module.exports = {
  version,
  downloadDirPath,
};
