const {_readJson} = require('./read-json');
const {mapLoaderIssueBySource} = require('../issue');

function _loadFileBase({source, filePath, severity, entity}) {
  const loaded = _readJson(filePath);

  loaded.issues = loaded.issues.map(issue =>
    mapLoaderIssueBySource({issue, source, severity, entity}));

  return {
    ...loaded,
    source,
    meta: {
      ...(loaded.meta || {}), source
    }
  };
}


module.exports = {
  _loadFileBase
};
