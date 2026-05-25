function _processStage({
  state,
  group,
  container,
  name,
  result
}) {

  group[container][name] = result;

  state.issues.push(
    ...(result?.issues || [])
  );
}


module.exports = {
  _processStage
};
