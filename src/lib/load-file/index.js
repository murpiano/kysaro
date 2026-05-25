const {_loadFile: loadFile} = require('./load-file');
const {_loadFileBase: loadFileBase} = require('./load-file-base');
const {_resolveResources: resolveResources} = require('./resolve-resources');

module.exports = {
  loadFile,
  loadFileBase,
  resolveResources
}
