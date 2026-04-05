const {runLoader} = require('./lib/loader');
const defaultSettings           = require('./settings');
const {ConfigPaths, reportPath} = require('./config');

const fileNames = defaultSettings.keys;

const loader = runLoader(fileNames, ConfigPaths, reportPath);

console.log(loader.ok);
console.log(loader.settings);
