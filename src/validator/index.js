const checkHeader = require('./checks/header');
const checkTypeScope = require('./checks/typeScope');
const checkBody = require('./checks/body');

module.exports = (parsed, context) => {
  const { settings } = context;
  const header = parsed.header || '';
  const isMergeType = parsed.type === 'merge';
  const hasHashtag = /#\d+$/.test(header);

  let conf;
  if (isMergeType && hasHashtag) {
    conf = settings.merge_commit;
  } else if (isMergeType) {
    conf = settings.pull_request;
  } else {
    conf = settings.standard_commit;
  }

  const headerRes = checkHeader(parsed, conf, settings);
  if (!headerRes[0]) return headerRes;

  const typeScopeRes = checkTypeScope(parsed, context);
  if (!typeScopeRes[0]) return typeScopeRes;

  const bodyRes = checkBody(parsed, conf, context);
  if (!bodyRes[0]) return bodyRes;

  return [true];
};
