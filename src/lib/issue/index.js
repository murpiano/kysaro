const {_createIssue: createIssue} = require('./issue');
const {_createLoaderIssue: createLoaderIssue} = require('./loader/create-loader-issue');
const {_createLoadFileIssue: createLoadFileIssue} = require('./load-file/create-load-file-issue');
const {_createDependencyLoadIssue: createDependencyLoadIssue} = require('./loader/create-dependency-load-issue');
const {_mapLoaderIssueBySource: mapLoaderIssueBySource} = require('./loader/map-loader-issue-by-source');
const {_createLoaderValidationIssue: createLoaderValidationIssue} = require('./loader/create-loader-validation-issue');


module.exports = {
  createIssue,
  createLoaderIssue,
  createLoadFileIssue,
  createLoaderValidationIssue,
  createDependencyLoadIssue,
  mapLoaderIssueBySource
};
