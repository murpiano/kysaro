const fs = require('fs');
const path = require('path');
const {COMMIT_TYPE} = require("./const/const");


function resolveCommitType(manualType) {
  if (manualType != null) {
    return manualType;
  }

  const isRequestRuntime = process.env.GITHUB_EVENT_NAME === COMMIT_TYPE.REQUEST;

  if (isRequestRuntime) {
    return COMMIT_TYPE.REQUEST;
  }

  const mergeHeadPath = path.join(process.cwd(), '.git', 'MERGE_HEAD'
  );

  const isMergeRuntime = fs.existsSync(mergeHeadPath);

  if (isMergeRuntime) {
    return COMMIT_TYPE.MERGE;
  }

  return COMMIT_TYPE.COMMIT;
}

module.exports = {
  resolveCommitType
};
