const {Stage} = require('../all/const/issue');




const isCommitStage = (stage) => stage === Stage.COMMIT;
const isRequestStage = (stage) => stage === Stage.REQUEST;
const isMergeStage = (stage) => stage === Stage.MERGE;



module.exports = {
  isCommitStage,
  isRequestStage,
  isMergeStage
}
