const path =require('path');

const defaultSettings = require('./settings');

const ConfigPaths = {
  user: path.join(process.cwd(), '.bvtrots-dx', 'settings'),
  default: defaultSettings.path
}

const LoaderReport = {
  dirName  : '.bvtrots-dx',
  fileName : 'LoaderReport.md',
}

const reportPath = path.join(process.cwd(), LoaderReport.dirName, LoaderReport.fileName);

module.exports ={
  ConfigPaths,
  reportPath
}
